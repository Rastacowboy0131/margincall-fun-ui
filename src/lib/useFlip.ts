import { useLayoutEffect, useRef } from 'react'

/* ------------------------------------------------------------------ *
 * FLIP for a horizontal list whose items get inserted at the front.
 *
 * Before each commit the previous x of every keyed child is remembered;
 * after it, anything that moved plays a transform from its old spot to
 * its new one via WAAPI, and anything new fades in. Transform only, off
 * the React render path, interruptible.
 * ------------------------------------------------------------------ */

export function useFlip<T extends HTMLElement>(deps: unknown) {
  const ref = useRef<T>(null)
  const last = useRef<Map<string, number>>(new Map())
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const prev = last.current
    const next = new Map<string, number>()
    const children = Array.from(root.querySelectorAll<HTMLElement>('[data-flip]'))
    for (const el of children) {
      const key = el.dataset.flip as string
      const x = el.getBoundingClientRect().left
      next.set(key, x)
      if (reduce) continue
      const was = prev.get(key)
      if (was === undefined) {
        if (prev.size > 0) {
          el.animate(
            [{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }],
            { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
          )
        }
      } else if (Math.abs(was - x) > 0.5) {
        el.animate(
          [{ transform: `translateX(${was - x}px)` }, { transform: 'none' }],
          { duration: 280, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
        )
      }
    }
    last.current = next
  }, [deps, reduce])

  return ref
}
