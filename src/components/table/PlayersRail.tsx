import type { Player } from '../../data/types'
import { signedEth, x } from '../../lib/format'
import { Avatar } from '../brand/Avatar'
import { Panel } from '../ui/Panel'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * Everyone else at the table.
 *
 * The social layer is most of why a crash game is fun: you are not
 * betting against a machine, you are watching eleven other people
 * decide whether to get out. So the rail is prominent, it is drawn as
 * seats rather than as a data table, and it reflows on a phone into a
 * horizontal row of chips rather than being hidden behind a tab.
 *
 * Status is carried three ways — a ring on the chip, a word, and the
 * sign on the P&L — because one man in twelve cannot separate the mint
 * from the red.
 * ------------------------------------------------------------------ */

const STATUS: Record<Player['status'], { label: string; tone: string; ring: 'up' | 'down' | 'gold' | undefined }> = {
  holding: { label: 'in', tone: 'text-gold', ring: 'gold' },
  out: { label: 'out', tone: 'text-up', ring: 'up' },
  called: { label: 'rekt', tone: 'text-down', ring: 'down' },
}

function Row({ player, you }: { player: Player; you?: boolean }) {
  const s = STATUS[player.status]
  return (
    <li
      className={cx(
        'anim-slot flex items-center gap-2.5 px-3 py-2.5',
        you && 'bg-gold-wash',
      )}
    >
      <Avatar handle={player.handle} tint={player.tint} size={30} ring={s.ring} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cx(
              'truncate text-xs font-bold',
              you ? 'text-gold' : 'text-ink',
            )}
          >
            {you ? 'you' : player.handle}
          </span>
          <span className={cx('eyebrow shrink-0 text-[9px]', s.tone)}>{s.label}</span>
        </div>
        <span className="nums text-[11px] text-ink-3">entry {x(player.entryX)}</span>
      </div>
      <div className="shrink-0 text-right">
        <div
          className={cx(
            'nums text-xs font-extrabold',
            player.pnlEth < 0 ? 'text-down' : 'text-up',
          )}
        >
          {signedEth(player.pnlEth)}
        </div>
        <div className="nums text-[11px] text-ink-2">{x(player.atX)}</div>
      </div>
    </li>
  )
}

function Seat({ player }: { player: Player }) {
  const s = STATUS[player.status]
  return (
    <li className="flex w-[86px] shrink-0 flex-col items-center gap-1.5 rounded-key border border-rim bg-panel px-1.5 py-2.5">
      <Avatar handle={player.handle} tint={player.tint} size={32} ring={s.ring} />
      <span className="w-full truncate text-center text-[10px] font-bold text-ink-2">
        {player.handle}
      </span>
      <span
        className={cx(
          'nums rounded-tag px-1.5 py-0.5 text-[10px] font-extrabold',
          player.pnlEth < 0 ? 'bg-down-wash text-down' : 'bg-up-wash text-up',
        )}
      >
        {signedEth(player.pnlEth)}
      </span>
    </li>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-key border-2 border-dashed border-rim px-4 py-7 text-center">
      <span className="text-2xl" aria-hidden="true">
        🪑
      </span>
      <p className="text-xs font-bold text-ink-2">The table is being reset</p>
      <p className="max-w-[26ch] text-[11px] text-ink-3">
        Nobody holds a position between rounds. Seats fill again the moment the next one opens.
      </p>
    </div>
  )
}

export function PlayersRail({
  players,
  watching,
  you,
}: {
  players: Player[]
  watching: number
  /** The viewer's own seat, assembled from their position. Kept out of
   *  the `players` array so the rail can never claim you are holding
   *  while the console says you are flat. */
  you: Player | null
}) {
  const seats = you ? [you, ...players] : players

  return (
    <>
      {/* --- desktop: a vertical rail of seats --- */}
      <Panel
        title="At the table"
        count={
          <span className="nums flex items-center gap-1.5 text-xs font-extrabold text-live">
            <span aria-hidden="true" className="anim-pulse size-1.5 rounded-chip bg-live" />
            {watching}
          </span>
        }
        bodyClassName="p-0"
        className="hidden h-full min-h-0 lg:flex lg:flex-col"
      >
        {seats.length === 0 ? (
          <div className="p-3">
            <Empty />
          </div>
        ) : (
          <ul className="scroll-y max-h-[420px] divide-y divide-rim">
            {seats.map((p, i) => (
              <Row key={p.handle} player={p} you={i === 0 && you !== null} />
            ))}
          </ul>
        )}
      </Panel>

      {/* --- phone: the same seats, laid along the rim --- */}
      <section className="lg:hidden">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="eyebrow text-ink-3">At the table</h2>
          <span className="nums flex items-center gap-1.5 text-xs font-extrabold text-live">
            <span aria-hidden="true" className="anim-pulse size-1.5 rounded-chip bg-live" />
            {watching} watching
          </span>
        </div>
        {seats.length === 0 ? (
          <Empty />
        ) : (
          <ul className="rail flex gap-2 pb-1">
            {seats.map((p) => (
              <Seat key={p.handle} player={p} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
