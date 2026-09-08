import { AppLink } from '../../app/AppLink'
import { DESTINATIONS } from '../../app/nav'
import { Icon } from '../ui/Icon'
import { cx } from '../../lib/cx'

export function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-md lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto flex max-w-[560px]">
        {DESTINATIONS.filter((d) => d.mobile).map((d) => {
          const active = d.href === '/' ? pathname === '/' : pathname.startsWith(d.href)
          return (
            <li key={d.href} className="flex-1">
              <AppLink to={d.href} aria-current={active ? 'page' : undefined} className={cx('relative flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors duration-200', active ? 'text-lime' : 'text-ink-3')}>
                <span aria-hidden="true" className={cx('absolute top-0 h-0.5 w-8 rounded-pill bg-lime transition-opacity', active ? 'opacity-100' : 'opacity-0')} />
                <Icon name={d.icon} size={19} strokeWidth={active ? 2.2 : 1.8} />
                {d.label}
              </AppLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
