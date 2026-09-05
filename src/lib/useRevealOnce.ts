import { useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ *
 * Fires once when the element first enters the viewport, then
 * disconnects. The disconnect is the point: a band that re-deals itself
 * every time you scroll past is a toy, not a reveal.
 *
 * Returns true immediately when the user has asked for reduced motion,
 * so the settled state renders rather than nothing at all.
 * ------------------------------------------------------------------ */

export function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  // Initialised rather than set from an effect, so a reduced-motion
  // reader never gets a frame of invisible content before the effect
  // has had a chance to run.
  const [shown, setShown] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return { ref, shown }
}
