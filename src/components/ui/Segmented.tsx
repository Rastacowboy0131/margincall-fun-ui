import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * A gauge: equal segments with a lit one that slides. The indicator
 * only ever moves with translateX, so it stays smooth at 50ms ticks.
 * Used for PAPER|LIVE, the stake, the auto-eject target and the board.
 * ------------------------------------------------------------------ */

export interface Segment<T extends string | number> {
  value: T
  label: ReactNode
  name?: string
}

const TONE = {
  gold: 'bg-gold shadow-[0_0_20px_rgb(255_207_90/0.5)]',
  cyan: 'bg-cyan shadow-[0_0_20px_rgb(79_240_255/0.5)]',
  ink: 'bg-ink',
}

export function Segmented<T extends string | number>({
  items, value, onChange, tone = 'gold', size = 'md', ariaLabel, className,
}: {
  items: Segment<T>[]
  value: T | null
  onChange: (v: T) => void
  tone?: keyof typeof TONE
  size?: 'md' | 'sm'
  ariaLabel: string
  className?: string
}) {
  const idx = value === null ? -1 : items.findIndex((i) => i.value === value)
  const n = items.length
  const gap = size === 'md' ? 6 : 4
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cx('relative isolate grid', className)}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap }}
    >
      <span
        aria-hidden="true"
        className={cx('pointer-events-none absolute inset-y-0 left-0 -z-10 rounded-ctl transition-[transform,opacity] duration-200 ease-[var(--ease-out)]', TONE[tone])}
        style={{
          width: `calc((100% - ${(n - 1) * gap}px) / ${n})`,
          transform: `translateX(calc(${Math.max(0, idx)} * (100% + ${gap}px)))`,
          opacity: idx < 0 ? 0 : 1,
        }}
      />
      {items.map((it, i) => {
        const on = i === idx
        return (
          <button
            key={String(it.value)}
            type="button"
            aria-pressed={on}
            aria-label={it.name}
            onClick={() => onChange(it.value)}
            className={cx(
              'num press relative z-0 flex items-center justify-center rounded-ctl border transition-colors duration-200',
              size === 'md' ? 'min-h-[44px] px-2 text-[13px]' : 'min-h-[32px] px-1.5 text-xs',
              on ? 'border-transparent font-medium text-bg' : 'border-line-2 bg-[#0a0e22] text-ink-3 hover:text-ink',
            )}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
