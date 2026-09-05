import type { Ticker } from '../../data/types'
import { cx } from '../../lib/cx'

/* The medallion for a tokenised equity. The swatch is the underlying's
 * own brand colour, so it is raw hex from the data rather than a token
 * — `darkInk` on the Ticker says which way the letters go, which saves
 * every caller doing a luminance calculation on a value it was handed. */

export function TickerMark({
  ticker,
  size = 34,
  className,
}: {
  ticker: Ticker
  size?: number
  className?: string
}) {
  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center rounded-tag font-extrabold tracking-tight',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: ticker.swatch,
        color: ticker.darkInk ? 'var(--color-void)' : '#ffffff',
        fontSize: size * 0.4,
        boxShadow: 'inset 0 -2px 0 rgb(0 0 0 / 0.28), 0 2px 0 rgb(0 0 0 / 0.4)',
      }}
      aria-hidden="true"
    >
      {ticker.mark}
    </span>
  )
}
