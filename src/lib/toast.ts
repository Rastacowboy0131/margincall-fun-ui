import { useSyncExternalStore } from 'react'

/* ------------------------------------------------------------------ *
 * Toasts. A tiny store: push a notice, it shows top-right for a few
 * seconds and leaves. Used for the things that happen to your money
 * while you are looking elsewhere: a fill, a cash-out, a liquidation.
 * ------------------------------------------------------------------ */

export interface Toast {
  id: number
  tone: 'lime' | 'down' | 'amber' | 'ink'
  title: string
  body?: string
}

let items: Toast[] = []
let seq = 0
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

export function toast(t: Omit<Toast, 'id'>): void {
  const id = ++seq
  items = [{ ...t, id }, ...items].slice(0, 3)
  emit()
  window.setTimeout(() => {
    items = items.filter((i) => i.id !== id)
    emit()
  }, 4600)
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    () => items,
    () => items,
  )
}
