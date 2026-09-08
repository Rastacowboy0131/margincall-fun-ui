import { CHAIN } from '../data/sample'
import { AppLink } from '../app/AppLink'
import { PageHead } from '../components/shell/PageHead'
import { buttonClasses } from '../components/ui/Button'
import { Tag } from '../components/ui/Tag'

const SOON = [
  { title: 'Streak rewards', body: 'Log in and lose money 7 days in a row, earn a badge and a bonus. Consistency is a virtue, even in ruin.' },
  { title: 'Volume tiers', body: 'Bronze to Diamond Hands. The more you trade, the more the house kicks back. Fee rebates scale with your donations.' },
  { title: 'Liquidation milestones', body: 'Your 10th, 50th, and 100th margin call each mint a commemorative badge. Wear the pain.' },
  { title: 'Whale perks', body: 'Top volume wallets get early round access, custom flair, and a direct line to lose bigger.' },
]

export function Rewards() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead first="Rewards for the" second="faithful" lead="Getting liquidated should pay something back. Here's what the house gives to those who keep showing up." />

      <section className="card grid gap-6 border-lime/30 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center" style={{ background: 'linear-gradient(135deg, rgb(196 255 58 / 0.08), transparent 60%)' }}>
        <div>
          <Tag tone="lime">Daily giveaway</Tag>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{CHAIN.dailyPotEth} ETH split across today&rsquo;s most liquidated</h2>
          <p className="mt-2 max-w-[56ch] text-sm text-ink-2">Every margin call you eat today is a raffle ticket. The house draws at 00:00 UTC and pays the day&rsquo;s saddest wallets. Losing on purpose still counts, we checked.</p>
        </div>
        <div className="card bg-bg p-4 text-center">
          <span className="label">Next draw in</span>
          <p className="display num mt-1 text-4xl text-lime">06:21:33</p>
          <AppLink to="/" className={`${buttonClasses('lime', 'md')} mt-3 w-full`}>Earn tickets (get rekt)</AppLink>
        </div>
      </section>

      <div className="mt-10 flex items-center gap-3"><h2 className="label">More ways to get paid</h2><Tag tone="amber">Coming soon</Tag></div>
      <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SOON.map((s) => (
          <li key={s.title} className="card flex flex-col p-4">
            <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-bold text-ink">{s.title}</h3><Tag tone="quiet">soon</Tag></div>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">{s.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-4">
        <p className="text-sm text-ink-2">Bringing friends pays {CHAIN.referralSharePct}% of the house take on their volume, forever.</p>
        <AppLink to="/referrals" className={buttonClasses('ghost', 'md')}>Referrals</AppLink>
      </div>
      <p className="mt-4 text-xs text-ink-3">Rewards go live with {CHAIN.networkName} mainnet. Until then the demo desk pays out in experience, which your therapist will tell you is also valuable.</p>
    </div>
  )
}
