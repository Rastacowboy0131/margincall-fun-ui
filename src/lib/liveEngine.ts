/* ------------------------------------------------------------------ *
 * The LIVE engine. Same public surface as the demo Engine
 * (src/lib/engine.ts) so useReel can drive either one, but the state
 * comes from the real world: round lifecycle and price ticks over the
 * operator websocket, money via the chain adapter, results from the
 * settled-rounds feed. Phase mapping onto the demo's three phases:
 *
 *   ws round_open  (betting window)  -> 'intermission'  (buys allowed)
 *   ws round_locked / tick           -> 'live'          (cashout allowed)
 *   ws rug / round_settled           -> 'called', then back to
 *   ws cooldown                      -> 'intermission' visuals
 *
 * The one honest difference from paper: a live buy is a transaction.
 * userBuy() returns true when the tx was dispatched and the position
 * shows as 'queued' until the receipt confirms it, exactly like a
 * queued paper order fills at the open.
 * ------------------------------------------------------------------ */

import type { Activity, Candle, HistoryRow, Player, QueuedRound, Result, RoundPhase, Ticker } from '../data/types'
import type { SessionStats } from '../data/types'
import { TICKERS } from '../data/sample'
import type { Account, YouState } from './engine'
import { OPERATOR_WS, OPERATOR_HTTP } from './live/config'
import { buyLive, cashOutLive, readBalanceEth, readRoundState } from './live/chain'
import { getAddress } from './mode'

const MAX_PAYOUT_X = 25
const EDGE_KEEP = 0.98
const TICKS_PER_CANDLE = 4 // broadcast ticks (100ms each) per candle
const CALLED_MS = 3600

const ROTATION: { ticker: Ticker; leverage: number }[] = [
  { ticker: TICKERS.NVDAx, leverage: 20 },
  { ticker: TICKERS.AAPLx, leverage: 5 },
  { ticker: TICKERS.GMEx, leverage: 5 },
  { ticker: TICKERS.AMZNx, leverage: 5 },
  { ticker: TICKERS.HOODx, leverage: 20 },
  { ticker: TICKERS.TSLAx, leverage: 25 },
]

function tickerFor(roundId: number) {
  return ROTATION[roundId % ROTATION.length]
}

function timeLabel(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

const YOU_TINT = '#ffc247'
const HISTORY_KEY = 'mcfun.live.history.v1'

function loadHistory(): HistoryRow[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as HistoryRow[]).slice(0, 30) : []
  } catch {
    return []
  }
}

interface WsMsg {
  type: string
  [k: string]: unknown
}

export class LiveEngine {
  phase: RoundPhase = 'intermission'
  roundId = 0
  ticker: Ticker = ROTATION[0].ticker
  leverage = ROTATION[0].leverage
  currentX = 1
  ruggedAtX: number | null = null
  results: Result[] = []
  queue: QueuedRound[] = []
  feed: Activity[] = []
  candles: Candle[] = []
  prevCandles: Candle[] = []
  you: YouState = { status: 'idle', stakeEth: 0, entryX: null, exitX: null, openedAtLabel: '' }
  /** Live "account": buying power is the wallet balance; history is
   *  this browser's settled live positions. */
  account: Account = {
    buyingPowerEth: 0,
    netPnlEth: 0,
    roundsPlayed: 0,
    wins: 0,
    bestExitX: null,
    worstCalledAtX: null,
    history: typeof window === 'undefined' ? [] : loadHistory(),
  }
  /** Live entrants seen on the ws feed this round. */
  private entrants = new Map<string, { amountEth: number; status: 'holding' | 'out' | 'called' }>()
  maxStakeEth = 0
  windowEndsAt = 0
  nextOpensAt = 0
  lastError: string | null = null

