import type {
  Activity,
  Candle,
  HistoryRow,
  Player,
  QueuedRound,
  Result,
  RoundPhase,
  SessionStats,
  Ticker,
} from '../data/types'
import { CHAIN, TICKERS } from '../data/sample'

/* ------------------------------------------------------------------ *
 * The round engine. Replaces the demo reel with a real client-side
 * game loop, ported from the margincall-onety-ui engine so the model
 * matches across builds:
 *
 *   - price random-walks up AND down from the 1.00x open
 *   - the whole path (every tick's return plus the hidden rug tick) is
 *     derived from a per-round seed, which is what a committed seed
 *     would reveal after settle
 *   - round duration: ~8% quick rugs (2-4.5s), exponential tail,
 *     median ~17s, hard cap 95s
 *   - buy at any time mid-round at the current multiple; queued buys
 *     fill at the 1.00x open
 *   - payout = sell multiple / entry multiple, capped at 25x
 *
 * Phases loop forever: intermission -> live -> called -> intermission.
 *
 * New in this build: the paper account. Buying power starts at
 * CHAIN.paperStartEth, stakes are debited on buy, sells credit
 * stake * payout, a margin call keeps the stake, and the whole account
 * (plus your positions log) persists in localStorage.
 * ------------------------------------------------------------------ */

export const TICK_MS = 50
const CANDLE_TICKS = 7 // 350ms per candle
export const CANDLE_MS = TICK_MS * CANDLE_TICKS
const INTERMISSION_MS = 5_000
const CALLED_MS = 3_600
export const MAX_PAYOUT_X = CHAIN.maxPayoutX

const ROTATION: { ticker: Ticker; leverage: number }[] = [
  { ticker: TICKERS.NVDAx, leverage: 20 },
  { ticker: TICKERS.AAPLx, leverage: 5 },
  { ticker: TICKERS.GMEx, leverage: 5 },
  { ticker: TICKERS.AMZNx, leverage: 5 },
  { ticker: TICKERS.HOODx, leverage: 20 },
  { ticker: TICKERS.TSLAx, leverage: 25 },
]

/* ---- seeded randomness ------------------------------------------- */

