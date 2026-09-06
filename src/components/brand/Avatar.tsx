import { useState } from 'react'
import { cx } from '../../lib/cx'

/* A player, drawn as the chip they are sitting behind.
 *
 * The tint arrives from the data as a raw hex and is used directly. It
 * is never derived from the handle: a previous build hashed the name to
 * pick a colour, a signed bit-shift produced a negative index, and half
 * the table rendered with no fill at all — invisible in the source,
 * obvious in a screenshot. The colour is data.
 *
 * The local player may carry a pfp (a small data URL from the profile
 * editor). When present it fills the chip in place of the letter; the
 * ring and the moulded shadow language stay identical, so a customised
 * seat still reads as a chip at the table. A broken image falls back to
 * the letter rather than leaving a broken-image glyph in the feed. */

export function Avatar({
  handle,
  tint,
  size = 30,
  ring,
  pfp,
  className,
}: {
  handle: string
  tint: string
  size?: number
  /** A status ring drawn around the chip — 'up', 'down', or none. */
  ring?: 'up' | 'down' | 'gold'
  /** Image fill for the chip. Only the local player ever has one. */
  pfp?: string
  className?: string
}) {
  const [broken, setBroken] = useState(false)
  const ringColor =
    ring === 'up'
      ? 'var(--color-up)'
      : ring === 'down'
        ? 'var(--color-down)'
        : ring === 'gold'
          ? 'var(--color-gold)'
          : undefined

  const showImg = Boolean(pfp) && !broken

  return (
    <span
      aria-hidden="true"
      className={cx(
        'grid shrink-0 place-items-center overflow-hidden rounded-chip font-extrabold',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: tint,
        color: '#ffffff',
        fontSize: size * 0.42,
        textShadow: '0 1px 1px rgb(0 0 0 / 0.5)',
        boxShadow: ringColor
          ? `0 0 0 2px var(--color-void), 0 0 0 4px ${ringColor}`
          : 'inset 0 -2px 0 rgb(0 0 0 / 0.25)',
      }}
    >
      {showImg ? (
        <img
          src={pfp}
          alt=""
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        handle.replace(/^0x/i, '').charAt(0).toUpperCase()
      )}
    </span>
  )
}
