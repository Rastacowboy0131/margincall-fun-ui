import { AppLink } from '../../app/AppLink'
import { DESTINATIONS } from '../../app/nav'
import { Icon } from '../ui/Icon'
import { cx } from '../../lib/cx'

export function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 backdrop-blur-md lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto flex max-w-[520px]">
        {DESTINATIONS.map((d) => {
          const active = d.href === '/' ? pathname === '/' : pathname.startsWith(d.href)
          return (
            <li key={d.href} className="flex-1">
              <AppLink to={d.href} aria-current={active ? 'page' : undefined} className={cx('flex min-h-[56px] flex-col items-center justify-center gap-1 text-2xs font-medium transition-colors duration-200', active ? 'text-cyan' : 'text-ink-3')}>
                <Icon name={d.icon} size={20} strokeWidth={active ? 2.2 : 1.8} />
                {d.label}
              </AppLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
