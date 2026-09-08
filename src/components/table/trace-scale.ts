import type { Candle } from '../../data/types'

/* The tape's vertical scale, shared by the chart and by the HTML
 * labels positioned over it. Ported from margincall-onety-ui
 * (src/components/trace-scale.ts) so the laddered behaviour that took
 * several bug reports to land does not regress here. It lives in its
 * own module so both readers see the same numbers — a second copy of
 * this ladder in the stage would drift the moment either was touched. */

/** The axis only ever sits on one of these ceilings. The sub-1.5 rungs
 * matter for rounds trading under 1.00x: with 1.5 as the lowest rung a
 * 0.7x round wasted the whole top half of the plot (Rasta's 0.69x
 * screenshot). Candle 0 opens at exactly 1.00x so peak >= 1, meaning
 * the 1.00x reference line always stays inside the band. */
export const CEILINGS = [1.08, 1.2, 1.35, 1.5, 2, 3, 5, 8, 13, 21, 34, 55]

/** ... and the floor steps down this ladder when the path dips under
 * 1.00x. Same reasoning as the ceilings: hugging the revealed low made
 * the chart slide, a fixed floor drew sub-1.00x candles off the plot
 * (Onety's 0.51x round rendered below the frame). */
export const FLOORS = [0.88, 0.75, 0.6, 0.45, 0.3, 0.15, 0.05]

/** Default floor when the path stays at or above 1.00x. */
export const FLOOR = FLOORS[0]

export function ceilingFor(candles: Candle[], revealCount?: number): number {
  const shown = Math.max(1, Math.min(candles.length, revealCount ?? candles.length))
  const peak = Math.max(...candles.slice(0, shown).map((c) => c.highX), 1)
  return CEILINGS.find((c) => c >= peak * 1.04) ?? peak * 1.1
}

export function floorFor(candles: Candle[], revealCount?: number): number {
  const shown = Math.max(1, Math.min(candles.length, revealCount ?? candles.length))
  /* Lows under 0.05 are the terminal rug tick (the engine clamps real
   * prices at 0.05; buildCandles slams the last candle to 0.02). That
   * slam is meant to fall off the bottom of the plot, so it must not
   * drag the floor down and squash the whole path on the final frame. */
  const lows = candles.slice(0, shown).map((c) => c.lowX).filter((v) => v >= 0.05)
  const trough = Math.min(...(lows.length ? lows : [1]), 1)
  return FLOORS.find((f) => f <= trough * 0.96) ?? FLOORS[FLOORS.length - 1]
}

/** Where a value sits in the band, 0 at the bottom edge to 1 at the top. */
export function ratioOf(value: number, ceiling: number, floor: number = FLOOR): number {
  return (value - floor) / (ceiling - floor)
}
