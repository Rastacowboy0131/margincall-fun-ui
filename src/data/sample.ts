/* ------------------------------------------------------------------ *
 * MARGIN CALL — sample values.
 *
 *   DELETE THIS FILE AT INTEGRATION.
 *
 * It exists for one reason: so the screens can be judged against
 * realistic numbers. Every value below is hand-typed and hand-reconciled
 * against every other value. Nothing is generated, nothing is derived at
 * runtime, and there is no Math.random or Date.now anywhere in here — a
 * screenshot of this build is the same screenshot tomorrow.
 *
 * The reconciliation used while typing, so a later edit can keep it:
 *
 *   live round  #4417 NVDAx 20x, opened at 1.00x, now 6.84x, 0:32 in
 *   your slip   0.50 ETH long, entry 2.61x
 *               payout = 6.84 / 2.61          = 2.6207 -> shown 2.62x
 *               pnl    = 0.50 * (2.6207 - 1)  = +0.8103 ETH
 *   balances    paper start          10000.0000
 *               realised this session  -2.8412
 *               staked into the round   -0.5000  -> buying power 9496.6588
 *               unrealised             +0.8103  -> account value 9997.9691
 *   session     23 rounds, 9 of them sold green -> 39.1% win rate
 *   results     RESULTS[] and HISTORY[] describe the same rounds; where
 *               a round id appears in both, ruggedAtX must match.
 * ------------------------------------------------------------------ */

import type {
  Activity,
  Candle,
  HistoryRow,
  LeaderRow,
  Player,
  Position,
  QueuedRound,
  ReferrerRow,
  Result,
  Round,
  SessionStats,
  TapeRow,
  Ticker,
  Wallet,
} from './types'

export const TICKERS: Record<string, Ticker> = {
  NVDAx: { symbol: 'NVDAx', name: 'NVIDIA', mark: 'NV', swatch: '#76b900', darkInk: true },
  AAPLx: { symbol: 'AAPLx', name: 'Apple', mark: 'AA', swatch: '#a1a1a6', darkInk: true },
  TSLAx: { symbol: 'TSLAx', name: 'Tesla', mark: 'TS', swatch: '#e31937', darkInk: false },
  SPYx: { symbol: 'SPYx', name: 'S&P 500', mark: 'SP', swatch: '#2f6fd0', darkInk: false },
  HOODx: { symbol: 'HOODx', name: 'Robinhood', mark: 'HD', swatch: '#9dff3f', darkInk: true },
  GMEx: { symbol: 'GMEx', name: 'GameStop', mark: 'GM', swatch: '#e4002b', darkInk: false },
  AMZNx: { symbol: 'AMZNx', name: 'Amazon', mark: 'AM', swatch: '#ff9900', darkInk: true },
}

/* The tape that crawls along the very top. Real-world prices of the
 * underlyings — this is the only place in the product where a figure is
 * a PRICE rather than a multiple. */
export const TAPE: TapeRow[] = [
  { symbol: 'NVDA', price: 949.5, changePct: 3.16 },
  { symbol: 'TSLA', price: 188.32, changePct: -1.12 },
  { symbol: 'SPY', price: 527.19, changePct: 0.38 },
  { symbol: 'AAPL', price: 195.43, changePct: 0.65 },
  { symbol: 'HOOD', price: 68.41, changePct: 4.02 },
  { symbol: 'GME', price: 23.06, changePct: -2.74 },
  { symbol: 'AMZN', price: 201.77, changePct: 1.09 },
  { symbol: 'COIN', price: 231.87, changePct: -1.05 },
  { symbol: 'ETH', price: 3648.72, changePct: 1.72 },
  { symbol: 'BTC', price: 67842.1, changePct: 1.23 },
]

export const ROUND: Round = {
  id: 4417,
  ticker: TICKERS.NVDAx,
  leverage: 20,
  phase: 'live',
  currentX: 6.84,
  elapsedSec: 32,
  ruggedAtX: null,
  opensInSec: 0,
  holding: 41,
  watching: 137,
}

/* The round's path so far, oldest first, opening at exactly 1.00x.
 * Hand-typed as a real chart would run: a push up, a scare, a deeper
 * dip, then the melt-up it is currently in. Each candle's openX equals
 * the previous closeX; lowX never goes below 0.
 *
 * Nora: this is a fixed sample path, not a generator. The real path
 * arrives per tick from the committed seed. CandleTape.tsx draws
 * whatever length of array it is handed and scales to fit. */
