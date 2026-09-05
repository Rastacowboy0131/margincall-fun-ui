import { AppLink } from '../app/AppLink'
import type { Position } from '../data/types'
import { CHAIN, HISTORY, POSITION, SESSION } from '../data/sample'
import { eth, signedEth, x } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Panel } from '../components/ui/Panel'
import { Stat } from '../components/ui/Stat'
import { Tag } from '../components/ui/Tag'
import { keyClasses } from '../components/ui/Key'
import { TickerMark } from '../components/brand/TickerMark'
import { Ticket } from '../components/table/Ticket'
import { cx } from '../lib/cx'

/* ------------------------------------------------------------------ *
 * Me — your money and your log, which were two separate pages in the
 * old build for no reason anyone could name. A player checking their
 * balance and a player checking what they lost it on are the same
 * player, thirty seconds apart.
 *
 * The positions log reflows rather than shrinks: a seven-column table
 * at 360px is unreadable in either direction, so below sm each row
 * becomes a stacked card carrying the same seven values.
 * ------------------------------------------------------------------ */

function Outcome({ row }: { row: (typeof HISTORY)[number] }) {
  return row.outcome === 'called' ? (
    <Tag tone="down">liquidated</Tag>
  ) : row.pnlEth >= 0 ? (
    <Tag tone="up">sold green</Tag>
  ) : (
    <Tag tone="quiet">sold red</Tag>
  )
}

