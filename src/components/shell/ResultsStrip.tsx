import type { Result } from '../../data/types'
import { BAND_LABEL, bandOf, x, type ResultBand } from '../../lib/format'
import { useFlip } from '../../lib/useFlip'
import { cx } from '../../lib/cx'

/* The flight log: where the last flights were lost. The most-read
 * element on the page. A new result lands at the front and the rest
 * slide one slot right. */

const BAND: Record<ResultBand, string> = {
  dust: 'border-line text-ink-3',
  ok: 'border-up/40 text-up',
  big: 'border-gold text-gold shadow-[0_0_14px_rgb(255_207_90/0.3)]',
  monster: 'border-gold bg-gold font-medium text-bg shadow-[0_0_22px_rgb(255_207_90/0.6)]',
}

export function ResultsStrip({ liveX, phase, opensInSec, results }: { liveX: number; phase: string; opensInSec: number; results: Result[] }) {
  const ref = useFlip<HTMLUListElement>(results[0]?.roundId ?? -1)
  const live = phase === 'live'
  const called = phase === 'called'
  return (
    <div className="border-b border-line bg-bg/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 sm:px-6">
        <span className="label hidden shrink-0 lg:block">Flight log</span>
        <ul ref={ref} className="rail flex min-w-0 flex-1 items-center gap-2 py-2.5">
          <li className="shrink-0">
            <span key={phase} className={cx('anim-pop num flex h-7 items-center rounded-pill border px-2.5 text-xs', called ? 'border-down text-down' : live ? (liveX < 1 ? 'border-down/60 text-down' : 'border-cyan text-cyan') : 'border-line-2 text-ink-2')}>
              {phase === 'intermission' ? `T-${opensInSec}` : x(liveX)}
            </span>
          </li>
          <li aria-hidden="true" className="h-4 w-px shrink-0 bg-line-2" />
          {results.map((r) => {
            const band = bandOf(r.ruggedAtX)
            return (
              <li key={r.roundId} data-flip={r.roundId} className="shrink-0">
                <span className={cx('num relative flex h-7 items-center rounded-pill border px-2.5 text-xs', BAND[band])}>
                  {x(r.ruggedAtX)}
                  <span className="sr-only">{`, flight ${r.roundId}, ${r.ticker}, ${BAND_LABEL[band]}`}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
