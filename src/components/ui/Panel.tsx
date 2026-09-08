import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* A bounded surface. One hairline, one radius, a faint gradient. */

export function Panel({ title, count, action, children, className, bodyClassName }: {
  title?: ReactNode
  count?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cx('relative overflow-hidden rounded-card border border-line bg-gradient-to-b from-surface-2 to-surface', className)}>
      {(title || action) && (
        <header className="flex min-h-[42px] items-center justify-between gap-3 border-b border-line px-4">
          <div className="flex items-center gap-2">
            {title && <span className="label">{title}</span>}
            {count}
          </div>
          {action}
        </header>
      )}
      <div className={cx('relative', bodyClassName ?? 'p-4')}>{children}</div>
    </section>
  )
}
