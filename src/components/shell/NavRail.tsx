import { useLayoutEffect, useRef, useState } from 'react'
import { AppLink } from '../../app/AppLink'
import { DESTINATIONS } from '../../app/nav'
import { cx } from '../../lib/cx'

/* The desktop destinations. A pill slides between them. */

export function NavRail({ pathname }: { pathname: string }) {
  const listRef = useRef<HTMLUListElement>(null)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)
  const activeHref = DESTINATIONS.find((d) => (d.href === '/' ? pathname === '/' : pathname.startsWith(d.href)))?.href ?? null

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const el = list.querySelector<HTMLElement>('[data-active="true"]')
      setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeHref])

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul ref={listRef} className="relative isolate flex items-center gap-0.5">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 -z-10 h-full rounded-pill border border-line-2 bg-surface transition-[transform,width,opacity] duration-300 ease-[var(--ease-out)]"
          style={{ opacity: pill ? 1 : 0, width: pill?.w ?? 0, transform: `translateX(${pill?.x ?? 0}px)` }}
        />
        {DESTINATIONS.map((d) => {
          const active = d.href === activeHref
          return (
            <li key={d.href}>
              <AppLink to={d.href} data-active={active} aria-current={active ? 'page' : undefined} className={cx('flex min-h-[36px] items-center rounded-pill px-3.5 text-[13px] font-medium transition-colors duration-200', active ? 'text-ink' : 'text-ink-3 hover:text-ink-2')}>
                {d.label}
              </AppLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
