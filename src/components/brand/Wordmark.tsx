import { cx } from '../../lib/cx'

/* The wordmark: a line chart that ends in a fall, then MARGIN CALL in
 * the display face with CALL in lime. */

export function Wordmark({ name = 'responsive', size = 'md', className }: { name?: 'responsive' | 'always'; size?: 'md' | 'sm'; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 28 24" aria-hidden="true" className={size === 'sm' ? 'h-4 w-5' : 'h-5 w-6'}>
        <path d="M2 18l7-9 5 6 4-5 8 9" fill="none" stroke="var(--color-lime)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M2 22h24" stroke="var(--color-down)" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className={cx('display leading-none tracking-wide', size === 'sm' ? 'text-sm' : 'text-lg', name === 'responsive' && 'hidden sm:inline')}>
        <span className="text-ink">Margin </span><span className="text-lime">Call</span>
      </span>
    </span>
  )
}
