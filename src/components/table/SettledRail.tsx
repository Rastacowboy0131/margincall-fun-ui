import type { Result, Round, RoundPhase } from '../../data/types'
import { TICKERS } from '../../data/sample'
import { BAND_LABEL, bandOf, x } from '../../lib/format'
import { TickerMark } from '../brand/TickerMark'
import { Panel } from '../ui/Panel'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * Previous rounds, as rows: the current round leads, then the rounds
 * that already settled, newest first, each with the multiple it rugged
 * at. Each row: state, mark, symbol and leverage, and on the right the
 * live multiple or the settled result.
 *
 * This deliberately shows what HAPPENED rather than a queue of future
 * rounds (Rasta, 2026-09-08): the rotation ahead is not information a
 * player can act on, and a board of times-until-start invited people to
 * wait instead of trade. The player's own pending entry still lives in
 * the order panel, which is a different thing.
 * ------------------------------------------------------------------ */

const BAND_TONE: Record<ReturnType<typeof bandOf>, string> = {
  dust: 'text-ink-3',
  ok: 'text-lime',
  big: 'text-amber',
  monster: 'text-amber',
}

export function SettledRail({ round, phase, results }: { round: Round; phase: RoundPhase; results: Result[] }) {
  const over = phase === 'called', inter = phase === 'intermission'
  const tone = over ? 'text-down' : inter ? 'text-amber' : round.currentX < 1 ? 'text-down' : 'text-lime'
  return (
    <Panel title="Previous rounds" icon="history" bodyClassName="p-0">
      <ul className="divide-y divide-line">
        <li className={cx('flex items-center gap-3 px-4 py-3', over ? 'bg-down-wash/60' : inter ? 'bg-amber-wash/60' : 'bg-lime-wash/60')}>
          <span className={cx('num w-10 shrink-0 text-[10px] font-bold tracking-wider uppercase', tone)}>{over ? 'Over' : inter ? 'Open' : 'Live'}</span>
          <TickerMark ticker={round.ticker} size={28} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-ink">{round.ticker.symbol} <span className="num font-semibold text-ink-2">{round.leverage}x</span></span>
            <span className="num block text-2xs text-ink-3">round #{round.id} · {round.ticker.name}</span>
          </span>
          <span className={cx('num flex items-center gap-1.5 text-base font-bold', tone)}>
            {!over && !inter && <span aria-hidden="true" className="anim-pulse size-1.5 rounded-pill bg-current" />}
            {inter ? `${round.opensInSec}s` : x(round.currentX)}
          </span>
        </li>
        {results.length === 0 ? (
          <li className="px-4 py-6 text-center text-xs text-ink-3">No rounds have settled yet this session.</li>
        ) : results.slice(0, 5).map((r) => {
          const band = bandOf(r.ruggedAtX)
          const t = TICKERS[r.ticker]
          return (
            <li key={r.roundId} className="flex items-center gap-3 px-4 py-2.5">
              <span className="num w-10 shrink-0 text-[10px] font-bold tracking-wider text-ink-3 uppercase">#{r.roundId}</span>
              {t ? <TickerMark ticker={t} size={26} /> : <span aria-hidden="true" className="size-[26px] shrink-0 rounded-[6px] border border-line-2" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{r.ticker} <span className="num text-ink-2">{r.leverage}x</span></span>
                <span className="block text-2xs text-ink-3">{t ? t.name : 'settled'}</span>
              </span>
              <span className="text-right">
                <span className="block text-[10px] text-ink-3">rugged at</span>
                <span className={cx('num block text-sm font-bold', BAND_TONE[band])}>
                  {x(r.ruggedAtX)}<span className="sr-only">{`, ${BAND_LABEL[band]}`}</span>
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
