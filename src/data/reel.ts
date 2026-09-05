/* ------------------------------------------------------------------ *
 * MARGIN CALL — the reel.
 *
 *   DELETE THIS FILE AT INTEGRATION, along with sample.ts.
 *
 * This is a presentation device and nothing more. A crash game that
 * sits still is not a crash game, and there is no way to judge the
 * table, the ticket, the shredder or the players rail against a frozen
 * frame — so the page walks a FIXED list of hand-typed frames on a
 * timer and loops. There is no simulation here, no price model, no
 * random number and no clock arithmetic: just an array and an index.
 *
 * It runs one full round in about fifteen seconds so the whole
 * live -> called -> intermission cycle can be watched without waiting:
 *
 *   six live frames climbing 3.21x -> 6.84x   (~8.4s)
 *   the margin call at 2.79x                  (~3.2s)
 *   three intermission frames counting down   (~3.0s)
 *
 * Every frame's payoutX and pnlEth were worked out by hand against the
 * one open position in sample.ts (0.50 ETH long, entry 2.61x) so the
 * ticket can never disagree with the number above it:
 *
 *   payoutX = currentX / 2.61      pnlEth = 0.50 * (payoutX - 1)
 *
 * `candles` is how many of CANDLES / CANDLES_CALLED to draw, so the
 * chart's last close always equals the multiplier printed over it.
 * ------------------------------------------------------------------ */

import type { RoundPhase } from './types'

export interface ReelFrame {
  phase: RoundPhase
  /** Round multiple, or the rug multiple once the phase is 'called'. */
  currentX: number
  elapsedSec: number
  /** Seconds until the next round opens. Only read during intermission. */
  opensInSec: number
  /** How many candles of the path are drawn at this frame. */
  candles: number
  holding: number
  watching: number
  /** Your live payout multiple, or null once the position is gone. */
  payoutX: number | null
  /** Your unrealised P&L in ETH; the realised loss on the called frame. */
  pnlEth: number | null
  /** How long this frame sits on screen. */
  holdMs: number
}

export const REEL: ReelFrame[] = [
  { phase: 'live', currentX: 3.21, elapsedSec: 22, opensInSec: 0, candles: 19, holding: 47, watching: 131, payoutX: 1.2299, pnlEth: 0.1149, holdMs: 1400 },
  { phase: 'live', currentX: 3.9, elapsedSec: 24, opensInSec: 0, candles: 20, holding: 45, watching: 133, payoutX: 1.4943, pnlEth: 0.2471, holdMs: 1400 },
  { phase: 'live', currentX: 4.34, elapsedSec: 26, opensInSec: 0, candles: 22, holding: 44, watching: 134, payoutX: 1.6628, pnlEth: 0.3314, holdMs: 1400 },
  { phase: 'live', currentX: 5.18, elapsedSec: 28, opensInSec: 0, candles: 23, holding: 43, watching: 135, payoutX: 1.9846, pnlEth: 0.4923, holdMs: 1400 },
  { phase: 'live', currentX: 5.83, elapsedSec: 30, opensInSec: 0, candles: 25, holding: 42, watching: 136, payoutX: 2.2337, pnlEth: 0.6169, holdMs: 1400 },
  { phase: 'live', currentX: 6.84, elapsedSec: 32, opensInSec: 0, candles: 26, holding: 41, watching: 137, payoutX: 2.6207, pnlEth: 0.8103, holdMs: 1400 },
  /* The call. Two candles further on, the position is gone, and the
   * stake is the loss — a margin call takes the whole position. */
  { phase: 'called', currentX: 2.79, elapsedSec: 34, opensInSec: 0, candles: 28, holding: 0, watching: 137, payoutX: null, pnlEth: -0.5, holdMs: 3200 },
  { phase: 'intermission', currentX: 1.0, elapsedSec: 0, opensInSec: 3, candles: 0, holding: 0, watching: 129, payoutX: null, pnlEth: null, holdMs: 1000 },
  { phase: 'intermission', currentX: 1.0, elapsedSec: 0, opensInSec: 2, candles: 0, holding: 0, watching: 132, payoutX: null, pnlEth: null, holdMs: 1000 },
  { phase: 'intermission', currentX: 1.0, elapsedSec: 0, opensInSec: 1, candles: 0, holding: 0, watching: 135, payoutX: null, pnlEth: null, holdMs: 1000 },
]

/** The frame the page renders before the reel has ticked once, and the
 *  frame every screenshot and every server render starts from. */
export const REEL_START = 5
