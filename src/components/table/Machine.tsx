import type { ReactNode } from 'react'
import type { RoundPhase } from '../../data/types'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The rim.
 *
 * The felt and the console are one object, not two panels stacked, so
 * the brushed-metal edge and the shadow live out here and wrap both.
 * The shake is keyed on the phase, which means it fires once when the
 * house takes the round rather than replaying on every value tick.
 * ------------------------------------------------------------------ */

export function Machine({ phase, children }: { phase: RoundPhase; children: ReactNode }) {
  return (
    <div
      key={phase}
      className={cx('rounded-table p-[5px]', phase === 'called' && 'anim-shake')}
      style={{
        background:
          'linear-gradient(180deg, var(--color-gold-deep) 0%, var(--color-gold-dark) 34%, #3a2a12 100%)',
        boxShadow: 'var(--shadow-table)',
      }}
    >
      <div className="overflow-hidden rounded-[26px]">{children}</div>
    </div>
  )
}