export const CANDLES: Candle[] = [
  { openX: 1.0, highX: 1.09, lowX: 0.97, closeX: 1.06 },
  { openX: 1.06, highX: 1.18, lowX: 1.03, closeX: 1.15 },
  { openX: 1.15, highX: 1.16, lowX: 0.98, closeX: 1.02 },
  { openX: 1.02, highX: 1.22, lowX: 1.0, closeX: 1.2 },
  { openX: 1.2, highX: 1.44, lowX: 1.18, closeX: 1.41 },
  { openX: 1.41, highX: 1.62, lowX: 1.38, closeX: 1.58 },
  { openX: 1.58, highX: 1.6, lowX: 1.31, closeX: 1.36 },
  { openX: 1.36, highX: 1.49, lowX: 1.3, closeX: 1.47 },
  { openX: 1.47, highX: 1.83, lowX: 1.45, closeX: 1.79 },
  { openX: 1.79, highX: 2.11, lowX: 1.74, closeX: 2.06 },
  { openX: 2.06, highX: 2.09, lowX: 1.62, closeX: 1.68 },
  { openX: 1.68, highX: 1.71, lowX: 1.22, closeX: 1.27 },
  { openX: 1.27, highX: 1.35, lowX: 1.14, closeX: 1.18 },
  { openX: 1.18, highX: 1.44, lowX: 1.16, closeX: 1.42 },
  { openX: 1.42, highX: 1.88, lowX: 1.4, closeX: 1.84 },
  { openX: 1.84, highX: 2.37, lowX: 1.8, closeX: 2.31 },
  { openX: 2.31, highX: 2.9, lowX: 2.28, closeX: 2.84 },
  { openX: 2.84, highX: 2.96, lowX: 2.44, closeX: 2.52 },
  { openX: 2.52, highX: 3.28, lowX: 2.49, closeX: 3.21 },
  { openX: 3.21, highX: 3.99, lowX: 3.16, closeX: 3.9 },
  { openX: 3.9, highX: 4.06, lowX: 3.37, closeX: 3.48 },
  { openX: 3.48, highX: 4.42, lowX: 3.44, closeX: 4.34 },
  { openX: 4.34, highX: 5.29, lowX: 4.3, closeX: 5.18 },
  { openX: 5.18, highX: 5.36, lowX: 4.61, closeX: 4.74 },
  { openX: 4.74, highX: 5.91, lowX: 4.7, closeX: 5.83 },
  { openX: 5.83, highX: 6.98, lowX: 5.77, closeX: 6.84 },
]

/* The same path plus the two candles that killed it, for the 'called'
 * frame. It rugs at 2.79x — which is what RESULTS[0] and HISTORY[0]
 * both say happened in round 4416, and what the shredded ticket reads. */
export const CANDLES_CALLED: Candle[] = [
  ...CANDLES,
  { openX: 6.84, highX: 6.9, lowX: 4.12, closeX: 4.3 },
  { openX: 4.3, highX: 4.31, lowX: 2.71, closeX: 2.79 },
]

/* Your open position, reconciled against ROUND.currentX above. */
export const POSITION: Position = {
  ticker: TICKERS.NVDAx,
  leverage: 20,
  side: 'long',
  stakeEth: 0.5,
  entryX: 2.61,
  payoutX: 2.6207,
  pnlEth: 0.8103,
  roundId: 4417,
  openedAtLabel: '00:57:19',
}

/* The last fourteen settled rounds, newest first. These are the pills
 * along the top of the table — in a crash game this strip is the single
 * most-read element on the page, because players treat it like a
 * roulette board. Every id below 4417 that also appears in HISTORY
 * carries the same ruggedAtX there. */
