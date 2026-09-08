import { useState } from 'react'
import { AppLink } from '../app/AppLink'
import { CHAIN } from '../data/sample'
import { useReel } from '../lib/useReel'
import { eth, signedEth, stake, x } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Panel } from '../components/ui/Panel'
import { Stat } from '../components/ui/Stat'
import { Tag } from '../components/ui/Tag'
import { buttonClasses } from '../components/ui/Button'
import { TickerMark } from '../components/brand/TickerMark'
import { Avatar } from '../components/brand/Avatar'
import { ProfileSheet } from '../components/shell/ProfileSheet'
import { displayName, useProfile } from '../lib/profile'
import { cx } from '../lib/cx'

export function Portfolio() {
  const reel = useReel()
  const { you, session } = reel
  const live = reel.mode === 'live'
  const profile = useProfile()
  const [editing, setEditing] = useState(false)
  const open = you.status === 'in' && you.entryX !== null

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead first="Your" second="portfolio" lead={live ? 'Live positions, real ETH, the same lessons. Settled on Robinhood Chain; this log lives in your browser.' : `Paper positions, paper P&L, real lessons. Everything here lives in your browser until ${CHAIN.networkName} mainnet ships.`}
        aside={<div className="flex items-center gap-2"><Tag tone={live ? 'lime' : 'quiet'}>{live ? 'Live · on chain' : 'Paper trading'}</Tag><Tag tone="amber">{session.streakDays}-day streak</Tag></div>} />

      <div className="card mb-4 flex items-center gap-4 p-4">
        <Avatar handle={displayName(profile)} tint="#2a3128" size={44} ring="lime" pfp={profile.pfp || undefined} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><span className="truncate text-base font-bold text-ink">{displayName(profile)}</span><Tag tone="quiet">{live ? 'Live' : 'Demo'}</Tag></div>
          <p className="mt-0.5 truncate text-xs text-ink-3">{profile.name ? 'Stored in this browser. Shown at the table, in the feed and on the leaderboard.' : 'Set a name and picture for your seat at the table.'}</p>
        </div>
        <button type="button" onClick={() => setEditing(true)} className={`${buttonClasses('ghost', 'md')} shrink-0`}>Edit profile</button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Open position" icon="portfolio" bodyClassName="p-0">
          {!open ? (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
              <p className="text-sm font-bold text-ink">No open position</p>
              <p className="max-w-[40ch] text-xs text-ink-3">Flat is a position too, just a boring one.</p>
              <AppLink to="/" className={`${buttonClasses('lime', 'md')} mt-2`}>Fix that</AppLink>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-3"><TickerMark ticker={reel.ticker} size={34} /><div><div className="text-sm font-bold text-ink">{reel.ticker.symbol} <span className="text-ink-2">{reel.leverage}x long</span></div><div className="num text-xs text-ink-3">round #{reel.roundId} · opened {you.openedAtLabel}</div></div></div>
              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[['Size', `${stake(you.stakeEth)} ETH`, 'text-ink'], ['Entry', x(you.entryX ?? 1), 'text-ink'], ['Payout', x(reel.payoutX ?? 1), (reel.payoutX ?? 1) < 1 ? 'text-down' : 'text-lime'], ['Unrealised', `${signedEth(reel.pnlEth ?? 0, 4)} ETH`, (reel.pnlEth ?? 0) < 0 ? 'text-down' : 'text-lime']].map(([k, v, t]) => (
                  <div key={k} className="rounded-ctl border border-line bg-surface-2 px-3 py-2.5"><dt className="label">{k}</dt><dd className={cx('num mt-1 text-sm font-bold', t)}>{v}</dd></div>
                ))}
              </dl>
              <AppLink to="/" className={`${buttonClasses('lime', 'md')} mt-4`}>Back to the trade</AppLink>
            </div>
          )}
        </Panel>

        <Panel title={live ? 'Wallet balance' : 'Paper balance breakdown'} bodyClassName="p-0">
          <dl className="divide-y divide-line">
            {[['Buying power', `${eth(session.buyingPowerEth)} ETH`, 'text-ink'], ['At risk (open position)', `${eth(session.atRiskEth)} ETH`, 'text-ink'], ['Session net P&L', `${signedEth(session.netPnlEth, 4)} ETH`, session.netPnlEth < 0 ? 'text-down' : 'text-lime']].map(([k, v, t]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 px-4 py-3"><dt className="text-sm text-ink-2">{k}</dt><dd className={cx('num text-sm font-bold', t)}>{v}</dd></div>
            ))}
            <div className="flex items-baseline justify-between gap-3 bg-surface-2 px-4 py-4"><dt className="text-sm font-bold">Account value</dt><dd className="num text-lg font-extrabold text-ink">{eth(session.accountValueEth, 4)} ETH</dd></div>
          </dl>
        </Panel>
      </div>

      <Panel title="This session" className="mt-4" bodyClassName="p-0">
        <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Net P&L" value={`${signedEth(session.netPnlEth)} ETH`} note="the house thanks you" tone={session.netPnlEth < 0 ? 'down' : 'up'} hero />
          <Stat label="Rounds played" value={session.roundsPlayed} note="positions opened" />
          <Stat label="Win rate" value={session.winRatePct === null ? '0.0%' : `${session.winRatePct.toFixed(1)}%`} note="sold above your entry" />
          <Stat label="Best exit" value={session.bestExitX === null ? '0.00x' : x(session.bestExitX)} note="your best payout multiple" tone="up" />
          <Stat label="Worst liquidation" value={session.worstCalledAtX === null ? '0.00x' : x(session.worstCalledAtX)} note="lowest rug you held into" tone="down" />
        </div>
      </Panel>
      <p className="mt-4 text-xs text-ink-3">Session stats track every position you close or get liquidated out of, in this browser. Full log on the <AppLink to="/history" className="text-lime underline underline-offset-4">history page</AppLink>. Reset lives in the balance dropdown up top.</p>
      {editing && <ProfileSheet open onClose={() => setEditing(false)} />}
    </div>
  )
}
