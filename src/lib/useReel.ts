import { useSyncExternalStore } from 'react'
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
import { getEngine, MAX_PAYOUT_X } from './engine'
import { getLiveEngine } from './liveEngine'
import { getMode, subscribeMode } from './mode'
import type { YouState } from './engine'

/* ------------------------------------------------------------------ *
 * The live round, as a hook. The demo reel this replaces walked a
 * hand-typed frame array; this subscribes to the round engine
 * (src/lib/engine.ts), which generates every round from a fresh seed
 * and loops forever: intermission -> live -> called -> next round.
 *
 * The fields the old ReelFrame carried are preserved (phase, currentX,
 * elapsedSec, opensInSec, holding, watching, payoutX, pnlEth) and
 * extended with what the components used to read out of sample.ts:
 * the round identity, candles + revealCount, the rails, the account,
 * and the two user actions.
 * ------------------------------------------------------------------ */

export interface Reel {
  /** 'demo' (paper engine) or 'live' (chain + operator ws). */
  mode: 'demo' | 'live'
  /** Last live-mode error worth surfacing (bad stake, tx revert). */
  liveError: string | null
  /** Max live stake in ETH (2% of bankroll), 0 when unknown. */
  liveMaxStakeEth: number
  phase: RoundPhase
  roundId: number
  ticker: Ticker
  leverage: number
  /** Current multiple of the 1.00x open. */
  currentX: number
  /** Where the round rugged. Null until phase is 'called'. */
  ruggedAtX: number | null
  elapsedSec: number
  /** Seconds until the next round opens; only meaningful in intermission. */
  opensInSec: number
  /** The round's candles; during intermission, the settled last round. */
  candles: Candle[]
  /** How many candles of the path have happened yet. */
  revealCount: number
  holding: number
  watching: number
  /** Bots in the round, viewer excluded. */
  players: Player[]
  feed: Activity[]
  /** The last few settled rounds, newest first. */
  results: Result[]
  queue: QueuedRound[]
  you: YouState
  /** Your live payout multiple, or null when you are not in. */
  payoutX: number | null
  /** Your unrealised P&L in ETH, or null when you are not in. */
  pnlEth: number | null
  session: SessionStats
  /** Your settled positions, newest first. */
  history: HistoryRow[]
  buy: (stakeEth: number) => boolean
  sell: () => boolean
  resetAccount: () => void
}

let cache: Reel | null = null
let cacheKey = -1
let version = 0

const engine = () => (getMode() === 'live' ? getLiveEngine() : getEngine())

function subscribe(fn: () => void): () => void {
  const bump = () => {
    version += 1
    fn()
  }
  // Subscribe to BOTH engines plus the mode store: a mode flip must
  // rebuild the snapshot immediately, and the demo engine keeps running
  // in the background so paper state is exactly as you left it.
  const un1 = getEngine().subscribe(bump)
  const un2 = getLiveEngine().subscribe(bump)
  const un3 = subscribeMode(bump)
  return () => {
    un1()
    un2()
    un3()
  }
}

function getSnapshot(): Reel {
  if (cache && cacheKey === version) return cache
  const e = engine()
  const live = getMode() === 'live'
  const you = e.you
  const inPos = you.status === 'in' && you.entryX !== null
  const payoutX = inPos ? Math.min(MAX_PAYOUT_X, e.currentX / (you.entryX as number)) : null
  cache = {
    mode: live ? 'live' : 'demo',
    liveError: live ? getLiveEngine().lastError : null,
    liveMaxStakeEth: live ? getLiveEngine().maxStakeEth : 0,
    phase: e.phase,
    roundId: e.roundId,
    ticker: e.ticker,
    leverage: e.leverage,
    currentX: e.currentX,
    ruggedAtX: e.ruggedAtX,
    elapsedSec: e.elapsedSec(),
    opensInSec: e.opensInSec(),
    candles: e.displayCandles(),
    revealCount: e.revealCount(),
    holding: e.holdingCount(),
    watching: e.watchingCount(),
    players: e.playerRows(),
    feed: e.feed.slice(0, 12),
    results: e.results,
    queue: e.queue,
    you,
    payoutX,
    pnlEth: payoutX !== null ? you.stakeEth * (payoutX - 1) : null,
    session: e.sessionStats(),
    history: e.account.history,
    buy: (stakeEth: number) => e.userBuy(stakeEth),
    sell: () => e.userSell(),
    resetAccount: () => e.resetAccount(),
  }
  cacheKey = version
  return cache
}

export function useReel(): Reel {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