export const RESULTS: Result[] = [
  { roundId: 4416, ruggedAtX: 2.79, ticker: 'AMZNx' },
  { roundId: 4415, ruggedAtX: 2.21, ticker: 'HOODx' },
  { roundId: 4414, ruggedAtX: 0.61, ticker: 'SPYx' },
  { roundId: 4413, ruggedAtX: 1.02, ticker: 'AAPLx' },
  { roundId: 4412, ruggedAtX: 15.85, ticker: 'GMEx' },
  { roundId: 4411, ruggedAtX: 1.33, ticker: 'TSLAx' },
  { roundId: 4410, ruggedAtX: 4.02, ticker: 'NVDAx' },
  { roundId: 4409, ruggedAtX: 2.34, ticker: 'HOODx' },
  { roundId: 4408, ruggedAtX: 1.07, ticker: 'TSLAx' },
  { roundId: 4407, ruggedAtX: 7.53, ticker: 'NVDAx' },
  { roundId: 4406, ruggedAtX: 1.0, ticker: 'SPYx' },
  { roundId: 4405, ruggedAtX: 3.06, ticker: 'GMEx' },
  { roundId: 4404, ruggedAtX: 1.19, ticker: 'AAPLx' },
  { roundId: 4403, ruggedAtX: 24.6, ticker: 'AMZNx' },
]

/* The rail down the left of the table. The viewer is deliberately NOT
 * in this roster: their chip is assembled from POSITION and pushed in at
 * the top, so the rail can never claim you are holding while the console
 * says you are flat. */
export const PLAYERS: Player[] = [
  { handle: 'rughunter.eth', tint: '#7c5cff', entryX: 0.99, atX: 6.84, pnlEth: 10.22, status: 'holding' },
  { handle: 'cathiewood2', tint: '#3ba55d', entryX: 0.99, atX: 6.84, pnlEth: 18.23, status: 'holding' },
  { handle: 'marginqueen', tint: '#be185d', entryX: 0.94, atX: 6.84, pnlEth: 3.65, status: 'holding' },
  { handle: 'shortking.eth', tint: '#3d7bd9', entryX: 1.04, atX: 6.84, pnlEth: 1.05, status: 'holding' },
  { handle: 'thetagang', tint: '#1fb6a6', entryX: 1.74, atX: 4.7, pnlEth: 5.88, status: 'out' },
  { handle: 'papertrader', tint: '#8b5cf6', entryX: 1.02, atX: 3.89, pnlEth: 2.77, status: 'out' },
  { handle: 'hoodlum.eth', tint: '#c2751b', entryX: 0.95, atX: 6.84, pnlEth: 0.4, status: 'holding' },
  { handle: 'liquidated_larry', tint: '#0ea5e9', entryX: 0.99, atX: 6.84, pnlEth: 0.88, status: 'holding' },
  { handle: 'fomo_frank', tint: '#14b8a6', entryX: 4.96, atX: 6.84, pnlEth: 0.24, status: 'holding' },
  { handle: 'wsb_refugee', tint: '#22c55e', entryX: 2.61, atX: 5.27, pnlEth: 0.96, status: 'out' },
  { handle: 'dianafan', tint: '#2563eb', entryX: 0.92, atX: 2.09, pnlEth: 0.67, status: 'out' },
  { handle: '0xdead...beef', tint: '#db2777', entryX: 2.97, atX: 1.43, pnlEth: -0.62, status: 'called' },
]

/* The same roster after the round is called at 2.79x. Everyone still
 * holding loses their stake; everyone who had already sold keeps what
 * they locked in — so the four `out` rows and the one already-`called`
 * row are byte-identical above and below. Written out rather than
 * derived so the rail can never disagree with the readout above it. */
export const PLAYERS_CALLED: Player[] = [
  { handle: 'rughunter.eth', tint: '#7c5cff', entryX: 0.99, atX: 2.79, pnlEth: -2.4, status: 'called' },
  { handle: 'cathiewood2', tint: '#3ba55d', entryX: 0.99, atX: 2.79, pnlEth: -4.1, status: 'called' },
  { handle: 'marginqueen', tint: '#be185d', entryX: 0.94, atX: 2.79, pnlEth: -3.0, status: 'called' },
  { handle: 'shortking.eth', tint: '#3d7bd9', entryX: 1.04, atX: 2.79, pnlEth: -0.85, status: 'called' },
  { handle: 'thetagang', tint: '#1fb6a6', entryX: 1.74, atX: 4.7, pnlEth: 5.88, status: 'out' },
  { handle: 'papertrader', tint: '#8b5cf6', entryX: 1.02, atX: 3.89, pnlEth: 2.77, status: 'out' },
  { handle: 'hoodlum.eth', tint: '#c2751b', entryX: 0.95, atX: 2.79, pnlEth: -1.2, status: 'called' },
  { handle: 'liquidated_larry', tint: '#0ea5e9', entryX: 0.99, atX: 2.79, pnlEth: -0.9, status: 'called' },
  { handle: 'fomo_frank', tint: '#14b8a6', entryX: 4.96, atX: 2.79, pnlEth: -0.75, status: 'called' },
  { handle: 'wsb_refugee', tint: '#22c55e', entryX: 2.61, atX: 5.27, pnlEth: 0.96, status: 'out' },
  { handle: 'dianafan', tint: '#2563eb', entryX: 0.92, atX: 2.09, pnlEth: 0.67, status: 'out' },
  { handle: '0xdead...beef', tint: '#db2777', entryX: 2.97, atX: 1.43, pnlEth: -0.62, status: 'called' },
]