function mulberry32(a: number): () => number {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function newSeed(): number {
  const b = new Uint32Array(1)
  crypto.getRandomValues(b)
  return b[0]
}

function gauss(rng: () => number): number {
  let u = 0
  let v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/* round duration: ~8% quick rugs (2-4.5s), exponential tail, median ~17s, cap 95s */
function drawRugTime(rng: () => number): number {
  if (rng() < 0.08) return 2 + rng() * 2.5
  const u = rng()
  return Math.min(95, 6 + -Math.log(1 - u) * 16)
}

/* Pre-generate the entire price path for the round: in principle this
 * is what the committed seed derives, every tick's return plus the rug
 * tick. Same constants as the margincall-ui engine. */
function genPath(rng: () => number, rugSecs: number): number[] {
  const steps = Math.max(2, Math.ceil((rugSecs * 1000) / TICK_MS))
  const path = new Array<number>(steps)
  let price = 1.0
  let mom = 0 // momentum term: trends and dips, not pure noise
  for (let i = 0; i < steps; i++) {
    mom = mom * 0.93 + gauss(rng) * 0.0035
    let ret = 0.00075 + mom + gauss(rng) * 0.0028
    if (rng() < 0.018) ret += (rng() - 0.42) * 0.055 // jump: pump or dump
    price = Math.max(0.05, price * (1 + ret))
    path[i] = price
  }
  return path
}

/* The full round as candles, oldest first, opening at exactly 1.00x.
 * The final candle is the rug: it slams to nothing. Revealed by count
 * in CandleTape, exactly as that component expects. */
function buildCandles(path: number[]): Candle[] {
  const out: Candle[] = []
  let open = 1.0
  for (let i = 0; i < path.length; i += CANDLE_TICKS) {
    const seg = path.slice(i, i + CANDLE_TICKS)
    const close = seg[seg.length - 1]
    out.push({
      openX: open,
      highX: Math.max(open, ...seg),
      lowX: Math.min(open, ...seg),
      closeX: close,
    })
    open = close
  }
  out.push({ openX: open, highX: open, lowX: 0.02, closeX: 0.02 })
  return out
}

/* ---- bots ---------------------------------------------------------- *
 * Flavour only: they make the rail and the feed alive. They use plain
 * Math.random because they are not part of the committed path. */

const BOT_POOL: { handle: string; tint: string }[] = [
  { handle: 'rughunter.eth', tint: '#7c5cff' },
  { handle: 'thetagang', tint: '#1fb6a6' },
  { handle: 'cathiewood2', tint: '#3ba55d' },
  { handle: 'shortking.eth', tint: '#3d7bd9' },
  { handle: 'papertrader', tint: '#8b5cf6' },
  { handle: 'fomo_frank', tint: '#14b8a6' },
  { handle: 'wsb_refugee', tint: '#22c55e' },
  { handle: 'hoodlum.eth', tint: '#a16207' },
  { handle: 'marginqueen', tint: '#be185d' },
  { handle: '0xdead...beef', tint: '#db2777' },
  { handle: 'liquidated_larry', tint: '#0ea5e9' },
  { handle: 'dianafan', tint: '#2563eb' },
  { handle: 'kevin', tint: '#16a34a' },
  { handle: 'gmi_gary', tint: '#f59e0b' },
  { handle: 'sofia.eth', tint: '#ef4444' },
  { handle: 'baghold_bob', tint: '#64748b' },
]

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

/* payout-multiple target relative to the bot's own entry */
function drawTarget(): number {
  if (Math.random() < 0.12) return Infinity // diamond hands into the grave
  if (Math.random() < 0.15) return rnd(4, 12) // degenerates
  return 1.05 + Math.random() * Math.random() * 3
}

interface Bot {
  handle: string
  tint: string
  stakeEth: number
  target: number
  panic: number // payout multiple to cut losses at, 0 = never
  buyDelayMs: number
  entryX: number | null
  atX: number
  pnlEth: number
  status: 'waiting' | 'in' | 'out' | 'called'
}

function makeBots(): Bot[] {
  const n = 8 + Math.floor(Math.random() * 8)
  const pool = [...BOT_POOL].sort(() => Math.random() - 0.5)
  return pool.slice(0, n).map((b) => {
    const early = Math.random() < 0.35
    return {
      ...b,
      stakeEth: +rnd(0.05, 1.5).toFixed(2),
      target: drawTarget(),
      panic: Math.random() < 0.4 ? rnd(0.45, 0.8) : 0,
      buyDelayMs: early ? rnd(0, 900) : rnd(1000, 22_000),
      entryX: null,
      atX: 1,
      pnlEth: 0,
      status: 'waiting',
    }
  })
}

/* ---- the paper account -------------------------------------------- */

export interface Account {
  buyingPowerEth: number
  netPnlEth: number
  roundsPlayed: number
  wins: number
  bestExitX: number | null
  worstCalledAtX: number | null
  history: HistoryRow[]
}

const ACCOUNT_KEY = 'mcfun.account.v1'

function freshAccount(): Account {
  return {
    buyingPowerEth: CHAIN.paperStartEth,
    netPnlEth: 0,
    roundsPlayed: 0,
    wins: 0,
    bestExitX: null,
    worstCalledAtX: null,
    history: [],
  }
}

function loadAccount(): Account {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY)
    if (!raw) return freshAccount()
    const a = JSON.parse(raw) as Partial<Account>
    if (typeof a.buyingPowerEth !== 'number' || !Number.isFinite(a.buyingPowerEth)) {
      return freshAccount()
    }
    return {
      buyingPowerEth: a.buyingPowerEth,
      netPnlEth: typeof a.netPnlEth === 'number' ? a.netPnlEth : 0,
      roundsPlayed: typeof a.roundsPlayed === 'number' ? a.roundsPlayed : 0,
      wins: typeof a.wins === 'number' ? a.wins : 0,
      bestExitX: typeof a.bestExitX === 'number' ? a.bestExitX : null,
      worstCalledAtX: typeof a.worstCalledAtX === 'number' ? a.worstCalledAtX : null,
      history: Array.isArray(a.history) ? (a.history as HistoryRow[]).slice(0, 30) : [],
    }
  } catch {
    return freshAccount()
  }
}

/* ---- engine -------------------------------------------------------- */

export type YouStatus = 'idle' | 'queued' | 'in' | 'out' | 'called'

export interface YouState {
  status: YouStatus
  stakeEth: number
  entryX: number | null
  exitX: number | null
  openedAtLabel: string
}

