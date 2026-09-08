import type { Position } from '../../data/types'
import { signedEth, stake, x } from '../../lib/format'
import { TickerMark } from '../brand/TickerMark'
import { cx } from '../../lib/cx'

/* Your seat on the flight, as one row under the cockpit. ABOARD while
 * you hold, EJECTED once you sell, LOST when the call lands, at which
 * point the row burns out of the page. */

export type TicketStamp = 'none' | 'cashed' | 'liquidated'

export function PositionCard({ position, payoutX, pnlEth, stamp, className }: {
  position: Position
  payoutX: number | null
  pnlEth: number | null
  stamp: TicketStamp
  className?: string
}) {
  const dead = stamp === 'liquidated', won = stamp === 'cashed'
  const neg = pnlEth !== null && pnlEth < 0
  return (
    <div
      role="status"
      className={cx(
        'grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-card border px-4 py-3',
        dead ? 'anim-burnout border-down bg-gradient-to-r from-down/20 to-transparent'
          : won ? 'anim-dock border-up bg-gradient-to-r from-up/15 to-transparent'
            : 'anim-dock border-gold bg-gradient-to-r from-gold/10 to-transparent',
        className,
      )}
      aria-label={dead ? 'Your position was lost.' : won ? `Ejected. ${pnlEth !== null ? signedEth(pnlEth, 4) : ''} ETH.` : `Aboard with ${position.stakeEth} ETH, boarded ${x(position.entryX)}.`}
    >
      <span className={cx('display rounded-[8px] px-2.5 py-1 text-sm font-bold tracking-widest', dead ? 'bg-down text-white' : won ? 'bg-up text-bg' : 'bg-gold text-bg')}>
        {dead ? 'LOST' : won ? 'EJECTED' : 'ABOARD'}
      </span>
      <div className="flex min-w-0 items-center gap-3">
        <TickerMark ticker={position.ticker} size={28} />
        <div className="min-w-0">
          <div className="text-sm font-bold text-ink">{position.ticker.symbol} {position.leverage}x · {stake(position.stakeEth)} ETH</div>
          <div className="num text-2xs text-ink-3">boarded {x(position.entryX)} · payout {dead || payoutX === null ? '0.00x' : x(payoutX)} = exit ÷ entry</div>
        </div>
      </div>
      <div className={cx('num text-right text-xl', dead || neg ? 'text-down' : 'text-up')}>
        {pnlEth === null ? '' : `${signedEth(pnlEth, 3)} ETH`}
      </div>
    </div>
  )
}
