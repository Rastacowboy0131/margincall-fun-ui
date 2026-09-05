import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The wordmark.
 *
 * A chip with a single red down-candle stamped through it, then the
 * name in Bungee — a signage face, because this is a sign. CALL is
 * always gold: gold is the house's colour throughout the product, and
 * the margin call is the one thing the house is guaranteed to collect.
 *
 * It scales itself with a media query rather than taking a size prop.
 * The header used to render two copies with `hidden` / `sm:inline-flex`
 * on them, and both stayed visible: the component's own `inline-flex`
 * is emitted after `.hidden` in the generated stylesheet, so the class
 * passed in from outside lost on stylesheet order and the accessible
 * name came out as "MARGIN CALLMARGIN CALL". One element, no override.
 * ------------------------------------------------------------------ */

export function Wordmark({
  name = 'responsive',
  className,
}: {
  /** 'responsive' drops the name below sm, where the header has three
   *  things fighting for 360px. 'always' is for the footer, which has
   *  all the room in the world and exists to say who this is. */
  name?: 'responsive' | 'always'
  className?: string
}) {
  return (
    <span className={cx('inline-flex items-center gap-2 sm:gap-2.5', className)}>
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="size-[26px] shrink-0 sm:size-8"
      >
        <circle cx="20" cy="20" r="19" fill="var(--color-gold)" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect
            key={deg}
            x="17.5"
            y="0"
            width="5"
            height="6"
            rx="1"
            fill="var(--color-void)"
            transform={`rotate(${deg} 20 20)`}
          />
        ))}
        <circle cx="20" cy="20" r="13.5" fill="var(--color-void)" />
        <rect x="19" y="9" width="2" height="22" rx="1" fill="var(--color-down)" />
        <rect x="15.5" y="14" width="9" height="12" rx="1.5" fill="var(--color-down)" />
      </svg>
      {/* Below sm the mark carries the brand on its own. Three things
       * compete for the header at 360px — identity, PAPER|LIVE and the
       * balance — and of those the name is the one the page title, the
       * tab bar and the chip itself already cover.
       *
       * `hidden sm:inline` is safe here only because this span sets no
       * other display utility: an unprefixed display class of its own
       * would beat `hidden` on stylesheet order and it would never
       * hide. Do not add one. */}
      <span
        className={cx(
          'font-sign text-sm leading-none tracking-tight sm:text-lg',
          name === 'responsive' && 'hidden sm:inline',
        )}
      >
        <span className="text-ink">MARGIN</span>
        <span className="text-gold"> CALL</span>
      </span>
    </span>
  )
}
