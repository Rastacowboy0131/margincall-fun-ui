import { useState } from 'react'
import { CHAIN, TOP_REFERRERS } from '../data/sample'
import { eth } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Avatar } from '../components/brand/Avatar'
import { Icon } from '../components/ui/Icon'
import { Key } from '../components/ui/Key'
import { Panel } from '../components/ui/Panel'
import { Stat } from '../components/ui/Stat'
import { Tag } from '../components/ui/Tag'
import { cx } from '../lib/cx'

/* ------------------------------------------------------------------ *
 * Rewards — the daily draw and referrals on one page, because they are
 * the same promise from the player's side: the house paying you back.
 * Splitting them across two tabs, as the old build did, meant a player
 * had to already know which one they wanted.
 *
 * The countdown is a fixed sample string. Nora: it ticks off the draw
 * time, and it is the only figure on this page that has to move.
 * ------------------------------------------------------------------ */

const SOON = [
  {
    title: 'Streak rewards',
    body: 'Log in and lose money seven days in a row, earn a badge and a bonus. Consistency is a virtue, even in ruin.',
  },
  {
    title: 'Volume tiers',
    body: 'Bronze to Diamond Hands. The more you trade, the more the house kicks back. Fee rebates scale with your donations.',
  },
  {
    title: 'Liquidation milestones',
    body: 'Your 10th, 50th and 100th margin call each mint a commemorative badge. Wear the pain.',
  },
  {
    title: 'Whale perks',
    body: 'Top volume wallets get early round access, custom flair, and a direct line to lose bigger.',
  },
]

export function Rewards() {
  const [copied, setCopied] = useState(false)

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead
        first="GETTING"
        second="PAID"
        lead="Getting liquidated should pay something back. Here is what the house gives to the people who keep showing up."
      />

      {/* ---- the daily draw ---- */}
      <section className="overflow-hidden rounded-panel border-2 border-gold-deep/45 bg-gold-wash shadow-lift">
        <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Tag tone="gold">Daily giveaway</Tag>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
              {CHAIN.dailyPotEth} ETH split across today&rsquo;s most liquidated
            </h2>
            <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-ink-2">
              Every margin call you eat today is a raffle ticket. The house draws at 00:00 UTC and
              pays the day&rsquo;s saddest wallets. Losing on purpose still counts — we checked.
            </p>
          </div>

          <div className="shrink-0 rounded-key border border-gold-deep/40 bg-void p-4 text-center lg:w-[248px]">
            <span className="eyebrow text-ink-3">Next draw in</span>
            <p className="nums mt-2 text-3xl font-extrabold tracking-tight text-gold">06:21:33</p>
            <Key variant="cash" size="md" full className="mt-3">
              Earn tickets (get rekt)
            </Key>
          </div>
        </div>
      </section>

      {/* ---- referrals ---- */}
      <h2 className="mt-10 font-sign text-2xl tracking-tight">
        <span className="text-ink">REFER A </span>
        <span className="text-gold">FUTURE LIQUIDATION</span>
      </h2>
      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink-2">
        Every degenerate you bring earns you {CHAIN.referralSharePct}% of the house take on their
        volume, forever. Bound on chain at their first bet, claimable any time. They were going to
        get margin called somewhere; it might as well pay you.
      </p>

      <Panel title="Your referral link" className="mt-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* An address is a long unbroken string and the classic cause
           * of horizontal scroll on a phone. It gets its own scroll. */}
          <p className="nums min-w-0 flex-1 overflow-x-auto rounded-key border border-rim bg-void px-3 py-3 text-xs whitespace-nowrap text-ink-2">
            {CHAIN.referralUrl}
          </p>
          <Key
            variant={copied ? 'long' : 'cash'}
            size="md"
            className="shrink-0 sm:w-[124px]"
            onClick={() => setCopied(true)}
          >
            {/* Feedback at the point of action, not in a toast across
             * the screen from the thing that was pressed. */}
            <Icon name={copied ? 'check' : 'copy'} size={15} strokeWidth={2.6} />
            {copied ? 'Copied' : 'Copy'}
          </Key>
        </div>
        <p className="mt-2.5 text-xs text-ink-3">
          Code <span className="nums font-bold text-gold">{CHAIN.referralCode}</span> · earnings
          bind to your wallet on chain at your referee&rsquo;s first bet. No take-backs, no rug
          (on this, specifically).
        </p>
      </Panel>

      <Panel className="mt-4" bodyClassName="p-0">
        <div className="grid grid-cols-2 divide-x divide-y divide-rim lg:grid-cols-4">
          <Stat
            label="Claimable"
            value={eth(CHAIN.referralClaimableEth)}
            note="ETH · yours right now"
            tone="gold"
            hero
          />
          <Stat label="Referees" value={CHAIN.referralRefereeCount} note="souls onboarded" />
          <Stat
            label="Their volume"
            value={eth(CHAIN.referralVolumeEth)}
            note="ETH donated to the house"
          />
          <Stat
            label="Earned all time"
            value={eth(CHAIN.referralEarnedEth, 3)}
            note={`ETH · ${CHAIN.referralSharePct}% of house take`}
            tone="up"
          />
        </div>
        <div className="border-t border-rim p-4">
          <Key variant="cash" size="xl" full>
            Claim {eth(CHAIN.referralClaimableEth)} ETH
          </Key>
        </div>
      </Panel>

      <Panel title="Top referrers" className="mt-4" bodyClassName="p-0">
        <ul className="divide-y divide-rim">
          {TOP_REFERRERS.map((r) => (
            <li key={r.handle} className="flex items-center gap-3 px-4 py-3">
              <span className="nums w-5 shrink-0 text-sm font-bold text-ink-3">{r.rank}</span>
              <Avatar handle={r.handle} tint={r.tint} size={28} />
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{r.handle}</span>
              <span className="nums hidden w-20 shrink-0 text-right text-xs text-ink-3 sm:block">
                {r.referees} refs
              </span>
              <span className="nums w-24 shrink-0 text-right text-sm text-ink-2">
                {eth(r.volumeEth, 1)}
              </span>
              <span className="nums w-24 shrink-0 text-right text-sm font-extrabold text-gold">
                {eth(r.earnedEth)}
              </span>
            </li>
          ))}
        </ul>
        <p className="border-t border-rim px-4 py-2.5 text-right text-[11px] text-ink-3">
          Columns: referees · their volume (ETH) · your cut (ETH)
        </p>
      </Panel>

      {/* ---- not yet ---- */}
      <div className="mt-10 flex items-center gap-3">
        <h2 className="eyebrow text-ink-3">More ways to get paid</h2>
        <Tag tone="live">Coming soon</Tag>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SOON.map((s) => (
          <li
            key={s.title}
            className={cx(
              'flex flex-col rounded-panel border border-dashed border-rim-hi bg-panel/60 p-4',
            )}
          >
            <h3 className="text-base font-extrabold tracking-tight text-ink-2">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{s.body}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-ink-3">
        Rewards go live with {CHAIN.networkName} mainnet. Until then the demo desk pays out in
        experience, which your therapist will tell you is also valuable.
      </p>
    </div>
  )
}
