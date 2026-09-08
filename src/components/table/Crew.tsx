import type { Player } from '../../data/types'
import { signedEth, x } from '../../lib/format'
import { Avatar } from '../brand/Avatar'
import { displayName, useProfile } from '../../lib/profile'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The crew. Everyone aboard this flight, as capsules docked down the
 * side. A capsule slides in when someone boards, ejects sideways under
 * a parachute when they sell, and burns red when they go down with it.
 * Status is a word as well as a colour.
 * ------------------------------------------------------------------ */

function Chute() {
  return (
    <svg viewBox="0 0 16 16" className="anim-sway absolute -top-3 right-1 size-4 origin-bottom" aria-hidden="true">
      <path d="M1 8a7 7 0 0 1 14 0Z" fill="#ffcf5a" stroke="#05070f" strokeWidth="1" />
      <path d="M2.5 8 8 14 13.5 8" fill="none" stroke="#ffcf5a" strokeWidth="1" />
    </svg>
  )
}

function Capsule({ player, you, compact }: { player: Player; you?: boolean; compact?: boolean }) {
  const profile = useProfile()
  const name = you ? displayName(profile) : player.handle
  const st = player.status
  return (
    <li
      className={cx(
        'relative grid items-center gap-2.5 rounded-[14px] border bg-gradient-to-b from-[#121838] to-[#0b1027] px-2.5 py-2',
        compact ? 'w-[150px] shrink-0 grid-cols-[26px_1fr]' : 'grid-cols-[30px_1fr_auto]',
        st === 'holding' && 'anim-dock', st === 'out' && 'anim-eject border-up/40', st === 'called' && 'anim-burn border-down/50',
        st === 'holding' && (you ? 'border-gold shadow-[0_0_18px_rgb(255_207_90/0.25)]' : 'border-line'),
      )}
    >
      {st === 'out' && <Chute />}
      <Avatar handle={name} tint={player.tint} size={compact ? 26 : 30} ring={you ? 'gold' : undefined} pfp={you ? profile.pfp || undefined : undefined} />
      <span className="min-w-0">
        <span className="block truncate text-xs font-bold text-ink">{name}</span>
        <span className="num block text-[10px] text-ink-3">{st === 'holding' ? 'aboard' : st === 'out' ? 'ejected' : 'lost'} · {x(player.entryX)}</span>
      </span>
      <span className={cx('num text-right text-[13px]', compact && 'col-span-2 text-left', player.pnlEth < 0 ? 'text-down' : 'text-up')}>{signedEth(player.pnlEth)}</span>
    </li>
  )
}

export function Crew({ players, watching, you }: { players: Player[]; watching: number; you: Player | null }) {
  const seats = you ? [you, ...players] : players
  const head = (
    <h2 className="label flex items-center justify-between">
      Crew aboard <span className="num text-cyan">{watching}</span>
    </h2>
  )
  const empty = <div className="rounded-[14px] border border-dashed border-line-2 px-3 py-5 text-center text-xs text-ink-3">Pad is clear. Crew boards at launch.</div>
  return (
    <>
      <section className="hidden flex-col gap-2.5 lg:flex">
        {head}
        {seats.length === 0 ? empty : <ul className="scroll-y flex max-h-[600px] flex-col gap-2">{seats.map((p, i) => <Capsule key={p.handle} player={p} you={i === 0 && you !== null} />)}</ul>}
      </section>
      <section className="lg:hidden">
        <div className="mb-2 px-1">{head}</div>
        {seats.length === 0 ? empty : <ul className="rail flex gap-2 pb-1">{seats.map((p, i) => <Capsule key={p.handle} player={p} you={i === 0 && you !== null} compact />)}</ul>}
      </section>
    </>
  )
}
