import { useEffect, useRef } from 'react'

/* ------------------------------------------------------------------ *
 * One overlay behaviour, shared by every sheet and dialog in the
 * product, so they all get the implementation that was actually tested
 * rather than four near-misses.
 *
 * It does the five things an overlay has to do and that are invisible
 * in a screenshot:
 *   1. moves focus into the panel when it opens
 *   2. traps Tab and Shift+Tab inside it
 *   3. closes on Escape
 *   4. returns focus to whatever opened it
 *   5. locks background scroll AND restores the scroll position
 *
 * (5) uses the position:fixed technique rather than overflow:hidden,
 * because on iOS Safari overflow:hidden on body does not stop the page
 * behind a sheet from scrolling, and the user loses their place.
 * ------------------------------------------------------------------ */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function useOverlay(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return

    openerRef.current = document.activeElement
    const panel = panelRef.current

    // Move focus in. The panel itself carries tabIndex={-1} so there is
    // always something to land on, even in an empty state.
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel) return

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const head = items[0]
      const tail = items[items.length - 1]
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault()
        tail.focus()
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault()
        head.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    // Scroll lock.
    const y = window.scrollY
    const body = document.body
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }
    body.style.position = 'fixed'
    body.style.top = `-${y}px`
    body.style.width = '100%'

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.width = prev.width
      window.scrollTo(0, y)
      const opener = openerRef.current
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [open, onClose])

  return panelRef
}
