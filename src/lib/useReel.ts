import { useEffect, useState } from 'react'
import { REEL, REEL_START, type ReelFrame } from '../data/reel'

/* ------------------------------------------------------------------ *
 * Walks the fixed frame list in data/reel.ts and loops.
 *
 *   DELETE THIS AT INTEGRATION along with reel.ts and sample.ts.
 *
 * It exists so the table is alive enough to judge. It is an index and a
 * timeout. Under prefers-reduced-motion it does not advance at all —
 * the settled frame is the whole presentation, which is the correct
 * substitution for continuous motion rather than a slower version of it.
 * ------------------------------------------------------------------ */

export function useReel(): ReelFrame {
  const [i, setI] = useState(REEL_START)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (still.matches) return

    const id = window.setTimeout(() => {
      setI((n) => (n + 1) % REEL.length)
    }, REEL[i].holdMs)
    return () => window.clearTimeout(id)
  }, [i])

  return REEL[i]
}
