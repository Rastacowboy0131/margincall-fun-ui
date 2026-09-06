/* ------------------------------------------------------------------ *
 * MARGIN CALL — the data contract.
 *
 * This file IS the handover. Every field carries its unit in its name,
 * so nothing downstream has to guess. Amounts are already scaled
 * decimals for display: if you are holding wei or a bigint, convert at
 * your adapter boundary — no component in this product ever sees wei,
 * and none of them should learn how.
 *
 * The one rule the entire interface leans on:
 *
 *   A MULTIPLE is written `1.94` and rendered `1.94x`.
 *   It is never a percentage and never a price.
 *
 * Entry, exit, current and rug are all multiples of the 1.00x open, so
 * they are directly comparable and share one column width everywhere
 * they appear. The moment one of them becomes a dollar price, half the
 * screens in here stop lining up.
 * ------------------------------------------------------------------ */

/** A tokenised equity the game runs rounds on. */
export interface Ticker {
  /** Symbol as displayed, e.g. "NVDAx". */
  symbol: string
  /** Underlying name, e.g. "NVIDIA". */
  name: string
  /** Two letters drawn in the medallion. */
  mark: string
  /** Medallion fill, a raw hex — these are brand colours, not themeable. */
  swatch: string
  /** True when the medallion needs dark type on it. Saves a luminance calc. */
  darkInk: boolean
}

export type RoundPhase = 'live' | 'called' | 'intermission'

export interface Round {
  /** Monotonic round number, displayed as #4417. */
  id: number
  ticker: Ticker
  /** Leverage the round runs at, e.g. 20 renders "20x". */
  leverage: number
  phase: RoundPhase
  /** Current multiple of the 1.00x open. The live value. */
  currentX: number
  /** Seconds the round has been live. */
  elapsedSec: number
  /** Where the round rugged. Null until `phase` is 'called'. */
  ruggedAtX: number | null
  /** Seconds until the next round opens. Only meaningful in intermission. */
  opensInSec: number
  /** Players currently holding a position in this round. */
  holding: number
  /** Everyone watching, holding or not. Drives the "at the table" count. */
  watching: number
}

/** One candle of the round's price path. Oldest first. */
export interface Candle {
  openX: number
  highX: number
  lowX: number
  closeX: number
}

/** A settled round, as it appears in the results strip along the top. */
export interface Result {
  roundId: number
  /** The multiple the round rugged at. */
  ruggedAtX: number
  ticker: string
  leverage: number
}

/** A row in the "at the table" rail. */
export interface Player {
  handle: string
  /** Avatar tint, raw hex. */
  tint: string
  entryX: number
  /** Current multiple for an open position, or the exit for a closed one. */
  atX: number
  /** Profit or loss in ETH, signed. */
  pnlEth: number
  status: 'holding' | 'out' | 'called'
}

/** The viewer's position in the live round, if any. */
export interface Position {
  ticker: Ticker
  leverage: number
  side: 'long' | 'short'
  /** Stake in ETH. */
  stakeEth: number
  entryX: number
  /** Live payout multiple. This is exit / entry, NOT the round multiple —
   * it is the single number new players misread, so the ticket spells it
   * out in words underneath. */
  payoutX: number
  /** Unrealised P&L in ETH, signed. */
  pnlEth: number
  roundId: number
  openedAtLabel: string
}

/** An entry in the live feed. */
export interface Activity {
  id: string
  timeLabel: string
  handle: string
  tint: string
  action: 'bought' | 'sold' | 'called'
  atX: number
  entryX: number | null
  pnlEth: number | null
  ticker: string
}

/** A queued upcoming round. */
export interface QueuedRound {
  ticker: Ticker
  leverage: number
  startsInLabel: string
}

/** A settled round in the viewer's own log. */
export interface HistoryRow {
  roundId: number
  ticker: string
  leverage: number
  side: 'long' | 'short'
  stakeEth: number
  entryX: number
  /** Null when the position was margin called rather than sold. */
  exitX: number | null
  ruggedAtX: number
  pnlEth: number
  outcome: 'sold' | 'called'
  timeLabel: string
}

export interface LeaderRow {
  rank: number
  handle: string
  tint: string
  ticker: string
  atX: number
  valueEth: number
  /** Shown as a tag beside the handle, e.g. "GOAT". Null for most rows. */
  tag: string | null
  /** True when this row is the viewer. Drives the highlight, not the tag. */
  isYou?: boolean
}

export interface SessionStats {
  roundsPlayed: number
  /** Win rate as a percent, e.g. 39.1. Null before any round is played. */
  winRatePct: number | null
  bestExitX: number | null
  worstCalledAtX: number | null
  netPnlEth: number
  buyingPowerEth: number
  atRiskEth: number
  accountValueEth: number
  /** Consecutive days played. Drives the streak badge. */
  streakDays: number
}

/** Wallet shape the UI needs — never a provider object. */
export interface Wallet {
  connected: boolean
  handle: string
  addressShort: string
  /** 'demo' is paper trading; 'live' settles on chain. */
  mode: 'demo' | 'live'
}

/** A row of the market tape along the very top of the frame. */
export interface TapeRow {
  symbol: string
  price: number
  changePct: number
}

/** One referral row on the rewards page. */
export interface ReferrerRow {
  rank: number
  handle: string
  tint: string
  referees: number
  volumeEth: number
  earnedEth: number
}
