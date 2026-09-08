import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { cx } from '../../lib/cx'

/* A bounded surface with an optional header row, terminal style. */

export function Panel({ title, icon, count, action, children, className, bodyClassName }: {
  title?: ReactNode; icon?: Parameters<typeof Icon>[0]['name']; count?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string
}) {
  return (
    <section className={cx('card relative overflow-hidden', className)}>
      {(title || action) && (
        <header className="flex min-h-[40px] items-center justify-between gap-3 border-b border-line px-4">
          <div className="flex items-center gap-2">
            {icon && <Icon name={icon} size={13} className="text-ink-3" />}
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
