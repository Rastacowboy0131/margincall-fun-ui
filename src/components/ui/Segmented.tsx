import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* Equal segments, one lit, the highlight slides with translateX. */

export interface Segment<T extends string | number> { value: T; label: ReactNode; name?: string }

const TONE = { lime: 'bg-lime', ink: 'bg-ink', amber: 'bg-amber' }

export function Segmented<T extends string | number>({ items, value, onChange, tone = 'lime', size = 'md', ariaLabel, className }: {
  items: Segment<T>[]; value: T | null; onChange: (v: T) => void; tone?: keyof typeof TONE; size?: 'md' | 'sm'; ariaLabel: string; className?: string
}) {
  const idx = value === null ? -1 : items.findIndex((i) => i.value === value)
  const n = items.length
  const gap = 6
  return (
    <div role="group" aria-label={ariaLabel} className={cx('relative isolate grid', className)} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap }}>
      <span aria-hidden="true" className={cx('pointer-events-none absolute inset-y-0 left-0 -z-10 rounded-ctl transition-[transform,opacity] duration-200 ease-[var(--ease-out)]', TONE[tone])}
        style={{ width: `calc((100% - ${(n - 1) * gap}px) / ${n})`, transform: `translateX(calc(${Math.max(0, idx)} * (100% + ${gap}px)))`, opacity: idx < 0 ? 0 : 1 }} />
      {items.map((it, i) => {
        const on = i === idx
        return (
          <button key={String(it.value)} type="button" aria-pressed={on} aria-label={it.name} onClick={() => onChange(it.value)}
            className={cx('num press relative z-0 flex items-center justify-center rounded-ctl border transition-colors duration-200', size === 'md' ? 'min-h-[38px] px-2 text-[13px] font-semibold' : 'min-h-[30px] px-1.5 text-xs font-semibold', on ? 'border-transparent text-bg' : 'border-line-2 bg-surface-2 text-ink-2 hover:text-ink')}>
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
