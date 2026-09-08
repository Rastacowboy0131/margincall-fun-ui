import { useToasts } from '../../lib/toast'
import { Wordmark } from '../brand/Wordmark'
import { cx } from '../../lib/cx'

/* The notification stack, top-right. Each card carries the wordmark,
 * a title and a line, like a phone notification. */

export function Toaster() {
  const items = useToasts()
  if (items.length === 0) return null
  return (
    <div className="pointer-events-none fixed top-[72px] right-3 z-[60] flex w-[min(360px,calc(100vw-24px))] flex-col gap-2 sm:right-5">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cx(
            'anim-toast card pointer-events-auto border-l-[3px] px-4 py-3 shadow-[0_20px_50px_-20px_#000]',
            t.tone === 'lime' ? 'border-l-lime' : t.tone === 'down' ? 'border-l-down' : t.tone === 'amber' ? 'border-l-amber' : 'border-l-ink-2',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <Wordmark name="always" size="sm" />
            <span className="text-2xs text-ink-3">now</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-ink">{t.title}</p>
          {t.body && <p className="num mt-0.5 text-xs text-ink-2">{t.body}</p>}
        </div>
      ))}
    </div>
  )
}
