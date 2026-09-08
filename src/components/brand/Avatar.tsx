import { useState } from 'react'
import { cx } from '../../lib/cx'

export function Avatar({ handle, tint, size = 24, ring, pfp, className }: { handle: string; tint: string; size?: number; ring?: 'lime' | 'down' | 'amber'; pfp?: string; className?: string }) {
  const [broken, setBroken] = useState(false)
  const rc = ring === 'lime' ? 'var(--color-lime)' : ring === 'down' ? 'var(--color-down)' : ring === 'amber' ? 'var(--color-amber)' : undefined
  const showImg = Boolean(pfp) && !broken
  return (
    <span aria-hidden="true" className={cx('grid shrink-0 place-items-center overflow-hidden rounded-pill font-bold text-white', className)}
      style={{ width: size, height: size, background: tint, fontSize: Math.round(size * 0.42), boxShadow: rc ? `0 0 0 1.5px var(--color-bg), 0 0 0 3px ${rc}` : undefined }}>
      {showImg ? <img src={pfp} alt="" onError={() => setBroken(true)} className="h-full w-full object-cover" draggable={false} /> : handle.replace(/^0x/i, '').charAt(0).toUpperCase()}
    </span>
  )
}