/* Nobody holds anything between rounds. This is what drives the empty
 * state of the rail, which is a designed screen, not a gap. */
export const PLAYERS_BETWEEN: Player[] = []

export const ACTIVITY: Activity[] = [
  { id: 'a1', timeLabel: '00:57:21', handle: 'wsb_refugee', tint: '#22c55e', action: 'sold', atX: 5.27, entryX: 2.61, pnlEth: 0.96, ticker: 'NVDAx' },
  { id: 'a2', timeLabel: '00:57:21', handle: 'thetagang', tint: '#1fb6a6', action: 'sold', atX: 4.7, entryX: 1.74, pnlEth: 5.88, ticker: 'NVDAx' },
  { id: 'a3', timeLabel: '00:57:19', handle: 'you', tint: '#ffc247', action: 'bought', atX: 2.61, entryX: null, pnlEth: null, ticker: 'NVDAx' },
  { id: 'a4', timeLabel: '00:57:12', handle: 'papertrader', tint: '#8b5cf6', action: 'sold', atX: 3.89, entryX: 1.02, pnlEth: 2.77, ticker: 'NVDAx' },
  { id: 'a5', timeLabel: '00:57:09', handle: '0xdead...beef', tint: '#db2777', action: 'called', atX: 1.43, entryX: 2.97, pnlEth: -0.62, ticker: 'NVDAx' },
  { id: 'a6', timeLabel: '00:57:04', handle: 'marginqueen', tint: '#be185d', action: 'bought', atX: 0.94, entryX: null, pnlEth: null, ticker: 'NVDAx' },
  { id: 'a7', timeLabel: '00:56:58', handle: 'rughunter.eth', tint: '#7c5cff', action: 'bought', atX: 0.99, entryX: null, pnlEth: null, ticker: 'NVDAx' },
  { id: 'a8', timeLabel: '00:56:55', handle: 'dianafan', tint: '#2563eb', action: 'sold', atX: 2.09, entryX: 0.92, pnlEth: 0.67, ticker: 'NVDAx' },
]

/* The schedule board: five queued rounds plus the live one, six cards.
 * Six is the number that fills the space under the chart and no more —
 * it divides evenly into the board's 2 and 3 column layouts, so the
 * last row is never left ragged. Rounds open every 25 seconds, so this
 * is about two minutes of visible schedule, which is as far ahead as
 * anyone plans in a game with 15-second rounds. */
export const QUEUE: QueuedRound[] = [
  { ticker: TICKERS.AAPLx, leverage: 5, startsInLabel: '00:25' },
  { ticker: TICKERS.GMEx, leverage: 5, startsInLabel: '00:50' },
  { ticker: TICKERS.AMZNx, leverage: 25, startsInLabel: '01:15' },
  { ticker: TICKERS.HOODx, leverage: 10, startsInLabel: '01:40' },
  { ticker: TICKERS.TSLAx, leverage: 25, startsInLabel: '02:05' },
]

export const WALLET: Wallet = {
  connected: true,
  handle: 'you',
  addressShort: '0x4a2f...9c1d',
  mode: 'demo',
}

export const SESSION: SessionStats = {
  roundsPlayed: 23,
  winRatePct: 39.1,
  bestExitX: 12.4,
  worstCalledAtX: 1.02,
  netPnlEth: -2.8412,
  buyingPowerEth: 9496.6588,
  atRiskEth: 0.5,
  accountValueEth: 9997.9691,
  streakDays: 4,
}

/* Your own log. `pnlEth` on a called row is always exactly -stakeEth:
 * a margin call takes the position, not a fraction of it. */
