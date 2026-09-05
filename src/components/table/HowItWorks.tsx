import { CHAIN } from '../../data/sample'
import { useRevealOnce } from '../../lib/useRevealOnce'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * How it works, dealt out like a hand.
 *
 * Five cards, each on its own delay, arriving from below with a small
 * rotation — the reveal fires once from an IntersectionObserver that
 * disconnects immediately afterwards, because a band that re-deals
 * every time you scroll past it is a toy.
 *
 * Under prefers-reduced-motion useRevealOnce returns true straight
 * away, so the cards render in their settled position rather than
 * waiting for an animation that will never run.
 * ------------------------------------------------------------------ */

const STEPS = [
  {
    title: 'A position opens',
    body: 'Every few seconds the house opens a leveraged position on a tokenised stock — 20x long NVDAx, 25x long TSLAx, the ticker rotates. It starts at 1.00x.',
  },
  {
    title: 'The chart moves like a chart',
    body: 'Up candles, down candles, dips, pumps. Not an escalator. The whole price path comes from one seed that was committed before the round opened.',
  },
  {
    title: 'Buy whenever you like',
    body: 'At the open or halfway up. Wherever you buy becomes your 1.00x, so buying the dip and selling the rip is a real strategy here.',
  },
  {
    title: 'Sell before the call',
    body: 'Your payout is the sell price divided by your entry. The rug tick is hidden until the round settles. Some rounds die in three seconds; some run for minutes.',
  },
  {
    title: 'Next one in five',
    body: 'Liquidation flash, shredded ticket, new ticker, new round. Queue a buy during the gap and you fill at the 1.00x open.',
  },
]

export function HowItWorks() {
  const { ref, shown } = useRevealOnce<HTMLDivElement>()

  return (
    <section ref={ref} className="mx-auto max-w-[1560px] px-3 py-12 sm:px-5 lg:py-16">
      <h2 className="font-sign text-poster tracking-tight">
        <span className="text-ink">HOW IT </span>
        <span className="text-gold">WORKS</span>
      </h2>
      <p className="mt-3 max-w-[58ch] text-base text-ink-2">
        It is a leveraged position, not a slot machine. That distinction is the entire game.
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className={cx(shown ? 'anim-deal' : 'opacity-0')}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {/* The resting tilt lives on an inner element: mc-deal ends
             * at `transform: none` with fill-mode both, so a transform
             * set on the animated element itself would be wiped the
             * moment the animation settled. */}
            <div
              className="flex h-full flex-col rounded-panel border border-rim bg-panel p-4 shadow-lift"
              style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.6}deg)` }}
            >
              <span
                aria-hidden="true"
                className="mb-3 grid size-9 place-items-center rounded-chip bg-gold font-sign text-sm text-void"
              >
                {i + 1}
              </span>
              <h3 className="text-balance text-base font-extrabold tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 max-w-[86ch] text-sm text-ink-3">
        The price path and the rug tick both come from a server seed committed before the round
        and revealed after it — check any round on the fairness page. House edge is{' '}
        {CHAIN.houseEdgePct}%, stated openly. Median round runs{' '}
        {CHAIN.medianRoundSecLow}&ndash;{CHAIN.medianRoundSecHigh} seconds with a fat tail.
        Winnings are capped at {CHAIN.maxPayoutX}x per position.
      </p>
    </section>
  )
}
