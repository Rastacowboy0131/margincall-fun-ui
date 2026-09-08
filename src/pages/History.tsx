import type { HistoryRow } from '../data/types'
import { TICKERS } from '../data/sample'
import { AppLink } from '../app/AppLink'
import { useReel } from '../lib/useReel'
import { signedEth, stake, x } from '../lib/format'
import { PageHead } from '../components/shell/PageHead'
import { Panel } from '../components/ui/Panel'
import { Tag } from '../components/ui/Tag'
import { TickerMark } from '../components/brand/TickerMark'
import { cx } from '../lib/cx'

function Outcome({ row }: { row: HistoryRow }) {
  return row.outcome === 'called' ? <Tag tone="down">liquidated</Tag> : row.pnlEth >= 0 ? <Tag tone="lime">sold</Tag> : <Tag tone="amber">sold red</Tag>
}

export function History() {
  const { history, results } = useReel()
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-12">
      <PageHead first="Trade" second="history" lead="Every entry, every exit, every body bag. Your session, faithfully recorded." />

      <Panel title="Your positions this session" icon="history" bodyClassName="p-0" count={<span className="num text-xs text-ink-3">{history.length}</span>}>
        {history.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-ink-3">No settled positions yet. The log fills in as you play. <AppLink to="/" className="text-lime underline underline-offset-4">Go trade</AppLink>.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block"><table className="w-full text-sm">
              <thead><tr className="border-b border-line">{['Time', 'Round', 'Token', 'Size', 'Entry', 'Exit', 'Rugged at', 'P&L', ''].map((h, i) => <th key={h || i} scope="col" className={cx('label px-4 py-2.5', i >= 3 && i <= 7 ? 'text-right' : 'text-left')}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {history.map((r) => (
                  <tr key={r.roundId + r.timeLabel} className="transition-colors hover:bg-surface-2">
                    <td className="num px-4 py-3 text-ink-3">{r.timeLabel}</td>
                    <td className="num px-4 py-3 text-ink-3">#{r.roundId}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-2">{TICKERS[r.ticker] && <TickerMark ticker={TICKERS[r.ticker]} size={20} />}<span className="font-bold text-ink">{r.ticker}</span><span className="num text-xs text-ink-3">{r.leverage}x</span></span></td>
                    <td className="num px-4 py-3 text-right whitespace-nowrap text-ink-2">{stake(r.stakeEth)} ETH</td>
                    <td className="num px-4 py-3 text-right whitespace-nowrap text-ink-2">{x(r.entryX)}</td>
                    <td className="num px-4 py-3 text-right whitespace-nowrap text-ink-2">{r.exitX === null ? <span className="text-ink-3">liq</span> : x(r.exitX)}</td>
                    <td className="num px-4 py-3 text-right whitespace-nowrap text-ink-2">{x(r.ruggedAtX)}</td>
                    <td className={cx('num px-4 py-3 text-right font-bold whitespace-nowrap', r.pnlEth < 0 ? 'text-down' : 'text-lime')}>{signedEth(r.pnlEth, 4)} ETH</td>
                    <td className="px-4 py-3 text-right"><Outcome row={r} /></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <ul className="divide-y divide-line sm:hidden">
              {history.map((r) => (
                <li key={r.roundId + r.timeLabel} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold text-ink">{r.ticker} <span className="num text-xs text-ink-3">{r.leverage}x</span></span><Outcome row={r} /></div>
                  <div className="num flex items-end justify-between text-xs text-ink-3"><span>entry {x(r.entryX)} · exit {r.exitX === null ? 'liq' : x(r.exitX)} · rug {x(r.ruggedAtX)}</span><span className={cx('text-base font-bold', r.pnlEth < 0 ? 'text-down' : 'text-lime')}>{signedEth(r.pnlEth, 3)}</span></div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel title="Recent round results" icon="leaderboard" className="mt-4" bodyClassName="p-0">
        {results.length === 0 ? <p className="px-4 py-8 text-center text-xs text-ink-3">No rounds have settled yet this session.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-line">{['Round', 'Token', 'Lev', 'Rugged at'].map((h, i) => <th key={h} scope="col" className={cx('label px-4 py-2.5', i >= 2 ? 'text-right' : 'text-left')}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {results.map((r) => (
                <tr key={r.roundId} className="transition-colors hover:bg-surface-2">
                  <td className="num px-4 py-3 text-ink-3">#{r.roundId}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-2">{TICKERS[r.ticker] && <TickerMark ticker={TICKERS[r.ticker]} size={20} />}<span className="font-bold text-ink">{r.ticker}</span></span></td>
                  <td className="num px-4 py-3 text-right whitespace-nowrap text-ink-2">{r.leverage}x</td>
                  <td className={cx('num px-4 py-3 text-right font-bold whitespace-nowrap', r.ruggedAtX < 1.5 ? 'text-down' : r.ruggedAtX < 5 ? 'text-lime' : 'text-amber')}>{x(r.ruggedAtX)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Panel>
      <p className="mt-4 text-xs text-ink-3">All local, all paper. Provably fair seeds for past rounds live on the <AppLink to="/verify" className="text-lime underline underline-offset-4">verify page</AppLink>.</p>
    </div>
  )
}
