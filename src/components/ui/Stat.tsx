import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export function Stat({ label, value, note, tone = 'ink', hero = false }: {
  label: string
  value: ReactNode
  note?: ReactNode
  tone?: 'ink' | 'up' | 'down' | 'gold'
  hero?: boolean
}) {
  const t = tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : tone === 'gold' ? 'text-gold' : 'text-ink'
  return (
    <div className="flex flex-col justify-between p-4">
      <span className="label">{label}</span>
      <span className={cx('display mt-3 leading-none tracking-tight', hero ? 'text-5xl font-extrabold' : 'text-3xl font-bold', t)}>{value}</span>
      {note && <span className="mt-2 text-xs text-ink-3">{note}</span>}
    </div>
  )
}
