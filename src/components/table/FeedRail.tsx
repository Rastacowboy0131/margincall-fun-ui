import type { Activity } from '../../data/types'
import { signedEth, x } from '../../lib/format'
import { Avatar } from '../brand/Avatar'
import { Panel } from '../ui/Panel'
import { cx } from '../../lib/cx'

/* The live feed. Who just got out, who just got in, who just got taken.
 *
 * The verb is the carrier — "sold", "bought", "margin called" — with the
 * colour agreeing with it rather than replacing it. */

const ACTION: Record<Activity['action'], { verb: string; tone: string }> = {
  bought: { verb: 'bought', tone: 'text-ink-2' },
  sold: { verb: 'sold', tone: 'text-up' },
  called: { verb: 'margin called', tone: 'text-down' },
}

function Row({ item }: { item: Activity }) {
  const a = ACTION[item.action]
  const you = item.handle === 'you'
  return (
    <li className={cx('flex flex-col gap-0.5 px-3 py-2', you && 'bg-gold-wash')}>
      <div className="flex items-center gap-2">
        <Avatar handle={item.handle} tint={item.tint} size={22} />
        <span
          className={cx('min-w-0 flex-1 truncate text-xs font-bold', you ? 'text-gold' : 'text-ink')}
        >
          {you ? 'you' : item.handle}
        </span>
        <span
          className={cx(
            'nums shrink-0 text-xs font-extrabold',
            item.pnlEth === null ? 'text-ink-3' : item.pnlEth < 0 ? 'text-down' : 'text-up',
          )}
        >
          {item.pnlEth === null ? '—' : `${signedEth(item.pnlEth)} ETH`}
        </span>
      </div>
      {/* Second line rather than a squeezed one: in a 292px rail the
       * single-line version truncated the handle to three characters and
       * still clipped the multiple, which is the part carrying the news. */}
      <div className="flex items-baseline gap-1.5 pl-[30px] text-[11px]">
        <span className="nums text-ink-3">{item.timeLabel}</span>
        <span className={a.tone}>{a.verb}</span>
        <span className="nums font-bold text-ink-2">{x(item.atX)}</span>
        <span className="ml-auto shrink-0 text-ink-3">{item.ticker}</span>
      </div>
    </li>
  )
}

export function FeedRail({ items }: { items: Activity[] }) {
  return (
    <Panel
      title="Live feed"
      bodyClassName="p-0"
      count={
        <span aria-hidden="true" className="anim-pulse size-1.5 rounded-chip bg-live" />
      }
    >
      {items.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-ink-3">
          Quiet. Nobody has moved since the round opened.
        </p>
      ) : (
        <ul className="scroll-y max-h-[260px] divide-y divide-rim">
          {items.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Panel>
  )
}
