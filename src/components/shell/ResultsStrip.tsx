import { RESULTS } from '../../data/sample'
import { BAND_LABEL, bandOf, x, type ResultBand } from '../../lib/format'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The results strip.
 *
 * If you only keep one thing from this design, keep this. In a crash
 * game the row of past multiples is the most-read element on the page —
 * players treat it exactly like the board above a roulette wheel and
 * check it before every single round. The previous build had this data
 * buried three clicks away inside a history table, which is the single
 * biggest reason the old interface felt like a spreadsheet.
 *
 * The band colour is enrichment, never the carrier: the multiple itself
 * is printed on every pill, so nothing here is communicated by colour
 * alone. The band is also named in the accessible label.
 * ------------------------------------------------------------------ */

const BAND: Record<ResultBand, string> = {
  dust: 'border-rim bg-panel text-ink-2',
  ok: 'border-up-deep/40 bg-up-wash text-up',
  big: 'border-gold-deep/45 bg-gold-wash text-gold',
  monster: 'border-live-deep/55 bg-live-wash text-live',
}

export function ResultsStrip({ liveX, phase }: { liveX: number; phase: string }) {
  return (
    <div className="border-b border-rim bg-void/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1560px] items-center gap-3 px-3 sm:px-5">
        <span className="eyebrow hidden shrink-0 text-ink-3 lg:block">Last rounds</span>

        <ul className="rail flex min-w-0 flex-1 items-center gap-1.5 py-2">
          {/* The round in progress. It has no result yet, which is the
           * entire tension of the game, so it is drawn as an outline
           * rather than a filled pill. */}
          <li className="shrink-0">
            <span
              className={cx(
                'nums flex h-8 items-center gap-1.5 rounded-tag border-2 px-2.5 text-xs font-extrabold',
                phase === 'called'
                  ? 'border-down bg-down-wash text-down'
                  : 'border-gold bg-transparent text-gold',
              )}
            >
              <span
                className={cx(
                  'size-1.5 rounded-chip',
                  phase === 'called' ? 'bg-down' : 'anim-pulse bg-gold',
                )}
                aria-hidden="true"
              />
              {phase === 'intermission' ? 'next up' : x(liveX)}
            </span>
          </li>

          <li aria-hidden="true" className="h-5 w-px shrink-0 bg-rim" />

          {RESULTS.map((r) => {
            const band = bandOf(r.ruggedAtX)
            return (
              <li key={r.roundId} className="shrink-0">
                {/* `relative` is load-bearing. Tailwind's sr-only is
                 * position:absolute, so without a positioned parent
                 * these labels resolve against the sticky wrapper
                 * outside the rail, land at their static x — 900px into
                 * the scrolled content — and stretch the document
                 * sideways. Nothing looks wrong; the page just scrolls
                 * horizontally on every phone. */}
                <span
                  className={cx(
                    'nums relative flex h-8 items-center rounded-tag border px-2.5 text-xs font-bold',
                    BAND[band],
                  )}
                >
                  {x(r.ruggedAtX)}
                  <span className="sr-only">{` — round ${r.roundId}, ${r.ticker}, ${BAND_LABEL[band]}`}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