function timeLabel(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

const YOU_TINT = '#ffc247'

export class Engine {
  phase: RoundPhase = 'intermission'
  roundId = 4416
  rotationIdx = -1
  ticker: Ticker = ROTATION[0].ticker
  leverage = ROTATION[0].leverage
  rugAtSec = 0
  path: number[] = []
  candles: Candle[] = []
  prevCandles: Candle[] = []
  currentX = 1
  peakX = 1
  ruggedAtX: number | null = null
  /** The last few settled rounds, newest first. */
  results: Result[] = []
  /** The next few rounds in the rotation. Rebuilt each intermission. */
  queue: QueuedRound[] = []
  phaseStart = 0
  phaseEnds = 0
  liveStart = 0
  bots: Bot[] = []
  feed: Activity[] = []
  watchingBase = 90
  you: YouState = { status: 'idle', stakeEth: 0, entryX: null, exitX: null, openedAtLabel: '' }
  account: Account = typeof window === 'undefined' ? freshAccount() : loadAccount()

  private feedSeq = 0
  private listeners = new Set<() => void>()
  private timer: number | null = null

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    this.start()
    return () => this.listeners.delete(fn)
  }

  private emit(): void {
    for (const fn of this.listeners) fn()
  }

  start(): void {
    if (this.timer !== null) return
    this.startIntermission()
    this.timer = window.setInterval(() => this.tick(), TICK_MS)
  }

  /* ---- account ----------------------------------------------------- */

  private saveAccount(next: Account): void {
    this.account = next
    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next))
    } catch {
      /* quota exceeded: keep the in-memory copy so the session works */
    }
  }

  resetAccount(): void {
    this.saveAccount(freshAccount())
    if (this.you.status === 'queued') {
      this.you = { status: 'idle', stakeEth: 0, entryX: null, exitX: null, openedAtLabel: '' }
    }
    this.emit()
  }

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
    const exitPayout = outcome === 'sold' && exitX !== null && this.you.entryX ? exitX / this.you.entryX : null
    this.saveAccount({
      ...a,
      buyingPowerEth:
        outcome === 'sold' ? a.buyingPowerEth + this.you.stakeEth + pnlEth : a.buyingPowerEth,
      netPnlEth: a.netPnlEth + pnlEth,
      roundsPlayed: a.roundsPlayed + 1,
      wins: a.wins + (outcome === 'sold' && pnlEth > 0 ? 1 : 0),
      bestExitX:
        exitPayout !== null && (a.bestExitX === null || exitPayout > a.bestExitX)
          ? Math.min(MAX_PAYOUT_X, exitPayout)
          : a.bestExitX,
      worstCalledAtX:
        outcome === 'called' && (a.worstCalledAtX === null || (this.ruggedAtX ?? 0) < a.worstCalledAtX)
          ? this.ruggedAtX ?? this.currentX
          : a.worstCalledAtX,
      history: [row, ...a.history].slice(0, 30),
    })
  }

  /* ---- phase transitions ------------------------------------------ */

  private startIntermission(): void {
    const now = performance.now()
    this.prevCandles = this.candles
    this.roundId += 1
    this.rotationIdx = (this.rotationIdx + 1) % ROTATION.length
    this.ticker = ROTATION[this.rotationIdx].ticker
    this.leverage = ROTATION[this.rotationIdx].leverage

    // the committed seed for the round: rug tick and full path derive from it
    const rng = mulberry32(newSeed())
    this.rugAtSec = drawRugTime(rng)
    this.path = genPath(rng, this.rugAtSec)
    this.candles = buildCandles(this.path)

    this.phase = 'intermission'
    this.phaseStart = now
    this.phaseEnds = now + INTERMISSION_MS
    this.currentX = 1
    this.peakX = 1
    this.ruggedAtX = null
    this.bots = makeBots()
    this.watchingBase = 88 + Math.floor(Math.random() * 60)

    this.queue = Array.from({ length: 5 }, (_, i) => {
      const r = ROTATION[(this.rotationIdx + 1 + i) % ROTATION.length]
      const secs = 20 + i * 25
      const m = Math.floor(secs / 60)
      const s = secs % 60
      return {
        ticker: r.ticker,
        leverage: r.leverage,
        startsInLabel: `~${m}:${String(s).padStart(2, '0')}`,
      }
    })

    // a settled position from the last round frees you to queue again
    if (this.you.status === 'out' || this.you.status === 'called') {
      this.you = { status: 'idle', stakeEth: 0, entryX: null, exitX: null, openedAtLabel: '' }
    }
  }

  private startLive(): void {
    const now = performance.now()
    this.phase = 'live'
    this.liveStart = now
    this.phaseStart = now
    this.phaseEnds = 0
    this.currentX = 1
    this.peakX = 1
    // queued order fills at the 1.00x open
    if (this.you.status === 'queued') {
      this.you = { ...this.you, status: 'in', entryX: 1.0, openedAtLabel: timeLabel() }
      this.pushFeed({ handle: 'you', tint: YOU_TINT, action: 'bought', atX: 1.0, entryX: null, pnlEth: null })
    }
  }

  private call(): void {
    const rugPrice = this.currentX
    this.phase = 'called'
    this.ruggedAtX = rugPrice
    this.results = [
      { roundId: this.roundId, ruggedAtX: rugPrice, ticker: this.ticker.symbol, leverage: this.leverage },
      ...this.results,
    ].slice(0, 14)
    this.phaseStart = performance.now()
    this.phaseEnds = this.phaseStart + CALLED_MS
    // liquidate everyone still holding
    for (const b of this.bots) {
      if (b.status === 'in') {
        b.status = 'called'
        b.atX = rugPrice
        b.pnlEth = -b.stakeEth
        this.pushFeed({ handle: b.handle, tint: b.tint, action: 'called', atX: rugPrice, entryX: b.entryX, pnlEth: -b.stakeEth })
      }
    }
    if (this.you.status === 'in') {
      this.pushFeed({ handle: 'you', tint: YOU_TINT, action: 'called', atX: rugPrice, entryX: this.you.entryX, pnlEth: -this.you.stakeEth })
      this.settleRow('called', null, -this.you.stakeEth)
      this.you = { ...this.you, status: 'called', exitX: null }
    }
    if (this.you.status === 'queued') {
      // a queued order never filled; nothing at risk, stake back, idle
      this.saveAccount({ ...this.account, buyingPowerEth: this.account.buyingPowerEth + this.you.stakeEth })
      this.you = { status: 'idle', stakeEth: 0, entryX: null, exitX: null, openedAtLabel: '' }
    }
  }

  /* ---- the loop ---------------------------------------------------- */

  private tick(): void {
    const now = performance.now()

    if (this.phase === 'intermission') {
      if (now >= this.phaseEnds) this.startLive()
      this.emit()
      return
    }

    if (this.phase === 'live') {
      const elapsed = now - this.liveStart
      const idx = Math.floor(elapsed / TICK_MS)
      if (idx >= this.path.length) {
        this.call()
        this.emit()
        return
      }
      const price = this.path[idx]
      this.currentX = price
      if (price > this.peakX) this.peakX = price

      // bots: staggered mid-round entries at the current price
      for (const b of this.bots) {
        if (b.status === 'waiting' && elapsed >= b.buyDelayMs) {
          b.status = 'in'
          b.entryX = price
          b.atX = price
          this.pushFeed({ handle: b.handle, tint: b.tint, action: 'bought', atX: price, entryX: null, pnlEth: null })
        }
      }
      // bots: take profit at target, or panic-cut on dips
      for (const b of this.bots) {
        if (b.status !== 'in' || b.entryX === null) continue
        b.atX = price
        const pm = price / b.entryX
        b.pnlEth = b.stakeEth * (Math.min(MAX_PAYOUT_X, pm) - 1)
        if (pm >= b.target) this.sellBot(b, price, elapsed, false)
        else if (b.panic && pm <= b.panic && elapsed - b.buyDelayMs > 1200) this.sellBot(b, price, elapsed, true)
      }
      this.emit()
      return
    }

    // called
    if (now >= this.phaseEnds) this.startIntermission()
    this.emit()
  }

  private sellBot(b: Bot, price: number, elapsed: number, panic: boolean): void {
    if (b.entryX === null) return
    const payout = Math.min(MAX_PAYOUT_X, price / b.entryX)
    b.status = 'out'
    b.atX = price
    b.pnlEth = b.stakeEth * (payout - 1)
    this.pushFeed({ handle: b.handle, tint: b.tint, action: 'sold', atX: price, entryX: b.entryX, pnlEth: b.pnlEth })
    // some winners buy back in later in the same round
    if (!panic && Math.random() < 0.3) {
      window.setTimeout(() => {
        if (this.phase !== 'live' || b.status !== 'out') return
        void elapsed
        b.status = 'waiting'
        b.entryX = null
        b.pnlEth = 0
        b.buyDelayMs = performance.now() - this.liveStart + rnd(1500, 8000)
        b.target = drawTarget()
      }, 0)
    }
  }

  private pushFeed(entry: Omit<Activity, 'id' | 'timeLabel' | 'ticker'>): void {
    this.feedSeq += 1
    this.feed.unshift({
      ...entry,
      id: `f${this.feedSeq}`,
      timeLabel: timeLabel(),
      ticker: this.ticker.symbol,
    })
    if (this.feed.length > 40) this.feed.pop()
  }

  /* ---- user actions ------------------------------------------------ *
   * Buy any time: during intermission or the called screen the order
   * queues and fills at the next 1.00x open; mid-round it fills at the
   * current multiple. One open position at a time. The stake comes out
   * of buying power the moment the order exists. */

  userBuy(stakeEth: number): boolean {
    if (!(stakeEth > 0) || !Number.isFinite(stakeEth)) return false
    const free = this.you.status === 'idle' || this.you.status === 'out'
    if (!free) return false
    if (stakeEth > this.account.buyingPowerEth) return false
    this.saveAccount({ ...this.account, buyingPowerEth: this.account.buyingPowerEth - stakeEth })
    if (this.phase === 'live') {
      this.you = {
        status: 'in',
        stakeEth,
        entryX: this.currentX,
        exitX: null,
        openedAtLabel: timeLabel(),
      }
      this.pushFeed({ handle: 'you', tint: YOU_TINT, action: 'bought', atX: this.currentX, entryX: null, pnlEth: null })
      this.emit()
      return true
    }
    this.you = { status: 'queued', stakeEth, entryX: null, exitX: null, openedAtLabel: '' }
    this.emit()
    return true
  }

  userSell(): boolean {
    if (this.phase !== 'live' || this.you.status !== 'in' || this.you.entryX === null) return false
    const price = this.currentX
    const payout = Math.min(MAX_PAYOUT_X, price / this.you.entryX)
    const pnl = this.you.stakeEth * (payout - 1)
    this.pushFeed({ handle: 'you', tint: YOU_TINT, action: 'sold', atX: price, entryX: this.you.entryX, pnlEth: pnl })
    this.settleRow('sold', price, pnl)
    this.you = { ...this.you, status: 'out', exitX: price }
    this.emit()
    return true
  }

  /* ---- derived views ----------------------------------------------- */

  elapsedSec(): number {
    if (this.phase === 'live') return Math.floor((performance.now() - this.liveStart) / 1000)
    if (this.phase === 'called') return Math.floor(this.rugAtSec)
    return 0
  }

  opensInSec(): number {
    if (this.phase !== 'intermission') return 0
    return Math.max(1, Math.ceil((this.phaseEnds - performance.now()) / 1000))
  }

  /** How many candles of the path have happened yet. The rug candle is
   * only revealed once the round is called. */
  revealCount(): number {
    if (this.phase === 'called') return this.candles.length
    if (this.phase !== 'live') return this.prevCandles.length
    const elapsed = performance.now() - this.liveStart
    return Math.min(this.candles.length - 1, Math.floor(elapsed / CANDLE_MS) + 1)
  }

  displayCandles(): Candle[] {
    return this.phase === 'intermission' ? this.prevCandles : this.candles
  }

  holdingCount(): number {
    let n = this.you.status === 'in' ? 1 : 0
    for (const b of this.bots) if (b.status === 'in') n += 1
    return n
  }

  watchingCount(): number {
    return this.watchingBase + this.bots.length + this.holdingCount()
  }

  /** Bot rows for the rail, joined bots only, viewer excluded. */
  playerRows(): Player[] {
    const rows: Player[] = []
    for (const b of this.bots) {
      if (b.status === 'waiting') continue
      rows.push({
        handle: b.handle,
        tint: b.tint,
        entryX: b.entryX ?? 1,
        atX: b.atX,
        pnlEth: b.pnlEth,
        status: b.status === 'in' ? 'holding' : b.status,
      })
    }
    return rows
  }

  sessionStats(): SessionStats {
    const a = this.account
    const inPos = this.you.status === 'in' && this.you.entryX !== null
    const atRisk = inPos || this.you.status === 'queued' ? this.you.stakeEth : 0
    const unrealised = inPos
      ? this.you.stakeEth * (Math.min(MAX_PAYOUT_X, this.currentX / (this.you.entryX as number)) - 1)
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
}

let engine: Engine | null = null
export function getEngine(): Engine {
  if (!engine) engine = new Engine()
  return engine
}
