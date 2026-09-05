import { AppLink } from '../../app/AppLink'
import { DESTINATIONS } from '../../app/nav'
import { Icon } from '../ui/Icon'
import { cx } from '../../lib/cx'

/* The desktop destinations, sitting in the header row.
 *
 * The active item is marked three ways — a filled surface, a gold bar
 * under it, and aria-current — because tone alone is not enough to say
 * where you are. */

export function NavRail({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {DESTINATIONS.map((d) => {
          const active = d.href === '/' ? pathname === '/' : pathname.startsWith(d.href)
          return (
            <li key={d.href}>
              <AppLink
                to={d.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative flex min-h-[44px] items-center gap-2 rounded-key px-3.5 text-sm font-bold transition-colors',
                  active
                    ? 'bg-panel-2 text-ink'
                    : 'text-ink-2 hover:bg-panel hover:text-ink',
                )}
              >
                <Icon name={d.icon} size={18} />
                {d.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-chip bg-gold"
                  />
                )}
              </AppLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
