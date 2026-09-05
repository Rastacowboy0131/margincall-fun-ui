import { cx } from '../../lib/cx'

/* A player, drawn as the chip they are sitting behind.
 *
 * The tint arrives from the data as a raw hex and is used directly. It
 * is never derived from the handle: a previous build hashed the name to
 * pick a colour, a signed bit-shift produced a negative index, and half
 * the table rendered with no fill at all — invisible in the source,
 * obvious in a screenshot. The colour is data. */

export function Avatar({
  handle,
  tint,
  size = 30,
  ring,
  className,
}: {
  handle: string
  tint: string
  size?: number
  /** A status ring drawn around the chip — 'up', 'down', or none. */
  ring?: 'up' | 'down' | 'gold'
  className?: string
}) {
  const ringColor =
    ring === 'up'
      ? 'var(--color-up)'
      : ring === 'down'
        ? 'var(--color-down)'
        : ring === 'gold'
          ? 'var(--color-gold)'
          : undefined

  return (
    <span
      aria-hidden="true"
      className={cx('grid shrink-0 place-items-center rounded-chip font-extrabold', className)}
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
      {handle.replace(/^0x/i, '').charAt(0).toUpperCase()}
    </span>
  )
}
