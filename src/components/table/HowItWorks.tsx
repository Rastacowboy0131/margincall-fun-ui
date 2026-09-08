import { CHAIN } from '../../data/sample'
import { useRevealOnce } from '../../lib/useRevealOnce'
import { cx } from '../../lib/cx'

/* The flight briefing. Five steps, each docking in on its own delay
 * the first time it scrolls into view. */

const STEPS = [
  { title: 'A flight opens', body: 'Every few seconds the house opens a leveraged position on a tokenised stock. 20x long NVDAx, 25x long TSLAx, the ticker rotates. It lifts off at 1.00x.' },
  { title: 'The path moves like a chart', body: 'Dips, pumps, stalls. Not an escalator. The whole flight path comes from one seed committed before launch.' },
  { title: 'Board whenever you like', body: 'On the pad or halfway up. Wherever you board becomes your 1.00x, so boarding a dip and ejecting on the rip is a real strategy.' },
  { title: 'Eject before the call', body: 'Your payout is the exit altitude divided by where you boarded. The moment the flight is lost is hidden until it happens. Some go down in three seconds; some run for minutes.' },
  { title: 'Next launch in five', body: 'Explosion, new ticker, new flight. Board during the countdown and you lift off at 1.00x.' },
]

export function HowItWorks() {
  const { ref, shown } = useRevealOnce<HTMLOListElement>()
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <h2 className="display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Flight briefing</h2>
          <p className="mt-3 max-w-[40ch] text-[15px] text-ink-2">It is a leveraged position, not a slot machine. That distinction is the entire game.</p>
          <p className="num mt-6 text-xs text-ink-3">edge {CHAIN.houseEdgePct}% / cap {CHAIN.maxPayoutX}x / median flight {CHAIN.medianRoundSecLow}-{CHAIN.medianRoundSecHigh}s</p>
        </div>
        <ol ref={ref} className="flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className={cx('grid grid-cols-[56px_1fr] gap-4 rounded-card border border-line bg-gradient-to-b from-surface-2 to-surface p-5', shown ? 'anim-dock' : 'opacity-0')} style={{ animationDelay: `${i * 80}ms` }}>
              <span aria-hidden="true" className="display text-3xl font-extrabold text-cyan">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
