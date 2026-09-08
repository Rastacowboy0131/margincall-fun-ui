import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

type Tone = 'gold' | 'cyan' | 'up' | 'down' | 'quiet'
const TONE: Record<Tone, string> = {
  gold: 'bg-gold text-bg',
  cyan: 'border border-cyan text-cyan',
  up: 'bg-up-wash text-up border border-up/40',
  down: 'bg-down-wash text-down border border-down/40',
  quiet: 'bg-surface-3 text-ink-2',
}

export function Tag({ tone = 'quiet', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cx('num inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase', TONE[tone], className)}>
      {children}
    </span>
  )
}
