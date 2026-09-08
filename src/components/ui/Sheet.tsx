import type { ReactNode } from 'react'
import { useOverlay } from '../../lib/useOverlay'
import { cx } from '../../lib/cx'

/* One overlay, two shapes: a bottom sheet below md, a centred dialog
 * from md. Focus trap, scroll lock and Escape come from useOverlay. */

export function Sheet({ open, onClose, title, subtitle, labelId, children }: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  labelId: string
  children: ReactNode
}) {
  const panelRef = useOverlay(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="anim-fade absolute inset-0 bg-bg/75 backdrop-blur-[3px]" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className={cx(
          'relative w-full max-w-[440px] border border-line-2 bg-gradient-to-b from-surface-2 to-surface',
          'max-h-[86dvh] overflow-y-auto overscroll-contain rounded-t-sky md:rounded-sky',
          'anim-sheet md:anim-pop pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0',
        )}
      >
        <div aria-hidden="true" className="flex justify-center pt-2.5 md:hidden"><span className="h-1 w-9 rounded-pill bg-line-2" /></div>
        <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <h2 id={labelId} className="display text-2xl font-bold">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-ink-2">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="press -mr-1 grid size-9 shrink-0 place-items-center rounded-pill border border-line-2 text-ink-2">
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
          </button>
        </header>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}
