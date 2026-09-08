import type { Player } from '../../data/types'
import { signedEth, x } from '../../lib/format'
import { Avatar } from '../brand/Avatar'
import { Panel } from '../ui/Panel'
import { displayName, useProfile } from '../../lib/profile'
import { cx } from '../../lib/cx'

/* Live players: who is in, who got out, who got taken. Holding first. */

const STATUS: Record<Player['status'], { label: string; cls: string; ring: 'lime' | 'down' | 'amber' }> = {
  holding: { label: 'in', cls: 'bg-amber-wash text-amber', ring: 'amber' },
  out: { label: 'out', cls: 'bg-lime-wash text-lime', ring: 'lime' },
  called: { label: 'rekt', cls: 'bg-down-wash text-down', ring: 'down' },
}

function Row({ player, you }: { player: Player; you?: boolean }) {
  const s = STATUS[player.status]
  const profile = useProfile()
  const name = you ? displayName(profile) : player.handle
  return (
    <li className={cx('row-in flex items-center gap-2.5 px-3 py-2', you && 'bg-lime-wash/60')}>
      <Avatar handle={name} tint={player.tint} size={26} ring={s.ring} pfp={you ? profile.pfp || undefined : undefined} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5"><span className={cx('truncate text-xs font-bold', you ? 'text-lime' : 'text-ink')}>{name}</span><span className={cx('rounded-[4px] px-1 text-[9px] font-bold uppercase', s.cls)}>{s.label}</span></div>
        <span className="num text-[11px] text-ink-3">entry {x(player.entryX)}</span>
      </div>
      <div className="num shrink-0 text-right">
        <div className={cx('text-xs font-bold', player.pnlEth < 0 ? 'text-down' : 'text-lime')}>{signedEth(player.pnlEth)} ETH</div>
        <div className="text-[11px] text-ink-3">{x(player.atX)}</div>
      </div>
    </li>
  )
}

export function PlayersRail({ players, watching, you }: { players: Player[]; watching: number; you: Player | null }) {
  const order = { holding: 0, out: 1, called: 2 }
  const seats = [...(you ? [you] : []), ...[...players].sort((a, b) => order[a.status] - order[b.status])]
  return (
    <Panel title="Live players" icon="users" bodyClassName="p-0" className="flex h-full flex-col"
      count={<span className="num flex items-center gap-1.5 text-xs font-bold text-lime"><span aria-hidden="true" className="anim-pulse size-1.5 rounded-pill bg-lime" />{watching}</span>}>
      {seats.length === 0 ? (
        <div className="px-4 py-8 text-center"><p className="text-xs font-semibold text-ink-2">Table resetting</p><p className="mx-auto mt-1 max-w-[26ch] text-2xs text-ink-3">Nobody holds a position between rounds. Seats fill when the next one opens.</p></div>
      ) : (
        <ul className="scroll-y max-h-[440px] divide-y divide-line">{seats.map((p, i) => <Row key={p.handle} player={p} you={i === 0 && you !== null} />)}</ul>
      )}
    </Panel>
  )
}
