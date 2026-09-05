import { AppLink } from '../../app/AppLink'
import { DESTINATIONS } from '../../app/nav'
import { Icon } from '../ui/Icon'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The phone's navigation: four labelled destinations, one thumb-tap
 * each, always where the thumb already is.
 *
 * The page reserves this bar's height at its bottom (see AppShell), so
 * nothing ends up underneath it — the single most common bug in
 * bottom-navigation layouts and the reason to scroll to the very bottom
 * of every route before calling it done.
 *
 * The console on the Play route sits in normal flow directly under the
 * table rather than being fixed as well, so these two never fight over
 * the bottom of the screen.
 * ------------------------------------------------------------------ */

export function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rim bg-panel/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-[560px]">
        {DESTINATIONS.map((d) => {
          const active = d.href === '/' ? pathname === '/' : pathname.startsWith(d.href)
          return (
            <li key={d.href} className="flex-1">
              <AppLink
                to={d.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 text-micro font-bold',
                  active ? 'text-gold' : 'text-ink-3',
                )}
              >
                {/* The active marker is a bar, not just a tint. */}
                <span
                  aria-hidden="true"
                  className={cx(
                    'absolute top-0 h-0.5 w-9 rounded-chip transition-opacity',
                    active ? 'bg-gold opacity-100' : 'opacity-0',
                  )}
                />
                <Icon name={d.icon} size={20} strokeWidth={active ? 2.4 : 2} />
                {d.label}
              </AppLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
