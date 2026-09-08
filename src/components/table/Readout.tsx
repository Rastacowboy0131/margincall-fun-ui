import type { RoundPhase } from '../../data/types'
import { x } from '../../lib/format'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The readout band across the top of the chart: the multiple in the
 * display face, lime while the round is above its open, red under it
 * or once called, amber during the countdown. Beside it, one line about
 * your position. It sits ABOVE the candles instead of over them, so
 * the chart stays readable.
 * ------------------------------------------------------------------ */

export function Readout({ phase, currentX, opensInSec, payoutX, pnlEth }: { phase: RoundPhase; currentX: number; opensInSec: number; payoutX: number | null; pnlEth: number | null }) {
  const called = phase === 'called', inter = phase === 'intermission'
  const tone = called || (!inter && currentX < 1) ? 'text-down' : inter ? 'text-amber' : 'text-ink'
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="flex items-end gap-4">
        <span className={cx('display num text-reel tracking-wide transition-colors duration-300', tone)} aria-hidden="true">
          {inter ? `${opensInSec}s` : <>{currentX.toFixed(2)}<span className="text-[0.55em]">x</span></>}
        </span>
        <div className="mb-2 hidden sm:block">
          <div className="label">{inter ? 'Next position opens' : called ? 'Margin called at' : 'Current multiple'}</div>
          <div className="num mt-0.5 text-sm text-ink-2">
            {inter ? 'Queue a buy to fill at 1.00x' : called ? `${x(currentX)}. Anyone still holding lost the position.` : payoutX === null ? `No position. Buy here and ${x(currentX)} becomes your 1.00x.` : ''}
          </div>
        </div>
      </div>
      {payoutX !== null && pnlEth !== null && !inter && (
        <div className="mb-1 text-right">
          <div className="label">Unrealised P&L</div>
          <div className={cx('num mt-0.5 text-xl font-bold leading-none', pnlEth < 0 ? 'text-down' : 'text-lime')}>{pnlEth >= 0 ? '+' : ''}{pnlEth.toFixed(4)} ETH</div>
          <div className="num mt-1 text-xs text-ink-3">payout {x(payoutX)} on your entry</div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">{called ? `Margin called at ${x(currentX)}.` : inter ? `Next round opens in ${opensInSec} seconds.` : `Round live at ${x(currentX)}.`}</p>
    </div>
  )
}
