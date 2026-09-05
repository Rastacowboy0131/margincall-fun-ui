import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * A moulded console key.
 *
 * Every key in the product sits proud of its own darker underside and
 * bottoms out when pressed — the press translates down by exactly the
 * shadow offset, so the key lands on the surface instead of sliding
 * across it (see .key-3d in base.css).
 *
 * Every solid variant carries the DARK ink, never white. That is not a
 * style choice: white on --color-down measures 2.9:1 and fails, while
 * the void ink on it is 6.0:1. Keeping all four solids dark-on-bright
 * also means the console reads as one set of mouldings.
 *
 * Two rules about styling this from outside, both learned the hard way:
 *
 *   - Add a VARIANT, never a className full of colour overrides. Two
 *     utilities on the same CSS property are resolved by their order in
 *     the generated stylesheet, not by which one was passed last, so an
 *     override loses silently and nothing errors.
 *   - `className` here is for LAYOUT only (flex-1, w-full, order-*).
 *
 * Disabled resets to a flat neutral surface for every variant rather
 * than fading the accent — a saturated mint at 40% opacity produces a
 * muddy olive that reads as a rendering fault.
 * ------------------------------------------------------------------ */

type Variant = 'long' | 'short' | 'cash' | 'house' | 'ghost' | 'quiet'
type Size = 'xl' | 'md' | 'sm'

const VARIANT: Record<Variant, string> = {
  long: 'bg-up text-void [--key-under:var(--color-up-dark)]',
  short: 'bg-down text-void [--key-under:var(--color-down-dark)]',
  cash: 'bg-gold text-void [--key-under:var(--color-gold-dark)]',
  house: 'bg-live text-void [--key-under:var(--color-live-deep)]',
  ghost: 'border border-edge bg-panel-2 text-ink [--key-under:var(--color-void)]',
  quiet: 'border border-rim bg-transparent text-ink-2 [--key-under:transparent]',
}

const DISABLED = 'border border-rim bg-panel text-ink-3 [--key-under:transparent]'

const SIZE: Record<Size, string> = {
  // Every size clears 44px of tappable height.
  xl: 'min-h-[64px] px-6 text-lg rounded-key [--key-depth:5px]',
  md: 'min-h-[46px] px-4 text-sm rounded-key [--key-depth:4px]',
  sm: 'min-h-[44px] px-3 text-xs rounded-tag [--key-depth:3px]',
}

/**
 * The same moulding, as a class string, for the handful of places that
 * need a LINK to look like a key. A link inside a button is invalid
 * HTML and breaks both keyboard and screen-reader navigation, so those
 * cases render an anchor with these classes rather than nesting.
 */
export function keyClasses(variant: Variant = 'ghost', size: Size = 'md'): string {
  return `key-3d inline-flex select-none items-center justify-center gap-2 text-center font-extrabold tracking-tight ${VARIANT[variant]} ${SIZE[size]}`
}

interface KeyProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  children: ReactNode
}

export function Key({
  variant = 'ghost',
  size = 'md',
  full = false,
  className,
  children,
  disabled,
  ...rest
}: KeyProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx(
        'key-3d inline-flex select-none items-center justify-center gap-2 text-center font-extrabold tracking-tight',
        disabled ? DISABLED : VARIANT[variant],
        SIZE[size],
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
