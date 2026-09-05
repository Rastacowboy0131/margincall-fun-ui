/* ------------------------------------------------------------------ *
 * Display formatters. These turn a number the caller already has into
 * the string the domain expects to read. There is no arithmetic in this
 * file beyond rounding for display, and there must never be: anything
 * that computes a value the player cares about belongs behind the
 * adapter, not in the presentation layer.
 * ------------------------------------------------------------------ */

/** A multiple. Always two decimals, always the trailing x. `1.94x`. */
export function x(value: number): string {
  return `${value.toFixed(2)}x`
}

/** ETH, signed, for anything that is a profit or a loss. `+0.81` / `-0.50`
 *  The sign is always drawn, including on zero, because a P&L column
 *  where some rows have a sign and some do not fails to align. */
export function signedEth(value: number, dp = 2): string {
  const sign = value < 0 ? '-' : '+'
  return `${sign}${Math.abs(value).toFixed(dp)}`
}

/** ETH as a balance rather than a change: no sign, thousands grouped. */
export function eth(value: number, dp = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })
}

/** Balances run to five figures, so the header would otherwise reflow
 *  every time one changed. `9,496.66` -> `9.50K`. */
export function ethShort(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)}K`
  return value.toFixed(2)
}

/** An underlying's price on the tape — the only price in the product. */
export function price(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** A signed percentage for the tape. */
export function signedPct(value: number): string {
  return `${value < 0 ? '-' : '+'}${Math.abs(value).toFixed(2)}%`
}

/** Seconds as m:ss for the round clock. */
export function clock(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Which band a settled round falls into. The results strip along the
 * top is read like a roulette board, so the bands have to mean
 * something a player already recognises — and the band is carried by a
 * LABEL as well as a colour everywhere it is used, because roughly one
 * man in twelve cannot separate the mint from the red.
 */
export type ResultBand = 'dust' | 'ok' | 'big' | 'monster'

export function bandOf(ruggedAtX: number): ResultBand {
  if (ruggedAtX < 1.5) return 'dust'
  if (ruggedAtX < 5) return 'ok'
  if (ruggedAtX < 15) return 'big'
  return 'monster'
}

export const BAND_LABEL: Record<ResultBand, string> = {
  dust: 'died early',
  ok: 'ordinary round',
  big: 'big round',
  monster: 'monster round',
}

/** Long handles are real and yours are not. Anything rendering a handle
 *  in a fixed-width slot clamps with CSS; this is for the few places
 *  that need a hard character budget (the ticket, which is 32 columns
 *  of dot matrix and cannot wrap). */
export function clampHandle(handle: string, max = 16): string {
  return handle.length <= max ? handle : `${handle.slice(0, max - 1)}…`
}