export function Me() {
  /* Typed as nullable on purpose. The sample file always hands over an
   * open position, but the empty branch below is a designed state and
   * has to compile — when Nora wires this up, `null` is what a flat
   * player gets and it must not fall through to a broken layout. */
  const open: Position | null = POSITION

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead
        first="THE"
        second="DAMAGE"
        lead={
          <>
            Paper positions, paper P&amp;L, real lessons. Everything here lives in your browser
            until {CHAIN.networkName} mainnet ships.
          </>
        }
        aside={
          <div className="flex items-center gap-2">
            <Tag tone="gold">Paper trading</Tag>
            <Tag tone="live">{SESSION.streakDays}-day streak</Tag>
          </div>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ---- the open position ---- */}
        <Panel title="Open position" bodyClassName="p-0">
          {open === null ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <span aria-hidden="true" className="text-3xl">
                🎟️
              </span>
              <p className="text-base font-bold text-ink">Nothing open</p>
              <p className="max-w-[36ch] text-sm text-ink-3">
                Flat is a position too, just a boring one. Nothing prints out of the console until
                you buy into a round.
              </p>
              <AppLink to="/" className={`${keyClasses('cash', 'md')} mt-1`}>
                Go to the table
              </AppLink>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start">
              <Ticket
                position={open}
                payoutX={open.payoutX}
                pnlEth={open.pnlEth}
                stamp="none"
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <TickerMark ticker={open.ticker} size={30} />
                  <span className="text-lg font-extrabold tracking-tight">
                    {open.ticker.symbol}
                  </span>
                  <Tag tone="up">
                    {open.leverage}x {open.side}
                  </Tag>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">
                  You are holding {eth(open.stakeEth)} ETH into round #{open.roundId}, in at{' '}
                  <span className="nums font-bold text-ink">{x(open.entryX)}</span>. Your payout is
                  the sell price divided by that entry — not the round multiple — which right now
                  is <span className="nums font-bold text-up">{x(open.payoutX)}</span>.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <AppLink to="/" className={keyClasses('cash', 'md')}>
                    Back to the table
                  </AppLink>
                  <span className="nums text-sm font-bold text-up">
                    {signedEth(open.pnlEth, 4)} ETH unrealised
                  </span>
                </div>
              </div>
            </div>
          )}
        </Panel>

        {/* ---- the money ---- */}
        <Panel title="Paper balance" bodyClassName="p-0">
          <dl className="divide-y divide-rim">
            {[
              ['Buying power', `${eth(SESSION.buyingPowerEth)} ETH`, 'text-ink'],
              ['At risk (open position)', `${eth(SESSION.atRiskEth)} ETH`, 'text-ink'],
              [
                'Session net P&L',
                `${signedEth(SESSION.netPnlEth, 4)} ETH`,
                SESSION.netPnlEth < 0 ? 'text-down' : 'text-up',
              ],
            ].map(([label, value, tone]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 px-4 py-3">
                <dt className="text-sm text-ink-2">{label}</dt>
                <dd className={cx('nums text-sm font-bold', tone)}>{value}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3 bg-void px-4 py-4">
              <dt className="text-sm font-bold">Account value</dt>
              <dd className="nums text-xl font-extrabold text-gold">
                {eth(SESSION.accountValueEth, 4)} ETH
              </dd>
            </div>
          </dl>
        </Panel>
      </div>

      {/* ---- session stats: one panel, internal dividers, one hero ---- */}
      <Panel title="This session" className="mt-4" bodyClassName="p-0">
        <div className="grid grid-cols-2 divide-x divide-y divide-rim sm:grid-cols-3 lg:grid-cols-5">
          <Stat
            label="Net P&L"
            value={`${signedEth(SESSION.netPnlEth)}`}
            note="ETH · the house is patient"
            tone={SESSION.netPnlEth < 0 ? 'down' : 'up'}
            hero
          />
          <Stat label="Rounds played" value={SESSION.roundsPlayed} note="positions opened" />
          <Stat
            label="Win rate"
            value={SESSION.winRatePct === null ? '—' : `${SESSION.winRatePct.toFixed(1)}%`}
            note="sold above your entry"
          />
          <Stat
            label="Best exit"
            value={SESSION.bestExitX === null ? '—' : x(SESSION.bestExitX)}
            note="GMEx, round #4412"
            tone="up"
          />
          <Stat
            label="Worst liquidation"
            value={SESSION.worstCalledAtX === null ? '—' : x(SESSION.worstCalledAtX)}
            note="AAPLx, round #4413"
            tone="down"
          />
        </div>
      </Panel>

      {/* ---- the log ---- */}
      <Panel
        title="Your positions"
        className="mt-4"
        bodyClassName="p-0"
        count={<span className="nums text-xs font-bold text-ink-3">{HISTORY.length} shown</span>}
      >
        {/* wide: a real table, numbers right-aligned so magnitudes compare */}
        <div className="hidden sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rim">
                {['Round', 'Position', 'Entry', 'Exit', 'Rugged at', 'P&L', 'Outcome'].map((h, i) => (
                  <th
                    key={h || i}
                    scope="col"
                    className={cx(
                      'eyebrow px-4 py-2.5 text-ink-3',
                      i >= 2 && i <= 5 ? 'text-right' : 'text-left',
                    )}
                  >
                    {/* The outcome column's heading is carried for
                     * screen readers only — the tags underneath say it
                     * plainly enough, and sr-only on the <th> itself
                     * would take the cell out of the table's layout. */}
                    {i === 6 ? <span className="sr-only">{h}</span> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rim">
              {HISTORY.map((r) => (
                <tr key={r.roundId}>
                  <td className="nums px-4 py-3 text-ink-3">#{r.roundId}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-ink">{r.ticker}</span>
                      <span className="nums text-xs text-ink-3">
                        {r.leverage}x {r.side}
                      </span>
                    </span>
                  </td>
                  <td className="nums px-4 py-3 text-right text-ink-2">{x(r.entryX)}</td>
                  <td className="nums px-4 py-3 text-right text-ink-2">
                    {r.exitX === null ? '—' : x(r.exitX)}
                  </td>
                  <td className="nums px-4 py-3 text-right text-ink-2">{x(r.ruggedAtX)}</td>
                  <td
                    className={cx(
                      'nums px-4 py-3 text-right font-extrabold',
                      r.pnlEth < 0 ? 'text-down' : 'text-up',
                    )}
                  >
                    {signedEth(r.pnlEth, 3)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Outcome row={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* phone: the same seven values, stacked */}
        <ul className="divide-y divide-rim sm:hidden">
          {HISTORY.map((r) => (
            <li key={r.roundId} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">{r.ticker}</span>
                  <span className="nums text-xs text-ink-3">
                    {r.leverage}x {r.side}
                  </span>
                </span>
                <Outcome row={r} />
              </div>
              <div className="flex items-end justify-between gap-3">
                <dl className="nums flex gap-4 text-xs text-ink-3">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider">Entry</dt>
                    <dd className="text-ink-2">{x(r.entryX)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider">Exit</dt>
                    <dd className="text-ink-2">{r.exitX === null ? '—' : x(r.exitX)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider">Rugged</dt>
                    <dd className="text-ink-2">{x(r.ruggedAtX)}</dd>
                  </div>
                </dl>
                <span
                  className={cx(
                    'nums text-base font-extrabold',
                    r.pnlEth < 0 ? 'text-down' : 'text-up',
                  )}
                >
                  {signedEth(r.pnlEth, 3)}
                </span>
              </div>
              <span className="nums text-[11px] text-ink-3">
                #{r.roundId} · {r.timeLabel}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
