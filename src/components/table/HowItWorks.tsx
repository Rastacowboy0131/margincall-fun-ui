import { CHAIN } from '../../data/sample'
import { AppLink } from '../../app/AppLink'

const STEPS = [
  { title: 'A position opens', body: `Every round is a leveraged stock position on ${CHAIN.networkName}. 20x LONG NVDAx, 25x LONG TSLAx, the ticker rotates. Price starts at 1.00x.` },
  { title: 'The chart moves like a real chart', body: 'Up candles, down candles, dips, pumps. Not an escalator. The whole path is derived from a committed seed.' },
  { title: 'BUY any time', body: 'Enter at the current price whenever you want, mid-round included. Buy the dip, sell the rip, buy back in again. Payout = sell price ÷ your entry.' },
  { title: 'SELL before the call', body: 'Hit cash out to lock in. The rug tick is hidden and provably fair. Some rounds die in 3 seconds, some run minutes. Anyone still holding at the margin call loses the position.' },
  { title: 'Next position in 5s', body: 'Liquidation flash, new ticker, new round. Queue a buy during the intermission to fill at the 1.00x open.' },
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1560px] px-4 py-12 sm:px-6 lg:py-16">
      <h2 className="display text-4xl leading-none tracking-wide sm:text-5xl"><span className="text-ink">How it </span><span className="text-lime">works</span></h2>
      <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((s, i) => (
          <li key={s.title} className="card anim-rise flex flex-col p-5" style={{ animationDelay: `${i * 60}ms` }}>
            <span aria-hidden="true" className="num mb-3 grid size-7 place-items-center rounded-[6px] bg-lime text-xs font-extrabold text-bg">{i + 1}</span>
            <h3 className="text-[15px] font-bold text-ink">{s.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-[100ch] text-[13px] leading-relaxed text-ink-3">
        Fairness: the entire price path and the rug tick are derived from a committed server seed revealed after each round (<AppLink to="/verify" className="text-lime underline underline-offset-4">verify</AppLink>). House edge is {CHAIN.houseEdgePct}%, stated openly. Median round runs {CHAIN.medianRoundSecLow}-{CHAIN.medianRoundSecHigh}s with a fat tail. Winnings capped at {CHAIN.maxPayoutX}x per position.
      </p>
    </section>
  )
}
