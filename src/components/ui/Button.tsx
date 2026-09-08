import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* One button. `lime` is the primary, `down` the loss colour, `ghost`
 * a bordered panel, `quiet` text only. Press is scale(0.98). */

type Variant = 'lime' | 'down' | 'ghost' | 'quiet' | 'ink'
type Size = 'xl' | 'md' | 'sm'

const VARIANT: Record<Variant, string> = {
  lime: 'bg-lime text-bg glow-lime hover:bg-[#d3ff6b]',
  down: 'bg-down text-white hover:bg-[#ff5555]',
  ghost: 'border border-line-2 bg-surface-2 text-ink hover:border-ink-3',
  quiet: 'text-ink-2 hover:text-ink',
  ink: 'bg-ink text-bg',
}
const DISABLED = 'bg-surface-3 text-ink-3 border border-transparent'
const SIZE: Record<Size, string> = {
  xl: 'min-h-[54px] px-6 text-base rounded-ctl font-bold',
  md: 'min-h-[40px] px-4 text-sm rounded-ctl font-semibold',
  sm: 'min-h-[32px] px-3 text-xs rounded-ctl font-semibold',
}

export function buttonClasses(variant: Variant = 'ghost', size: Size = 'md'): string {
  return `press inline-flex select-none items-center justify-center gap-2 text-center ${VARIANT[variant]} ${SIZE[size]}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; full?: boolean; children: ReactNode }

export function Button({ variant = 'ghost', size = 'md', full = false, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button type="button" disabled={disabled} className={cx('press inline-flex select-none items-center justify-center gap-2 text-center', disabled ? DISABLED : VARIANT[variant], SIZE[size], full && 'w-full', className)} {...rest}>
      {children}
    </button>
  )
}
