import { useState } from 'react'
import { CHAIN, TOP_REFERRERS } from '../data/sample'
import { eth } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Avatar } from '../components/brand/Avatar'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { Stat } from '../components/ui/Stat'
import { Tag } from '../components/ui/Tag'

/* Rewards: the daily draw and referrals on one page. Same promise from
 * the player's side: the house paying you back. */

const SOON = [
  { title: 'Streak rewards', body: 'Log in and lose money seven days in a row, earn a badge and a bonus.' },
  { title: 'Volume tiers', body: 'Bronze to Diamond Hands. Fee rebates scale with your donations.' },
  { title: 'Liquidation milestones', body: 'Your 10th, 50th and 100th margin call each mint a badge. Wear the pain.' },
  { title: 'Whale perks', body: 'Top volume wallets get early round access, flair, and a direct line to lose bigger.' },
]

export function Rewards() {
  const [copied, setCopied] = useState(false)

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead
        title="Getting paid"
        lead="Getting liquidated should pay something back. Here is what the house gives to the people who keep showing up."
      />

      <section className="grid gap-6 rounded-card border border-line bg-surface p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <div className="min-w-0">
          <Tag tone="gold">Daily giveaway</Tag>
          <h2 className="display mt-3 text-3xl font-bold tracking-wide text-ink sm:text-4xl">
            {CHAIN.dailyPotEth} ETH split across today&rsquo;s most liquidated
          </h2>
          <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-ink-2">
            Every margin call you eat today is a raffle ticket. The house draws at 00:00 UTC and pays the
            day&rsquo;s saddest wallets. Losing on purpose still counts.
          </p>
        </div>
        <div className="rounded-ctl border border-line bg-bg p-4 text-center">
          <span className="label">Next draw in</span>
          <p className="display mt-2 text-5xl font-extrabold tracking-wide text-ink">06:21:33</p>
          <Button variant="go" size="md" full className="mt-3">
            Earn tickets
          </Button>
        </div>
      </section>

      <h2 className="display mt-12 text-3xl font-bold tracking-wide text-ink">Refer a future liquidation</h2>
      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink-2">
        Every degenerate you bring earns you {CHAIN.referralSharePct}% of the house take on their volume, forever.
        Bound on chain at their first bet, claimable any time.
      </p>

      <Panel title="Your referral link" className="mt-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <p className="num min-w-0 flex-1 overflow-x-auto rounded-ctl border border-line bg-bg px-3 py-3 text-xs whitespace-nowrap text-ink-2">
            {CHAIN.referralUrl}
          </p>
          <Button variant={copied ? 'go' : 'go'} size="md" className="shrink-0 sm:w-[120px]" onClick={() => setCopied(true)}>
            <span key={String(copied)} className="anim-swap flex items-center gap-2">
              <Icon name={copied ? 'check' : 'copy'} size={14} strokeWidth={2.4} />
              {copied ? 'Copied' : 'Copy'}
            </span>
          </Button>
        </div>
        <p className="mt-2.5 text-xs text-ink-3">
          Code <span className="num font-medium text-ink">{CHAIN.referralCode}</span>. Earnings bind to your wallet on
          chain at your referee&rsquo;s first bet.
        </p>
      </Panel>

      <Panel className="mt-4" bodyClassName="p-0">
        <div className="grid grid-cols-2 divide-x divide-y divide-line lg:grid-cols-4">
          <Stat label="Claimable" value={eth(CHAIN.referralClaimableEth)} note="ETH, yours right now" hero />
          <Stat label="Referees" value={CHAIN.referralRefereeCount} note="souls onboarded" />
          <Stat label="Their volume" value={eth(CHAIN.referralVolumeEth)} note="ETH donated to the house" />
          <Stat label="Earned all time" value={eth(CHAIN.referralEarnedEth, 3)} note={`ETH, ${CHAIN.referralSharePct}% of house take`} tone="up" />
        </div>
        <div className="border-t border-line p-4">
          <Button variant="go" size="xl" full>
            Claim {eth(CHAIN.referralClaimableEth)} ETH
          </Button>
        </div>
      </Panel>

      <Panel title="Top referrers" className="mt-4" bodyClassName="p-0">
        <ul className="divide-y divide-line">
          {TOP_REFERRERS.map((r) => (
            <li key={r.handle} className="flex items-center gap-3 px-4 py-3">
              <span className="num w-6 shrink-0 text-sm text-ink-3">{String(r.rank).padStart(2, '0')}</span>
              <Avatar handle={r.handle} tint={r.tint} size={24} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-2">{r.handle}</span>
              <span className="num hidden w-20 shrink-0 text-right text-xs text-ink-3 sm:block">{r.referees} refs</span>
              <span className="num w-24 shrink-0 text-right text-sm text-ink-2">{eth(r.volumeEth, 1)}</span>
              <span className="num w-24 shrink-0 text-right text-sm font-semibold text-ink">{eth(r.earnedEth)}</span>
            </li>
          ))}
        </ul>
        <p className="border-t border-line px-4 py-2.5 text-right text-2xs text-ink-3">
          referees / their volume (ETH) / your cut (ETH)
        </p>
      </Panel>

      <div className="mt-12 flex items-center gap-3">
        <h2 className="display text-3xl font-bold tracking-wide text-ink">More ways to get paid</h2>
        <Tag tone="quiet">Coming soon</Tag>
      </div>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {SOON.map((s) => (
          <li key={s.title} className="grid gap-1 py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
            <h3 className="text-sm font-semibold tracking-tight text-ink">{s.title}</h3>
            <p className="text-sm leading-relaxed text-ink-2">{s.body}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-ink-3">
        Rewards go live with {CHAIN.networkName} mainnet. Until then the demo desk pays out in experience.
      </p>
    </div>
  )
}
