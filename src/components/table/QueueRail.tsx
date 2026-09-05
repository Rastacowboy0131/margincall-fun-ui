import type { QueuedRound, Round, RoundPhase } from '../../data/types'
import { x } from '../../lib/format'
import { TickerMark } from '../brand/TickerMark'
import { Panel } from '../ui/Panel'
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
        'flex shrink-0 items-center gap-3 rounded-key border-2 px-3 py-2.5',
        over ? 'border-down bg-down-wash' : 'border-gold bg-gold-wash',
        className,
      )}
    >
      <TickerMark ticker={round.ticker} size={34} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="truncate text-sm font-extrabold text-ink">{round.ticker.symbol}</span>
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
        'flex shrink-0 items-center gap-2.5 rounded-key border border-rim bg-panel px-2.5 py-2.5',
        className,
      )}
    >
      <TickerMark ticker={item.ticker} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="truncate text-xs font-bold text-ink">{item.ticker.symbol}</span>
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
  return (
    <>
      <Panel title="Up next" bodyClassName="p-2.5" className="hidden lg:block">
        <ul className="flex flex-col gap-2">
          <LiveCard round={round} phase={phase} />
          {queue.map((q, i) => (
            <QueueCard key={q.ticker.symbol + q.startsInLabel} item={q} ordinal={ORDINALS[i] ?? ''} />
          ))}
        </ul>
      </Panel>

      <section className="lg:hidden">
        <h2 className="eyebrow mb-2 px-1 text-ink-3">Up next</h2>
        <ul className="rail flex gap-2 pb-1">
          <LiveCard round={round} phase={phase} className="w-[210px]" />
          {queue.map((q, i) => (
            <QueueCard
              key={q.ticker.symbol + q.startsInLabel}
              item={q}
              ordinal={ORDINALS[i] ?? ''}
              className="w-[158px]"
            />
          ))}
        </ul>
      </section>
    </>
  )
}
