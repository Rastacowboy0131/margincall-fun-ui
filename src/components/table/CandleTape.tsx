import type { Candle } from '../../data/types'
import { x } from '../../lib/format'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The round's price path.
 *
 * THIS IS A DRAWING, NOT A CHART LIBRARY. It takes the fixed sample
 * path out of sample.ts and lays rectangles out over it so the stage
 * holds the right space, at the right density, with the right shapes.
 * There is no scale, no axis engine, no interaction model and no data
 * layer here, and there should not be.
 *
 * Nora — what the real one has to be, and why:
 *
 *   CANDLES, not a smoothed line. This is the single detail that makes
 *   the product read as a trading terminal rather than as Aviator with
 *   a new skin: a trader reads the open and the close bodies at a
 *   glance and can see a wick that got bought back. A curve throws that
 *   away. The copy on the how-it-works band promises "up candles, down
 *   candles, dips, pumps — not an escalator", and this is where that
 *   promise is either kept or broken.
 *
 *   Anchor at 1.00x. The dashed baseline is the round's open and every
 *   number in the product is a multiple OF it, so it must always be in
 *   frame even when the path runs to 20x.
 *
 *   Draw the viewer's entry. The dashed gold line is the difference
 *   between "the round is at 6.84x" and "you are up 2.62x", which is
 *   the one thing new players get wrong.
 *
 *   The domain rule this must not break: green is a candle that closed
 *   above its open, red is one that closed below. It is never the
 *   direction of the round overall, and never the viewer's P&L.
 * ------------------------------------------------------------------ */

/*
 * No className prop, deliberately. This component's root has to be
 * `relative` for the labels layered over the SVG, and an earlier
 * version also accepted an `absolute …` class from its parent. Both
 * utilities matched, `.relative` is emitted later in Tailwind's output
 * so it won, the box collapsed to zero height, and the entire chart
 * silently vanished — with nothing wrong in the source. The caller
 * positions a wrapper around this instead.
 */
export function CandleTape({
  candles,
  entryX,
  currentX,
  called,
}: {
  candles: Candle[]
  /** The viewer's entry, drawn as a dashed line. Null when flat. */
  entryX: number | null
  currentX: number
  called: boolean
}) {
  if (candles.length === 0) {
    return (
      <div className="relative size-full" aria-hidden="true">
        <span className="absolute inset-x-0 bottom-8 border-t-2 border-dashed border-rim-hi" />
        <span className="nums absolute right-1 bottom-8 -translate-y-1/2 text-[10px] font-semibold text-gold/80">
          1.00x
        </span>
      </div>
    )
  }

  // The visible range always contains 1.00x, the whole path, and a
  // little headroom so the newest candle is never flush with the frame.
  const lo = Math.min(1, ...candles.map((c) => c.lowX))
  const hi = Math.max(1, ...candles.map((c) => c.highX))
  const pad = (hi - lo) * 0.14 || 0.2
  const top = hi + pad
  const bottom = Math.max(0, lo - pad * 0.5)
  const span = top - bottom

  const W = candles.length * 10
  const H = 100
  const yOf = (v: number) => ((top - v) / span) * H
  /** As a percentage from the top — used to place HTML labels over the
   *  SVG, so the type stays crisp instead of being scaled with it. */
  const pctOf = (v: number) => `${((top - v) / span) * 100}%`

  /* Scale labels sit on the same right-hand edge as the live tag, so any
   * that would land under it are dropped rather than overlapped. The
   * 1.00x line is never dropped — every figure in the product is a
   * multiple of it and it has to stay readable. */
  const gridValues = [1, ...[0.25, 0.5, 0.75].map((f) => Number((bottom + span * f).toFixed(2)))]
    .filter((v, i, a) => v > bottom && v < top && a.indexOf(v) === i)
    .filter((v) => v === 1 || Math.abs(v - currentX) / span > 0.14)
    .sort((a, b) => b - a)

  return (
    <div className="relative size-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        {gridValues.map((v) => (
          <rect
            key={v}
            x="0"
            y={yOf(v)}
            width={W}
            height="0.25"
            fill={v === 1 ? 'var(--color-gold)' : 'var(--color-rim-hi)'}
            opacity={v === 1 ? 0.5 : 0.35}
          />
        ))}

        {candles.map((c, i) => {
          const up = c.closeX >= c.openX
          const fill = up ? 'var(--color-up)' : 'var(--color-down)'
          const bodyTop = yOf(Math.max(c.openX, c.closeX))
          const bodyBottom = yOf(Math.min(c.openX, c.closeX))
          return (
            <g key={i} opacity={called ? 0.55 : 1}>
              <rect
                x={i * 10 + 4.4}
                y={yOf(c.highX)}
                width="1.2"
                height={Math.max(0.4, yOf(c.lowX) - yOf(c.highX))}
                fill={fill}
                opacity="0.65"
              />
              <rect
                x={i * 10 + 1.5}
                y={bodyTop}
                width="7"
                height={Math.max(0.9, bodyBottom - bodyTop)}
                fill={fill}
              />
            </g>
          )
        })}

        {entryX !== null && entryX > bottom && entryX < top && (
          <rect x="0" y={yOf(entryX)} width={W} height="0.3" fill="var(--color-gold)" opacity="0.9" />
        )}
      </svg>

      {/* Scale labels and the live tag sit in HTML over the SVG so the
       * type is never stretched by preserveAspectRatio="none". */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {gridValues.map((v) => (
          <span
            key={v}
            className={cx(
              'nums absolute right-1 -translate-y-1/2 text-[10px] font-semibold',
              v === 1 ? 'text-gold/80' : 'text-ink-3/70',
            )}
            style={{ top: pctOf(v) }}
          >
            {x(v)}
          </span>
        ))}

        {entryX !== null && entryX > bottom && entryX < top && (
          <span
            className="nums absolute left-1 -translate-y-1/2 rounded-tag bg-gold px-1.5 py-0.5 text-[10px] font-extrabold text-void"
            style={{ top: pctOf(entryX) }}
          >
            your entry {x(entryX)}
          </span>
        )}

        <span
          className={cx(
            'nums absolute right-1 -translate-y-1/2 rounded-tag px-1.5 py-0.5 text-[10px] font-extrabold',
            called ? 'bg-down text-void' : 'bg-up text-void',
          )}
          style={{ top: pctOf(currentX), zIndex: 1 }}
        >
          {x(currentX)}
        </span>
      </div>
    </div>
  )
}
