import type { Ticker } from '../../data/types'
import { cx } from '../../lib/cx'

export function TickerMark({ ticker, size = 26, className }: { ticker: Ticker; size?: number; className?: string }) {
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-[7px] font-extrabold tracking-tight', className)}
      style={{ width: size, height: size, background: ticker.swatch, color: ticker.darkInk ? '#070a07' : '#ffffff', fontSize: Math.round(size * 0.36) }} aria-hidden="true">
      {ticker.mark}
    </span>
  )
}