export const HISTORY: HistoryRow[] = [
  { roundId: 4416, ticker: 'AMZNx', leverage: 25, side: 'long', stakeEth: 0.5, entryX: 1.04, exitX: null, ruggedAtX: 2.79, pnlEth: -0.5, outcome: 'called', timeLabel: '00:56:41' },
  { roundId: 4415, ticker: 'HOODx', leverage: 20, side: 'long', stakeEth: 0.25, entryX: 0.98, exitX: 1.94, ruggedAtX: 2.21, pnlEth: 0.245, outcome: 'sold', timeLabel: '00:55:12' },
  { roundId: 4414, ticker: 'SPYx', leverage: 5, side: 'short', stakeEth: 1.0, entryX: 1.12, exitX: 0.69, ruggedAtX: 0.61, pnlEth: -0.384, outcome: 'sold', timeLabel: '00:52:30' },
  { roundId: 4413, ticker: 'AAPLx', leverage: 20, side: 'long', stakeEth: 0.5, entryX: 1.05, exitX: null, ruggedAtX: 1.02, pnlEth: -0.5, outcome: 'called', timeLabel: '00:51:08' },
  { roundId: 4412, ticker: 'GMEx', leverage: 5, side: 'long', stakeEth: 0.1, entryX: 1.0, exitX: 12.4, ruggedAtX: 15.85, pnlEth: 1.14, outcome: 'sold', timeLabel: '00:48:55' },
  { roundId: 4411, ticker: 'TSLAx', leverage: 25, side: 'long', stakeEth: 0.5, entryX: 1.31, exitX: null, ruggedAtX: 1.33, pnlEth: -0.5, outcome: 'called', timeLabel: '00:47:02' },
  { roundId: 4410, ticker: 'NVDAx', leverage: 20, side: 'long', stakeEth: 0.25, entryX: 1.0, exitX: 1.61, ruggedAtX: 4.02, pnlEth: 0.1525, outcome: 'sold', timeLabel: '00:45:19' },
  { roundId: 4409, ticker: 'HOODx', leverage: 20, side: 'long', stakeEth: 1.0, entryX: 2.2, exitX: null, ruggedAtX: 2.34, pnlEth: -1.0, outcome: 'called', timeLabel: '00:43:44' },
]

export const BIGGEST_WINS: LeaderRow[] = [
  { rank: 1, handle: 'thetagang', tint: '#1fb6a6', ticker: 'GMEx', atX: 48.21, valueEth: 2.4, tag: 'GOAT' },
  { rank: 2, handle: 'rughunter.eth', tint: '#7c5cff', ticker: 'TSLAx', atX: 31.7, valueEth: 1.91, tag: null },
  { rank: 3, handle: 'marginqueen', tint: '#be185d', ticker: 'NVDAx', atX: 24.02, valueEth: 1.68, tag: null },
  { rank: 4, handle: 'hoodlum.eth', tint: '#c2751b', ticker: 'HOODx', atX: 19.4, valueEth: 1.16, tag: null },
  { rank: 5, handle: '0xdead...beef', tint: '#db2777', ticker: 'GMEx', atX: 15.85, valueEth: 0.95, tag: null },
  { rank: 6, handle: 'shortking.eth', tint: '#3d7bd9', ticker: 'SPYx', atX: 12.3, valueEth: 0.86, tag: null },
  { rank: 7, handle: 'you', tint: '#ffc247', ticker: 'GMEx', atX: 12.4, valueEth: 1.14, tag: null, isYou: true },
  { rank: 8, handle: 'cathiewood2', tint: '#3ba55d', ticker: 'AAPLx', atX: 9.77, valueEth: 0.71, tag: null },
]

export const BEST_EXITS: LeaderRow[] = [
  { rank: 1, handle: 'papertrader', tint: '#8b5cf6', ticker: 'AMZNx', atX: 2.78, valueEth: 2.79, tag: 'SNIPER' },
  { rank: 2, handle: 'dianafan', tint: '#2563eb', ticker: 'NVDAx', atX: 4.68, valueEth: 4.7, tag: null },
  { rank: 3, handle: 'thetagang', tint: '#1fb6a6', ticker: 'TSLAx', atX: 8.9, valueEth: 8.94, tag: null },
  { rank: 4, handle: 'wsb_refugee', tint: '#22c55e', ticker: 'HOODx', atX: 1.92, valueEth: 1.94, tag: null },
  { rank: 5, handle: 'liquidated_larry', tint: '#0ea5e9', ticker: 'GMEx', atX: 15.79, valueEth: 15.85, tag: null },
]

