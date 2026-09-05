import type { ReactNode } from 'react'
import type { RoundPhase } from '../../data/types'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The rim.
 *
 * The brushed-metal edge and the shadow live out here and wrap whatever
 * the table is made of at this width — on a phone that is the felt and
 * the console welded together, on desktop it is the felt alone, because
 * the console moves to the right rail beside the chart.
 *
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
