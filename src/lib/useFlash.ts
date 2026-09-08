import { useEffect, useRef, useState } from 'react'

/* Returns 'flash-up' / 'flash-down' for ~900ms after a number changes,
 * so a figure can announce its own movement with colour and settle
 * back. The class is keyed so consecutive changes restart it. */

export function useFlash(value: number): { cls: string; key: number } {
  const prev = useRef(value)
  const [state, setState] = useState<{ cls: string; key: number }>({ cls: '', key: 0 })

  useEffect(() => {
    if (value === prev.current) return
    const dir = value > prev.current ? 'flash-up' : 'flash-down'
    prev.current = value
    setState((s) => ({ cls: dir, key: s.key + 1 }))
    const t = window.setTimeout(() => setState((s) => ({ ...s, cls: '' })), 950)
    return () => window.clearTimeout(t)
  }, [value])

  return state
}
