import type { Result, Round, RoundPhase } from '../../data/types'
import { TICKERS } from '../../data/sample'
import { BAND_LABEL, bandOf, x, type ResultBand } from '../../lib/format'
import { TickerMark } from '../brand/TickerMark'

import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * Previous rounds.
 *
 * A crash game with a five-second gap between rounds needs somewhere
 * for the eye to go during it, and "what did the last few rounds pay"
 * is what players actually read before deciding the next bet: the
 * board above the roulette wheel. The live round leads the board, then
 * the most recent settles, newest first, each carrying its ticker
 * medallion and the multiple it rugged at.
 * ------------------------------------------------------------------ */

function LiveCard({
  round,
  phase,
  className,
}: {
  round: Round
  phase: RoundPhase
  className?: string
}) {
  const over = phase === 'called'
  return (
    <li
      className={cx(
        'flex shrink-0 items-center gap-2 rounded-key border-2 px-2 py-2.5 sm:gap-3 sm:px-3',
        over ? 'border-down bg-down-wash' : 'border-gold bg-gold-wash',
        className,
      )}
    >
      <TickerMark ticker={round.ticker} size={34} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="shrink-0 text-sm font-extrabold text-ink">{round.ticker.symbol}</span>
          <span className="nums shrink-0 text-xs font-bold text-ink-3">{round.leverage}x</span>
        </div>
        <span className={cx('eyebrow text-[9px]', over ? 'text-down' : 'text-gold')}>
          {over ? 'round over' : phase === 'intermission' ? 'resetting' : 'live now'}
        </span>
      </div>
      <span
        className={cx('nums shrink-0 text-base font-extrabold', over ? 'text-down' : 'text-gold')}
      >
        {x(round.currentX)}
      </span>
    </li>
  )
}

/* Band styling mirrors the results strip along the top: dust rounds
 * (died early) print red, ordinary cash-out-able rounds green, big and
 * monster rounds keep their gold and hot tiers. The multiple itself is
 * always printed, so nothing is carried by colour alone. */
const BAND_X: Record<ResultBand, string> = {
  dust: 'text-down',
  ok: 'text-up',
  big: 'text-gold',
  monster: 'text-live',
}

const BAND_EDGE: Record<ResultBand, string> = {
  dust: 'border-down/35 bg-down-wash/40',
  ok: 'border-up-deep/35 bg-up-wash/40',
  big: 'border-gold-deep/40 bg-gold-wash/40',
  monster: 'border-live-deep/50 bg-live-wash/40',
}

function ResultCard({ result, className }: { result: Result; className?: string }) {
  const band = bandOf(result.ruggedAtX)
  const ticker = TICKERS[result.ticker]
  return (
    <li
      className={cx(
        'flex shrink-0 items-center gap-2 rounded-key border px-2 py-2.5 sm:gap-2.5 sm:px-2.5',
        BAND_EDGE[band],
        className,
      )}
    >
      {ticker ? <TickerMark ticker={ticker} size={30} /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="shrink-0 text-xs font-bold text-ink">{result.ticker}</span>
          <span className="nums shrink-0 text-[11px] font-bold text-ink-3">
            {result.leverage}x
          </span>
        </div>
        <span className="eyebrow text-[9px] text-ink-3">round #{result.roundId}</span>
      </div>
      <span className={cx('nums shrink-0 text-sm font-extrabold', BAND_X[band])}>
        {x(result.ruggedAtX)}
        <span className="sr-only">{` ${BAND_LABEL[band]}`}</span>
      </span>
    </li>
  )
}

export function QueueRail({
  round,
  phase,
  results,
}: {
  round: Round
  phase: RoundPhase
  results: Result[]
}) {
  /* Two shapes, one list.
   *
   * On a phone it is a flick-scrollable rack: vertical space is the
   * scarce thing there, so it stays one row deep. From lg it becomes a
   * wrapping board that fills the space under the chart, which is where
   * the console used to be.
   *
   * Six cards total, live one included: 3 rows of 2 at lg, 2 rows of 3
   * from xl. Six is what fills that space and nothing more: it divides
   * evenly into both counts, so the last row is never left ragged, and
   * the column count stops at 3 for the same reason.
   *
   * `lg:overflow-visible` is load-bearing: .rail sets overflow-x auto
   * and the grid needs to be allowed to wrap rather than scroll. */
  return (
    <section>
      <h2 className="eyebrow mb-2 px-1 text-ink-3">Previous rounds</h2>
      <ul className="rail flex gap-2 pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-3">
        <LiveCard round={round} phase={phase} className="w-[210px] lg:w-auto" />
        {results.slice(0, 5).map((r) => (
          <ResultCard key={r.roundId} result={r} className="w-[184px] lg:w-auto" />
        ))}
      </ul>
    </section>
  )
}
