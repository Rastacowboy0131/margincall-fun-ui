import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export function Stat({ label, value, note, tone = 'ink', hero = false }: { label: string; value: ReactNode; note?: ReactNode; tone?: 'ink' | 'up' | 'down' | 'amber'; hero?: boolean }) {
  const t = tone === 'up' ? 'text-lime' : tone === 'down' ? 'text-down' : tone === 'amber' ? 'text-amber' : 'text-ink'
  return (
    <div className="flex flex-col justify-between p-4">
      <span className="label">{label}</span>
      <span className={cx('num mt-2.5 leading-none font-bold tracking-tight whitespace-nowrap', hero ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl', t)}>{value}</span>
      {note && <span className="mt-1.5 text-xs text-ink-3">{note}</span>}
    </div>
  )
}
