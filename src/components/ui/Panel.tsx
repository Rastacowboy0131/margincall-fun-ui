import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * A moulded surface.
 *
 * There is exactly one container shape in this product and this is it:
 * a chunky panel with a lit top edge and a hard shadow under it, the
 * way a piece of moulded plastic sits on a table. Four separate panels
 * in a row is almost always the wrong answer — one panel with internal
 * dividers reads as more designed and asserts the right hierarchy. The
 * `divide` variant exists to make that the easy choice.
 * ------------------------------------------------------------------ */

type Tone = 'panel' | 'sunken' | 'gold' | 'down'

const TONE: Record<Tone, string> = {
  panel: 'bg-panel border-rim',
  // Sunken reads as a recess cut into the panel above it — used for
  // trays that hold something (the chip tray, a readout window).
  sunken: 'bg-void border-rim',
  gold: 'bg-gold-wash border-gold-deep/40',
  down: 'bg-down-wash border-down-deep/45',
}

export function Panel({
  tone = 'panel',
  title,
  count,
  action,
  children,
  className,
  bodyClassName,
}: {
  tone?: Tone
  /** Section heading. Rendered as an eyebrow, not an <h*>, so pages stay
   *  in charge of their own heading order. */
  title?: string
  /** A figure printed opposite the title — a live count, a total. */
  count?: ReactNode
  /** A control in the panel's header row. */
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={cx(
        'relative overflow-hidden rounded-panel border shadow-lift',
        TONE[tone],
        className,
      )}
    >
      {/* The lit top edge. Decorative, so it is allowed to sit below 3:1. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-rim-hi/60"
      />
      {(title || action) && (
        <header className="flex min-h-[44px] items-center justify-between gap-3 border-b border-rim px-4">
          <div className="flex items-center gap-2">
            {title && <span className="eyebrow text-ink-3">{title}</span>}
            {count}
          </div>
          {action}
        </header>
      )}
      <div className={cx('relative', bodyClassName ?? 'p-4')}>{children}</div>
    </section>
  )
}
