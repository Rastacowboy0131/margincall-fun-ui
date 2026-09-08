import { cx } from '../../lib/cx'

/* The wordmark: a burning ring, then the name in the display face. */

export function Wordmark({ name = 'responsive', className }: { name?: 'responsive' | 'always'; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="grid size-[30px] shrink-0 place-items-center rounded-pill shadow-[0_0_20px_rgb(255_122_26/0.5)]"
        style={{ background: 'conic-gradient(from 200deg, var(--color-flame), var(--color-gold), var(--color-cyan), var(--color-flame))' }}
      >
        <span className="size-3 rounded-pill bg-bg" />
      </span>
      <span className={cx('display text-xl font-extrabold tracking-wide text-ink', name === 'responsive' && 'hidden sm:inline')}>Margin Call</span>
    </span>
  )
}
