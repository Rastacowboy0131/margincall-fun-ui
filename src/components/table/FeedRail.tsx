import type { Activity } from '../../data/types'
import { signedEth, x } from '../../lib/format'
import { displayName, useProfile } from '../../lib/profile'
import { cx } from '../../lib/cx'

/* Radio chatter: who boarded, who ejected, who was lost, as a row of
 * chips under the cockpit. Newest first, sliding in from the left. */

const VERB: Record<Activity['action'], { word: string; tone: string }> = {
  bought: { word: 'boarded', tone: 'text-cyan' },
  sold: { word: 'ejected', tone: 'text-up' },
  called: { word: 'lost', tone: 'text-down' },
}

export function FeedRail({ items }: { items: Activity[] }) {
  const profile = useProfile()
  return (
    <section>
      <h2 className="label mb-2 px-1">Radio</h2>
      {items.length === 0 ? (
        <p className="num text-xs text-ink-3">Quiet. Nobody has moved since lift-off.</p>
      ) : (
        <ul className="rail flex gap-2 pb-1">
          {items.slice(0, 10).map((f) => {
            const you = f.handle === 'you'
            const v = VERB[f.action]
            return (
              <li key={f.id} className={cx('row-in num flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 text-2xs whitespace-nowrap', you ? 'border-gold/60 text-ink' : 'border-line text-ink-2')}>
                <span aria-hidden="true" className="size-1.5 rounded-pill" style={{ background: f.tint }} />
                {you ? displayName(profile) : f.handle} <b className={cx('font-medium', v.tone)}>{v.word}</b> {x(f.atX)}
                {f.pnlEth !== null && <span className={f.pnlEth < 0 ? 'text-down' : 'text-up'}> · {signedEth(f.pnlEth)}</span>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
