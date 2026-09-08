import type { Result } from '../../data/types'
import { BAND_LABEL, bandOf, x, type ResultBand } from '../../lib/format'
import { useFlip } from '../../lib/useFlip'
import { cx } from '../../lib/cx'

/* Last rounds: the board above the roulette wheel. New results land at
 * the front; older ones slide one slot right. */

const BAND: Record<ResultBand, string> = {
  dust: 'border-line text-ink-3',
  ok: 'border-lime/40 text-lime',
  big: 'border-amber text-amber',
  monster: 'border-lime bg-lime font-bold text-bg',
}

export function ResultsStrip({ liveX, phase, opensInSec, results }: { liveX: number; phase: string; opensInSec: number; results: Result[] }) {
  const ref = useFlip<HTMLUListElement>(results[0]?.roundId ?? -1)
  const live = phase === 'live', called = phase === 'called'
  return (
    <div className="border-b border-line bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1560px] items-center gap-3 px-4 sm:px-6">
        <span className="label hidden shrink-0 lg:block">Last rounds</span>
        <ul ref={ref} className="rail flex min-w-0 flex-1 items-center gap-1.5 py-2">
          <li className="shrink-0">
            <span key={phase} className={cx('anim-pop num flex h-7 items-center gap-1.5 rounded-[6px] border px-2 text-xs font-bold', called ? 'border-down bg-down-wash text-down' : live ? (liveX < 1 ? 'border-down/60 text-down' : 'border-lime text-lime') : 'border-amber/60 text-amber')}>
              <span aria-hidden="true" className={cx('size-1.5 rounded-pill bg-current', live && 'anim-pulse')} />
              {phase === 'intermission' ? `opens ${opensInSec}s` : x(liveX)}
            </span>
          </li>
          <li aria-hidden="true" className="h-4 w-px shrink-0 bg-line-2" />
          {results.map((r) => {
            const band = bandOf(r.ruggedAtX)
            return (
              <li key={r.roundId} data-flip={r.roundId} className="shrink-0">
                <span className={cx('num relative flex h-7 items-center rounded-[6px] border px-2 text-xs font-semibold', BAND[band])}>
                  {x(r.ruggedAtX)}<span className="sr-only">{`, round ${r.roundId}, ${r.ticker}, ${BAND_LABEL[band]}`}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
