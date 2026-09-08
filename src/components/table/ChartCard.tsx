import type { Candle, Position, Round, RoundPhase } from '../../data/types'
import { AppLink } from '../../app/AppLink'
import { clock } from '../../lib/format'
import { CandleTape } from './CandleTape'
import { Readout } from './Readout'
import { TickerMark } from '../brand/TickerMark'
import { Icon } from '../ui/Icon'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The chart card: identity row, the readout band, then the candles
 * with the full height to themselves. On the call the card jolts once,
 * floods red and a MARGIN CALLED stamp lands. Nothing takes over the
 * page; the order panel and the rails stay where they were.
 * ------------------------------------------------------------------ */

export function ChartCard({ round, phase, candles, revealCount, position, payoutX, pnlEth, sound, onSound }: {
  round: Round; phase: RoundPhase; candles: Candle[]; revealCount?: number; position: Position | null; payoutX: number | null; pnlEth: number | null; sound: boolean; onSound: (v: boolean) => void
}) {
  const called = phase === 'called', live = phase === 'live'
  return (
    <section className={cx('card relative flex min-h-[360px] flex-col overflow-hidden sm:min-h-[460px] lg:min-h-[540px]', called && 'anim-jolt')}>
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <TickerMark ticker={round.ticker} size={34} />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2"><span className="text-[15px] font-bold text-ink">{round.ticker.symbol}</span><span className="num text-xs font-semibold text-ink-2">{round.leverage}x long</span></div>
          <div className="num text-2xs text-ink-3">{round.ticker.name} · round #{round.id}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={cx('num flex h-7 items-center gap-1.5 rounded-pill border px-2.5 text-xs font-semibold', called ? 'border-down/50 text-down' : live ? 'border-lime/50 text-lime' : 'border-amber/50 text-amber')}>
            <span aria-hidden="true" className={cx('size-1.5 rounded-pill bg-current', live && 'anim-pulse')} />
            {called ? 'Called' : live ? `Live ${clock(round.elapsedSec)}` : `Opens ${round.opensInSec}s`}
          </span>
          <span className="num hidden h-7 items-center gap-1.5 rounded-pill border border-line-2 px-2.5 text-xs text-ink-2 sm:flex"><Icon name="users" size={12} />{round.watching}</span>
          <AppLink to="/verify" className="hidden h-7 items-center gap-1.5 rounded-pill border border-line-2 px-2.5 text-xs font-semibold text-ink-2 transition-colors hover:text-lime sm:flex"><Icon name="fair" size={12} />Fair</AppLink>
          <button type="button" onClick={() => onSound(!sound)} aria-pressed={sound} className="grid size-7 place-items-center rounded-pill text-ink-3 transition-colors hover:text-ink">
            <Icon name={sound ? 'sound-on' : 'sound-off'} size={15} /><span className="sr-only">{sound ? 'Mute' : 'Unmute'}</span>
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 sm:px-5">
        <Readout phase={phase} currentX={round.currentX} opensInSec={round.opensInSec} payoutX={payoutX} pnlEth={pnlEth} />
      </div>

      {/* The chart's slot is a flex child, so its own height is not
       * "definite" and a percentage height inside it resolves to zero.
       * An absolute box inside the slot gives the tape a real height. */}
      <div className="relative mx-4 mt-2 mb-3 min-h-[200px] flex-1 sm:mx-5">
        <div className="absolute inset-0">
          <CandleTape candles={candles} revealCount={revealCount} entryX={position ? position.entryX : null} currentX={round.currentX} phase={phase} elapsedSec={round.elapsedSec} />
        </div>
      </div>

      {called && (
        <>
          <span aria-hidden="true" className="anim-flood pointer-events-none absolute inset-0 z-10" style={{ background: 'radial-gradient(70% 60% at 50% 55%, rgb(255 59 59 / 0.32), rgb(60 12 12 / 0.55))' }} />
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
            <span className="anim-stamp display rounded-[6px] border-[3px] border-down px-5 py-2 text-[clamp(28px,5vw,56px)] leading-none tracking-wider text-down">Margin called</span>
          </div>
        </>
      )}
    </section>
  )
}
