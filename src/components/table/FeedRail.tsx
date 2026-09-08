import type { Activity } from '../../data/types'
import { signedEth, x } from '../../lib/format'
import { Avatar } from '../brand/Avatar'
import { Panel } from '../ui/Panel'
import { displayName, useProfile } from '../../lib/profile'
import { cx } from '../../lib/cx'

/* The activity feed: time, who, what, at what multiple, for how much. */

const ACTION: Record<Activity['action'], { verb: string; cls: string }> = {
  bought: { verb: 'bought', cls: 'text-lime' },
  sold: { verb: 'sold', cls: 'text-amber' },
  called: { verb: 'liquidated', cls: 'text-down' },
}

export function FeedRail({ items }: { items: Activity[] }) {
  const profile = useProfile()
  return (
    <Panel title="Activity feed" icon="feed" bodyClassName="p-0">
      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-ink-3">Quiet. Nobody has moved since the round opened.</p>
      ) : (
        <ul className="scroll-y max-h-[300px] divide-y divide-line">
          {items.map((f) => {
            const you = f.handle === 'you'
            const a = ACTION[f.action]
            return (
              <li key={f.id} className={cx('row-in grid grid-cols-[56px_1fr_auto] sm:grid-cols-[64px_1fr_auto] items-center gap-3 px-4 py-2 text-xs', you && 'bg-lime-wash/60')}>
                <span className="num text-ink-3">{f.timeLabel}</span>
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar handle={you ? displayName(profile) : f.handle} tint={f.tint} size={18} pfp={you ? profile.pfp || undefined : undefined} />
                  <span className={cx('truncate font-bold', you ? 'text-lime' : 'text-ink')}>{you ? displayName(profile) : f.handle}</span>
                  <span className={cx('shrink-0 font-semibold', a.cls)}>{a.verb}</span>
                  <span className="num shrink-0 font-bold text-ink">{x(f.atX)}</span>
                  {f.entryX !== null && <span className="num hidden shrink-0 text-ink-3 sm:inline">entry {x(f.entryX)}</span>}
                </span>
                <span className="num flex items-center gap-2 text-right">
                  {f.pnlEth !== null && <span className={f.pnlEth < 0 ? 'text-down' : 'text-lime'}>({signedEth(f.pnlEth)} ETH)</span>}
                  <span className="hidden text-ink-3 sm:inline">{f.ticker}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
