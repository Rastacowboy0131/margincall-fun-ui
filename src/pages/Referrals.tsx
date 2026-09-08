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
import { toast } from '../lib/toast'

export function Referrals() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(CHAIN.referralUrl) } catch { /* clipboard unavailable */ }
    setCopied(true)
    toast({ tone: 'lime', title: 'Referral link copied', body: CHAIN.referralUrl })
    window.setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead first="Refer a future" second="liquidation" lead={`Every degenerate you bring earns you ${CHAIN.referralSharePct}% of the house take on their volume, forever. Bound on-chain at their first bet, claimable any time. They were going to get margin called somewhere; it might as well pay you.`} />

      <Panel title="Your referral link">
        <div className="flex flex-col gap-2 sm:flex-row">
          <p className="num min-w-0 flex-1 truncate rounded-ctl border border-line bg-bg px-3 py-3 text-sm text-lime" title={CHAIN.referralUrl}>{CHAIN.referralUrl}</p>
          <Button variant="lime" size="md" className="shrink-0 sm:w-[120px]" onClick={copy}><span key={String(copied)} className="anim-swap flex items-center gap-2"><Icon name={copied ? 'check' : 'copy'} size={14} strokeWidth={2.4} />{copied ? 'Copied' : 'Copy'}</span></Button>
        </div>
        <p className="mt-2.5 text-xs text-ink-3">Code <span className="num font-bold text-lime">{CHAIN.referralCode}</span> · earnings are bound to your wallet on-chain at your referee&rsquo;s first bet, no take-backs, no rug (on this, specifically).</p>
      </Panel>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card"><Stat label="Referees" value={CHAIN.referralRefereeCount} note="souls onboarded" /></div>
        <div className="card"><Stat label="Referee volume" value={`${eth(CHAIN.referralVolumeEth)} ETH`} note="their donations to the house" /></div>
        <div className="card"><Stat label="Earned (all time)" value={`${eth(CHAIN.referralEarnedEth, 3)} ETH`} note={`${CHAIN.referralSharePct}% of house take`} tone="up" /></div>
        <div className="card border-lime/40"><div className="p-4"><span className="label">Claimable</span><div className="num mt-2.5 text-xl leading-none font-bold text-lime">{eth(CHAIN.referralClaimableEth)} ETH</div><Button variant="lime" size="sm" full className="mt-3">Claim</Button></div></div>
      </div>

      <div className="card mt-4 flex items-center gap-3 px-4 py-3"><Tag tone="amber">Coming soon</Tag><p className="text-xs text-ink-2">First-liquidation refund kicker: your referee&rsquo;s first margin call may get partially refunded, on us. Because the first loss should sting, not amputate.</p></div>

      <Panel title="Top referrers (by earnings)" icon="referrals" className="mt-4" bodyClassName="p-0">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-line">{['#', 'Referrer', 'Referees', 'Volume', 'Earned'].map((h, i) => <th key={h} scope="col" className={cx('label px-4 py-2.5', i >= 2 ? 'text-right' : 'text-left', i === 3 && 'hidden sm:table-cell')}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {TOP_REFERRERS.map((r) => (
              <tr key={r.handle} className="transition-colors hover:bg-surface-2">
                <td className="num w-10 px-3 py-3 text-ink-3 sm:px-4">{r.rank}</td>
                <td className="px-3 py-3 sm:px-4"><span className="flex items-center gap-2.5"><Avatar handle={r.handle} tint={r.tint} size={24} /><span className="truncate font-bold text-ink">{r.handle}</span></span></td>
                <td className="num px-4 py-3 text-right whitespace-nowrap text-ink-2">{r.referees}</td>
                <td className="num hidden px-4 py-3 text-right text-ink-2 sm:table-cell">{eth(r.volumeEth, 1)} ETH</td>
                <td className="num px-4 py-3 text-right whitespace-nowrap font-bold text-lime">{eth(r.earnedEth)} ETH</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Panel>
    </div>
  )
}
function cx(...p: Array<string | false | null | undefined>) { return p.filter(Boolean).join(' ') }
