import type { Ticker } from '../../data/types'
import { cx } from '../../lib/cx'

export function TickerMark({ ticker, size = 30, className }: { ticker: Ticker; size?: number; className?: string }) {
  return (
    <span
      className={cx('display grid shrink-0 place-items-center rounded-[10px] font-extrabold', className)}
      style={{ width: size, height: size, background: ticker.swatch, color: ticker.darkInk ? '#05070f' : '#ffffff', fontSize: Math.round(size * 0.34) }}
      aria-hidden="true"
    >
      {ticker.mark}
    </span>
  )
}