export const HALL_OF_SHAME: LeaderRow[] = [
  { rank: 1, handle: 'liquidated_larry', tint: '#0ea5e9', ticker: 'TSLAx', atX: 1.01, valueEth: -14.2, tag: 'MARTYR' },
  { rank: 2, handle: 'fomo_frank', tint: '#14b8a6', ticker: 'GMEx', atX: 1.0, valueEth: -9.86, tag: null },
  { rank: 3, handle: 'hoodlum.eth', tint: '#c2751b', ticker: 'NVDAx', atX: 1.02, valueEth: -8.4, tag: null },
  { rank: 4, handle: 'anon', tint: '#64748b', ticker: 'AMZNx', atX: 1.03, valueEth: -6.11, tag: null },
  { rank: 5, handle: 'you', tint: '#ffc247', ticker: 'AAPLx', atX: 1.02, valueEth: -0.5, tag: null, isYou: true },
]

export const TOP_REFERRERS: ReferrerRow[] = [
  { rank: 1, handle: 'rughunter.eth', tint: '#7c5cff', referees: 214, volumeEth: 1042.6, earnedEth: 20.85 },
  { rank: 2, handle: 'thetagang', tint: '#1fb6a6', referees: 168, volumeEth: 803.1, earnedEth: 16.06 },
  { rank: 3, handle: 'marginqueen', tint: '#be185d', referees: 97, volumeEth: 452.4, earnedEth: 9.04 },
  { rank: 4, handle: 'papertrader', tint: '#8b5cf6', referees: 61, volumeEth: 288.9, earnedEth: 5.77 },
  { rank: 5, handle: 'dianafan', tint: '#2563eb', referees: 33, volumeEth: 154.2, earnedEth: 3.08 },
]

/* ------------------------------------------------------------------ *
 * Everything environment-specific lives here and nowhere else.
 *
 * Nora: these are plain constants on purpose. No injection, no schema
 * validation, no fail-loud key check — that is yours to do your way.
 * The UI only ever reads them.
 * ------------------------------------------------------------------ */
export const CHAIN = {
  networkName: 'Robinhood Chain',
  explorerName: 'Hoodscan',
  explorerBaseUrl: 'https://example-explorer.invalid/tx/',
  houseEdgePct: 2,
  maxPayoutX: 25,
  /** The house's per-position stake cap, in ETH. What MAX sets. */
  maxStakeEth: 25,
  medianRoundSecLow: 15,
  medianRoundSecHigh: 25,
  intermissionSec: 5,
  dailyPotEth: 1,
  referralSharePct: 20,
  referralCode: 'RJSAZMEV',
  referralUrl: 'https://example-margincall.invalid/r/RJSAZMEV',
  referralRefereeCount: 7,
  referralVolumeEth: 42.69,
  referralEarnedEth: 1.337,
  referralClaimableEth: 0.42,
  paperStartEth: 10000,
} as const

/* Product configuration for the console. Denominations and leverage
 * steps are the house's, not the player's — they belong here beside the
 * house edge, not hard-coded into the control that renders them. */
export const STAKE_CHIPS_ETH = [0.1, 0.5, 1, 5] as const

/* Auto-sell targets, as multiples of your entry.
 *
 * This replaced a player-facing leverage picker, which was a mistake:
 * leverage in this game belongs to the ROUND — the house opens "20x
 * long NVDAx" and every player in it is on the same leverage. A second
 * leverage in the console meant two different numbers called leverage
 * on one screen. Auto-sell is the control crash players actually reach
 * for, and it is the one that stops a round ending badly. */
export const AUTO_SELL_STEPS_X = [1.5, 2, 3, 5, 10] as const

/** The committed seed for the live round, revealed after it settles. */
export const FAIRNESS = {
  roundId: 4417,
  serverSeedHash: '0x7f3a91c04be25d68a1f704c39b8e2d5710ac46bf9d3e820517cb64a09f2e1d83',
  clientSeed: 'margincall-4417-nvdax',
  nonce: 4417,
  previousRoundId: 4416,
  previousServerSeed: '0x2b8f04ad19e7c36051fa7d24b90c8e13675af02dc94b18e5730fa26c81d40b97',
  previousRuggedAtX: 2.79,
} as const
