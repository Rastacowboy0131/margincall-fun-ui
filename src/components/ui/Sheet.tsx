import type { ReactNode } from 'react'
import { useOverlay } from '../../lib/useOverlay'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * One overlay, two shapes.
 *
 * Below md it rises from the bottom edge with a grab handle, so its
 * actions land under the thumb and it can be dismissed without aiming.
 * From md up it is a centred dialog. Building it once is what stops the
 * two drifting apart, and it means both get the focus trap, the scroll
 * lock and the Escape handling that useOverlay was tested with.
 * ------------------------------------------------------------------ */

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  labelId,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  /** Unique per instance — the caller owns it, because this component
   *  can render twice on one page and duplicate ids break <label for>. */
  labelId: string
  children: ReactNode
}) {
  const panelRef = useOverlay(open, onClose)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-void/80 backdrop-blur-[3px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className={cx(
          'anim-rise relative w-full max-w-[440px] border border-rim bg-panel shadow-lift',
          'max-h-[86dvh] overflow-y-auto overscroll-contain',
          'rounded-t-panel md:rounded-panel',
          'pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0',
        )}
      >
        {/* Grab handle. Without it, drag-to-dismiss is undiscoverable —
         * and it is the fastest way to signal "this is a sheet". */}
        <div aria-hidden="true" className="flex justify-center pt-3 md:hidden">
          <span className="h-1.5 w-11 rounded-chip bg-rim-hi" />
        </div>

        <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <h2 id={labelId} className="text-xl font-extrabold tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-ink-2">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="key-3d -mr-1 grid size-11 shrink-0 place-items-center rounded-key border border-rim text-ink-2"
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </header>

        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}
