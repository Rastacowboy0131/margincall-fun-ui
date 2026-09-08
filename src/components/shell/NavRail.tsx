import { useLayoutEffect, useRef, useState } from 'react'
import { AppLink } from '../../app/AppLink'
import { DESTINATIONS } from '../../app/nav'
import { Icon } from '../ui/Icon'
import { cx } from '../../lib/cx'

/* Six destinations with icons; a lime underline slides to the active one. */

export function NavRail({ pathname }: { pathname: string }) {
  const listRef = useRef<HTMLUListElement>(null)
  const [bar, setBar] = useState<{ x: number; w: number } | null>(null)
  const activeHref = DESTINATIONS.find((d) => (d.href === '/' ? pathname === '/' : pathname.startsWith(d.href)))?.href ?? null

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => { const el = list.querySelector<HTMLElement>('[data-active="true"]'); setBar(el ? { x: el.offsetLeft, w: el.offsetWidth } : null) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeHref])

  return (
    <nav aria-label="Primary" className="hidden h-14 lg:block">
      <ul ref={listRef} className="relative flex h-full items-center">
        {DESTINATIONS.map((d) => {
          const active = d.href === activeHref
          return (
            <li key={d.href} className="h-full">
              <AppLink to={d.href} data-active={active} aria-current={active ? 'page' : undefined}
                className={cx('flex h-full items-center gap-1.5 px-3 text-[13px] font-semibold transition-colors duration-200', active ? 'text-ink' : 'text-ink-3 hover:text-ink-2')}>
                <Icon name={d.icon} size={15} className={active ? 'text-lime' : undefined} />
                {d.label}
              </AppLink>
            </li>
          )
        })}
        <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-px origin-left bg-lime transition-[transform,opacity] duration-300 ease-[var(--ease-out)]"
          style={{ opacity: bar ? 1 : 0, transform: bar ? `translateX(${bar.x + 12}px) scaleX(${Math.max(0, bar.w - 24)})` : 'scaleX(0)' }} />
      </ul>
    </nav>
  )
}