  private ws: WebSocket | null = null
  private listeners = new Set<() => void>()
  private feedSeq = 0
  private liveStartMs = 0
  private calledUntil = 0
  private curTickBuf: number[] = []
  private balanceTimer: number | null = null
  private reconnectDelay = 1000
  private stopped = true

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    this.start()
    return () => this.listeners.delete(fn)
  }

  private emit(): void {
    for (const fn of this.listeners) fn()
  }

  start(): void {
    if (!this.stopped) return
    this.stopped = false
    this.connect()
    void this.refreshBalance()
    void this.loadResults()
    void this.syncChainEntry()
    this.balanceTimer = window.setInterval(() => void this.refreshBalance(), 12_000)
  }

  stop(): void {
    this.stopped = true
    this.ws?.close()
    this.ws = null
    if (this.balanceTimer !== null) window.clearInterval(this.balanceTimer)
    this.balanceTimer = null
  }

  /* ---- websocket ---------------------------------------------------- */

  private connect(): void {
    if (this.stopped) return
    const ws = new WebSocket(OPERATOR_WS)
    this.ws = ws
    ws.onmessage = (ev) => {
      try {
        this.onMsg(JSON.parse(String(ev.data)) as WsMsg)
      } catch { /* malformed frame */ }
    }
    ws.onopen = () => {
      this.reconnectDelay = 1000
    }
    ws.onclose = () => {
      if (this.stopped) return
      window.setTimeout(() => this.connect(), this.reconnectDelay)
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 15_000)
    }
  }

  private onMsg(m: WsMsg): void {
    switch (m.type) {
      case 'hello': {
        const st = (m.state ?? {}) as { status?: string; round?: { roundId?: string } | null }
        if (st.round?.roundId) this.setRound(Number(st.round.roundId))
        if (st.status === 'live') this.phase = 'live'
        break
      }
      case 'round_open': {
        this.setRound(Number(m.roundId))
        this.phase = 'intermission'
        this.prevCandles = this.candles
        this.candles = []
        this.curTickBuf = []
        this.currentX = 1
        this.ruggedAtX = null
        this.entrants.clear()
        this.windowEndsAt = Number(m.windowEndsAt) * 1000
        this.maxStakeEth = Number(m.maxStake) / 1e18
        break
      }
      case 'player_entered': {
        const addr = String(m.player)
        const amountEth = Number(m.amount) / 1e18
        this.entrants.set(addr.toLowerCase(), { amountEth, status: 'holding' })
        const self = getAddress()?.toLowerCase()
        if (addr.toLowerCase() !== self) {
          this.pushFeed({ handle: short(addr), tint: tintFor(addr), action: 'bought', atX: 1, entryX: null, pnlEth: null })
        }
        break
      }
      case 'round_locked': {
        this.phase = 'live'
        this.liveStartMs = Date.now()
        this.currentX = 1
        // a queued (confirmed) entry fills at the 1.00x open
        if (this.you.status === 'queued') {
          this.you = { ...this.you, status: 'in', entryX: 1.0, openedAtLabel: timeLabel() }
          this.pushFeed({ handle: 'you', tint: YOU_TINT, action: 'bought', atX: 1.0, entryX: null, pnlEth: null })
        }
        break
      }
      case 'tick': {
        if (this.phase !== 'live') {
          this.phase = 'live'
          if (this.liveStartMs === 0) this.liveStartMs = Date.now()
        }
        const mult = Number(m.multiple)
        this.currentX = mult
        this.curTickBuf.push(mult)
        if (this.curTickBuf.length >= TICKS_PER_CANDLE) this.flushCandle()
        break
      }
      case 'rug': {
        this.flushCandle()
        this.candles.push({ openX: this.currentX, highX: this.currentX, lowX: 0.02, closeX: 0.02 })
        this.rugNow(this.currentX)
        break
      }
      case 'round_settled': {
        const rugMultiple = typeof m.rugMultiple === 'number' ? m.rugMultiple : this.currentX
        if (this.phase === 'live') this.rugNow(rugMultiple)
        this.pushResult(Number(m.roundId), rugMultiple)
        break
      }
      case 'cooldown': {
        this.nextOpensAt = Number(m.nextRoundOpensAt) * 1000
        if (this.phase === 'called' && Date.now() >= this.calledUntil) this.phase = 'intermission'
        if (this.phase === 'live') this.phase = 'intermission'
        break
      }
    }
    this.emit()
  }

  private flushCandle(): void {
    if (this.curTickBuf.length === 0) return
    const seg = this.curTickBuf
    const open = this.candles.length > 0 ? this.candles[this.candles.length - 1].closeX : 1.0
    this.candles.push({
      openX: open,
      highX: Math.max(open, ...seg),
      lowX: Math.min(open, ...seg),
      closeX: seg[seg.length - 1],
    })
    this.curTickBuf = []
  }

  private rugNow(rugX: number): void {
    this.phase = 'called'
    this.ruggedAtX = rugX
    this.calledUntil = Date.now() + CALLED_MS
    const self = getAddress()?.toLowerCase()
    for (const [addr, e] of this.entrants) {
      if (addr === self) continue // your outcome is tracked in `you`, not here
      if (e.status === 'holding') {
        e.status = 'called'
        this.pushFeed({ handle: short(addr), tint: tintFor(addr), action: 'called', atX: rugX, entryX: 1, pnlEth: -e.amountEth })
      }
    }
    if (this.you.status === 'in') {
      this.pushFeed({ handle: 'you', tint: YOU_TINT, action: 'called', atX: rugX, entryX: this.you.entryX, pnlEth: -this.you.stakeEth })
      this.settleRow('called', null, -this.you.stakeEth)
      this.you = { ...this.you, status: 'called', exitX: null }
    } else if (this.you.status === 'queued') {
      // tx never confirmed into the round, or the window closed on us
      this.you = { status: 'idle', stakeEth: 0, entryX: null, exitX: null, openedAtLabel: '' }
    }
    window.setTimeout(() => {
      if (this.phase === 'called' && Date.now() >= this.calledUntil) {
        this.phase = 'intermission'
        if (this.you.status === 'out' || this.you.status === 'called') {
          this.you = { status: 'idle', stakeEth: 0, entryX: null, exitX: null, openedAtLabel: '' }
        }
        this.emit()
      }
    }, CALLED_MS + 50)
  }

  private setRound(id: number): void {
    if (id === this.roundId) return
    this.roundId = id
    const r = tickerFor(id)
    this.ticker = r.ticker
    this.leverage = r.leverage
    if (this.you.status === 'out' || this.you.status === 'called') {
      this.you = { status: 'idle', stakeEth: 0, entryX: null, exitX: null, openedAtLabel: '' }
    }
  }

  private pushResult(roundId: number, rugMultiple: number): void {
    if (this.results.some((r) => r.roundId === roundId)) return
    const r = tickerFor(roundId)
    this.results = [
      { roundId, ruggedAtX: rugMultiple, ticker: r.ticker.symbol, leverage: r.leverage },
      ...this.results,
    ].slice(0, 14)
  }

  /* ---- data bootstraps ----------------------------------------------- */

  private async loadResults(): Promise<void> {
    try {
      const res = await fetch(`${OPERATOR_HTTP}/results`)
      const body = (await res.json()) as { results: { roundId: string; rugMultiple: number }[] }
      for (const row of [...body.results].reverse()) {
        this.pushResult(Number(row.roundId), row.rugMultiple)
      }
      this.emit()
    } catch { /* results are cosmetic on boot */ }
  }

  private async refreshBalance(): Promise<void> {
    const addr = getAddress()
    if (!addr) return
    try {
      const bal = await readBalanceEth(addr)
      if (bal !== this.account.buyingPowerEth) {
        this.account = { ...this.account, buyingPowerEth: bal }
        this.emit()
      }
    } catch { /* transient RPC */ }
  }

  /** On boot, adopt an existing on-chain entry (e.g. after a reload). */
  private async syncChainEntry(): Promise<void> {
    const addr = getAddress()
    if (!addr) return
    try {
      const st = await readRoundState(addr)
      this.maxStakeEth = st.maxStakeEth
      if (st.entry && !st.entry.cashedOut && !st.entry.refunded && (st.phase === 'open' || st.phase === 'live')) {
        this.setRound(st.roundId)
        this.you = {
          status: st.phase === 'open' ? 'queued' : 'in',
          stakeEth: st.entry.stakeEth,
          entryX: st.phase === 'live' ? 1.0 : null,
          exitX: null,
          openedAtLabel: timeLabel(),
        }
        this.emit()
      }
    } catch { /* transient RPC */ }
  }

  /* ---- account log ---------------------------------------------------- */

  private settleRow(outcome: 'sold' | 'called', exitX: number | null, pnlEth: number): void {
    const a = this.account
    const row: HistoryRow = {
      roundId: this.roundId,
      ticker: this.ticker.symbol,
      leverage: this.leverage,
      side: 'long',
      stakeEth: this.you.stakeEth,
      entryX: this.you.entryX ?? 1,
      exitX,
      ruggedAtX: this.ruggedAtX ?? this.currentX,
      pnlEth,
      outcome,
      timeLabel: timeLabel(),
    }
    const exitPayout = outcome === 'sold' && exitX !== null ? exitX : null
    this.account = {
      ...a,
      netPnlEth: a.netPnlEth + pnlEth,
      roundsPlayed: a.roundsPlayed + 1,
      wins: a.wins + (outcome === 'sold' && pnlEth > 0 ? 1 : 0),
      bestExitX: exitPayout !== null && (a.bestExitX === null || exitPayout > a.bestExitX) ? Math.min(MAX_PAYOUT_X, exitPayout) : a.bestExitX,
      worstCalledAtX:
        outcome === 'called' && (a.worstCalledAtX === null || (this.ruggedAtX ?? 0) < a.worstCalledAtX)
          ? this.ruggedAtX ?? this.currentX
          : a.worstCalledAtX,
      history: [row, ...a.history].slice(0, 30),
    }
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.account.history))
    } catch { /* quota */ }
  }

  resetAccount(): void {
    this.account = { ...this.account, history: [], netPnlEth: 0, roundsPlayed: 0, wins: 0, bestExitX: null, worstCalledAtX: null }
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch { /* quota */ }
    this.emit()
  }

  /* ---- user actions ---------------------------------------------------- */

  /** Live buy: real tx during the betting window. Returns true when the
   *  tx was dispatched; the ticket shows 'queued' until it confirms. */
  userBuy(stakeEth: number): boolean {
    const addr = getAddress()
    if (!addr) return false
    if (!(stakeEth > 0) || !Number.isFinite(stakeEth)) return false
    if (this.you.status !== 'idle' && this.you.status !== 'out') return false
    if (this.phase === 'live' || this.phase === 'called') return false // entries only at the open
    if (this.maxStakeEth > 0 && stakeEth > this.maxStakeEth) {
      this.lastError = `Max stake is ${this.maxStakeEth.toFixed(6)} ETH (2% of bankroll)`
      this.emit()
      return false
    }
    this.lastError = null
    this.you = { status: 'queued', stakeEth, entryX: null, exitX: null, openedAtLabel: '' }
    this.emit()
    void (async () => {
      try {
        await buyLive(this.roundId, stakeEth, addr)
        void this.refreshBalance()
        // if the round already locked while the tx confirmed, we are in
        if (this.phase === 'live' && this.you.status === 'queued') {
          this.you = { ...this.you, status: 'in', entryX: 1.0, openedAtLabel: timeLabel() }
          this.emit()
        }
      } catch (err) {
        this.lastError = (err as Error)?.message ?? String(err)
        if (this.you.status === 'queued') {
          this.you = { status: 'idle', stakeEth: 0, entryX: null, exitX: null, openedAtLabel: '' }
        }
        this.emit()
      }
    })()
    return true
  }

  /** Live cashout: operator-signed tick, then the cashOut tx. */
  userSell(): boolean {
    const addr = getAddress()
    if (!addr) return false
    if (this.phase !== 'live' || this.you.status !== 'in') return false
    this.lastError = null
    void (async () => {
      try {
        const { multipleX1e6 } = await cashOutLive(this.roundId, addr)
        const exitX = Number(multipleX1e6) / 1e6
        const payout = Math.min(MAX_PAYOUT_X, exitX) * EDGE_KEEP
        const pnl = this.you.stakeEth * (payout - 1)
        this.pushFeed({ handle: 'you', tint: YOU_TINT, action: 'sold', atX: exitX, entryX: this.you.entryX, pnlEth: pnl })
        this.settleRow('sold', exitX, pnl)
        this.you = { ...this.you, status: 'out', exitX }
        void this.refreshBalance()
        this.emit()
      } catch (err) {
        this.lastError = (err as Error)?.message ?? String(err)
        this.emit()
      }
    })()
    return true
  }

  /* ---- derived views ---------------------------------------------------- */

  elapsedSec(): number {
    if (this.phase === 'live') return Math.floor((Date.now() - this.liveStartMs) / 1000)
    return 0
  }

  opensInSec(): number {
    if (this.phase !== 'intermission') return 0
    if (this.windowEndsAt > Date.now()) return Math.max(1, Math.ceil((this.windowEndsAt - Date.now()) / 1000))
    if (this.nextOpensAt > Date.now()) return Math.max(1, Math.ceil((this.nextOpensAt - Date.now()) / 1000))
    return 1
  }

  revealCount(): number {
    if (this.phase === 'intermission') return this.prevCandles.length
    return this.candles.length
  }

  displayCandles(): Candle[] {
    return this.phase === 'intermission' ? this.prevCandles : this.candles
  }

  holdingCount(): number {
    const self = getAddress()?.toLowerCase()
    let n = this.you.status === 'in' ? 1 : 0
    for (const [addr, e] of this.entrants) if (addr !== self && e.status === 'holding') n += 1
    return n
  }

  watchingCount(): number {
    return this.entrants.size + this.listeners.size + 1
  }

  playerRows(): Player[] {
    const self = getAddress()?.toLowerCase()
    const rows: Player[] = []
    for (const [addr, e] of this.entrants) {
      if (addr === self) continue
      rows.push({
        handle: short(addr),
        tint: tintFor(addr),
        entryX: 1,
        atX: this.currentX,
        pnlEth: e.status === 'called' ? -e.amountEth : e.amountEth * (Math.min(MAX_PAYOUT_X, this.currentX) - 1),
        status: e.status,
      })
    }
    return rows
  }

  sessionStats(): SessionStats {
    const a = this.account
    const inPos = this.you.status === 'in' && this.you.entryX !== null
    const atRisk = inPos || this.you.status === 'queued' ? this.you.stakeEth : 0
    const unrealised = inPos
      ? this.you.stakeEth * (Math.min(MAX_PAYOUT_X, this.currentX / (this.you.entryX as number)) * EDGE_KEEP - 1)
      : 0
    return {
      roundsPlayed: a.roundsPlayed,
      winRatePct: a.roundsPlayed > 0 ? (a.wins / a.roundsPlayed) * 100 : null,
      bestExitX: a.bestExitX,
      worstCalledAtX: a.worstCalledAtX,
      netPnlEth: a.netPnlEth,
      buyingPowerEth: a.buyingPowerEth,
      atRiskEth: atRisk,
      accountValueEth: a.buyingPowerEth + atRisk + unrealised,
      streakDays: 1,
    }
  }

  private pushFeed(entry: Omit<Activity, 'id' | 'timeLabel' | 'ticker'>): void {
    this.feedSeq += 1
    this.feed.unshift({ ...entry, id: `lf${this.feedSeq}`, timeLabel: timeLabel(), ticker: this.ticker.symbol })
    if (this.feed.length > 40) this.feed.pop()
  }
}

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const TINTS = ['#7c5cff', '#1fb6a6', '#3ba55d', '#3d7bd9', '#8b5cf6', '#14b8a6', '#22c55e', '#db2777']
function tintFor(addr: string): string {
  let h = 0
  for (const c of addr.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TINTS[h % TINTS.length]
}

let live: LiveEngine | null = null
export function getLiveEngine(): LiveEngine {
  if (!live) live = new LiveEngine()
  return live
}
