import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * One figure.
 *
 * Deliberately NOT a bordered card: a row of identical outlined boxes
 * tells the eye that every figure matters the same amount, which is
 * almost never true. These sit directly on the surface with a hairline
 * between them, and the one that matters is given `hero` so it is
 * actually bigger rather than merely differently coloured.
 * ------------------------------------------------------------------ */

export function Stat({
  label,
  value,
  note,
  tone = 'ink',
  hero = false,
}: {
  label: string
  value: ReactNode
  note?: ReactNode
  tone?: 'ink' | 'up' | 'down' | 'gold'
  hero?: boolean
}) {
  const toneClass =
    tone === 'up'
      ? 'text-up'
      : tone === 'down'
        ? 'text-down'
        : tone === 'gold'
          ? 'text-gold'
          : 'text-ink'

  return (
    <div className={cx('flex flex-col justify-between p-4', hero && 'bg-void')}>
      <span className="eyebrow text-ink-3">{label}</span>
      <span
        className={cx(
          'nums mt-2 font-extrabold leading-none tracking-tight',
          hero ? 'text-4xl' : 'text-2xl',
          toneClass,
        )}
      >
        {value}
      </span>
      {note && <span className="mt-1.5 text-xs text-ink-3">{note}</span>}
    </div>
  )
}
