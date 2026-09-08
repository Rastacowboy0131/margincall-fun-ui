import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

type Tone = 'lime' | 'down' | 'amber' | 'quiet' | 'outline'
const TONE: Record<Tone, string> = {
  lime: 'bg-lime-wash text-lime border border-lime/40',
  down: 'bg-down-wash text-down border border-down/40',
  amber: 'bg-amber-wash text-amber border border-amber/40',
  quiet: 'bg-surface-3 text-ink-2 border border-line-2',
  outline: 'border border-line-2 text-ink-2',
}
export function Tag({ tone = 'quiet', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase', TONE[tone], className)}>{children}</span>
}
