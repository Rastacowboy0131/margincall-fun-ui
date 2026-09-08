import { useState } from 'react'
import { cx } from '../../lib/cx'

/* A crew member. Round, ringed by status. Tint is data. */

export function Avatar({ handle, tint, size = 28, ring, pfp, className }: {
  handle: string
  tint: string
  size?: number
  ring?: 'up' | 'down' | 'gold'
  pfp?: string
  className?: string
}) {
  const [broken, setBroken] = useState(false)
  const rc = ring === 'up' ? 'var(--color-up)' : ring === 'down' ? 'var(--color-down)' : ring === 'gold' ? 'var(--color-gold)' : 'var(--color-line-2)'
  const showImg = Boolean(pfp) && !broken
  return (
    <span
      aria-hidden="true"
      className={cx('display grid shrink-0 place-items-center overflow-hidden rounded-pill font-extrabold text-white', className)}
      style={{ width: size, height: size, background: tint, fontSize: Math.round(size * 0.38), boxShadow: `0 0 0 2px ${rc}` }}
    >
      {showImg ? <img src={pfp} alt="" onError={() => setBroken(true)} className="h-full w-full object-cover" draggable={false} /> : handle.replace(/^0x/i, '').charAt(0).toUpperCase()}
    </span>
  )
}
