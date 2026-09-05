import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* A small uppercase label: LIVE, DEMO, GOAT, SOON, LIQUIDATED.
 * Colour is never the only carrier here — the word inside always says
 * what the state is, which is the point of the component. */

type Tone = 'gold' | 'up' | 'down' | 'live' | 'quiet' | 'paper'

const TONE: Record<Tone, string> = {
  gold: 'bg-gold-wash text-gold border-gold-deep/45',
  up: 'bg-up-wash text-up border-up-deep/45',
  down: 'bg-down-wash text-down border-down-deep/50',
  live: 'bg-live-wash text-live border-live-deep/50',
  quiet: 'bg-panel text-ink-2 border-rim',
  paper: 'bg-paper-2 text-paper-ink border-paper-rule',
}

export function Tag({
  tone = 'quiet',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'eyebrow inline-flex items-center gap-1 rounded-tag border px-1.5 py-0.5',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
