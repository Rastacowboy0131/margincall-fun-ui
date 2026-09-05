import type { QueuedRound, Round, RoundPhase } from '../../data/types'
import { x } from '../../lib/format'
import { TickerMark } from '../brand/TickerMark'

import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * Up next.
 *
 * A crash game with a five-second gap between rounds needs somewhere
 * for the eye to go during it, and "which ticker is coming and at what
 * leverage" is genuinely what players want during that gap. The queue
 * is drawn as cards racked up behind the live one — the medallion does
 * the recognising, the leverage does the deciding.
 * ------------------------------------------------------------------ */

function LiveCard({
  round,
  phase,
  className,
}: {
  round: Round
  phase: RoundPhase
  className?: string
}) {
  const over = phase === 'called'
  return (
    <li
      className={cx(
        'flex shrink-0 items-center gap-2 rounded-key border-2 px-2 py-2.5 sm:gap-3 sm:px-3',
        over ? 'border-down bg-down-wash' : 'border-gold bg-gold-wash',
        className,
      )}
    >
      <TickerMark ticker={round.ticker} size={34} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="shrink-0 text-sm font-extrabold text-ink">{round.ticker.symbol}</span>
          <span className="nums shrink-0 text-xs font-bold text-ink-3">{round.leverage}x</span>
        </div>
        <span className={cx('eyebrow text-[9px]', over ? 'text-down' : 'text-gold')}>
          {over ? 'round over' : phase === 'intermission' ? 'resetting' : 'live now'}
        </span>
      </div>
      <span
        className={cx('nums shrink-0 text-base font-extrabold', over ? 'text-down' : 'text-gold')}
      >
        {x(round.currentX)}
      </span>
    </li>
  )
}

function QueueCard({
  item,
  ordinal,
  className,
}: {
  item: QueuedRound
  ordinal: string
  className?: string
}) {
  return (
    <li
      className={cx(
        'flex shrink-0 items-center gap-2 rounded-key border border-rim bg-panel px-2 py-2.5 sm:gap-2.5 sm:px-2.5',
        className,
      )}
    >
      <TickerMark ticker={item.ticker} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="shrink-0 text-xs font-bold text-ink">{item.ticker.symbol}</span>
          <span className="nums shrink-0 text-[11px] font-bold text-ink-3">{item.leverage}x</span>
        </div>
        <span className="eyebrow text-[9px] text-ink-3">{ordinal}</span>
      </div>
      <span className="nums shrink-0 text-xs font-bold text-live">{item.startsInLabel}</span>
    </li>
  )
}

const ORDINALS = ['next', '3rd', '4th', '5th', '6th']

export function QueueRail({
  round,
  phase,
  queue,
}: {
  round: Round
  phase: RoundPhase
  queue: QueuedRound[]
}) {
  /* Two shapes, one list.
   *
   * On a phone it is a flick-scrollable rack — vertical space is the
   * scarce thing there, so it stays one row deep. From lg it becomes a
   * wrapping board that fills the space under the chart, which is where
   * the console used to be.
   *
   * Six cards total, live one included: 3 rows of 2 at lg, 2 rows of 3
   * from xl. Six is what fills that space and nothing more — it divides
   * evenly into both counts, so the last row is never left ragged, and
   * the column count stops at 3 for the same reason.
   *
   * `lg:overflow-visible` is load-bearing: .rail sets overflow-x auto
   * and the grid needs to be allowed to wrap rather than scroll. */
  return (
    <section>
      <h2 className="eyebrow mb-2 px-1 text-ink-3">Up next</h2>
      <ul className="rail flex gap-2 pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-3">
        <LiveCard round={round} phase={phase} className="w-[210px] lg:w-auto" />
        {queue.map((q, i) => (
          <QueueCard
            key={q.ticker.symbol + q.startsInLabel}
            item={q}
            ordinal={ORDINALS[i] ?? ''}
            className="w-[184px] lg:w-auto"
          />
        ))}
      </ul>
    </section>
  )
}
