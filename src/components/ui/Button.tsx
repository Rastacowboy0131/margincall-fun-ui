import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'

/* One button. `go` is the cockpit's green, `abort` its red; `ghost` a
 * bordered panel; `quiet` text only. Press is scale(0.96) via .press. */

type Variant = 'go' | 'abort' | 'ghost' | 'quiet'
type Size = 'xl' | 'md' | 'sm'

const VARIANT: Record<Variant, string> = {
  go: 'key key-go',
  abort: 'key key-abort',
  ghost: 'border border-line-2 bg-surface text-ink',
  quiet: 'text-ink-2 hover:text-ink',
}
const DISABLED = 'key'
const SIZE: Record<Size, string> = {
  xl: 'min-h-[60px] px-6 text-2xl rounded-[16px] display font-bold tracking-wide',
  md: 'min-h-[42px] px-4 text-sm rounded-ctl font-bold',
  sm: 'min-h-[34px] px-3 text-xs rounded-ctl font-bold',
}

export function buttonClasses(variant: Variant = 'ghost', size: Size = 'md'): string {
  return `${variant === 'go' || variant === 'abort' ? '' : 'press'} inline-flex select-none items-center justify-center gap-2 text-center ${VARIANT[variant]} ${SIZE[size]}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  children: ReactNode
}

export function Button({ variant = 'ghost', size = 'md', full = false, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx('inline-flex select-none items-center justify-center gap-2 text-center', (disabled || variant === 'go' || variant === 'abort') ? '' : 'press', disabled ? DISABLED : VARIANT[variant], SIZE[size], full && 'w-full', className)}
      {...rest}
    >
      {children}
    </button>
  )
}
