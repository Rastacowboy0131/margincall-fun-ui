import type { Candle } from '../../data/types'
import { x } from '../../lib/format'
import { cx } from '../../lib/cx'
import { ceilingFor, floorFor } from './trace-scale'

/* ------------------------------------------------------------------ *
 * The round's price path, live.
 *
 * CANDLES, not a smoothed line — a trader reads open and close bodies
 * at a glance, and the how-it-works band promises "up candles, down
 * candles, dips, pumps — not an escalator".
 *
 * Wired to the engine the same way as the margincall-onety build:
 *
 *   Revealed by count. `candles` is the whole known path; `revealCount`
 *   says how much of it has happened. Candles are never re-animated,
 *   the only thing that changes between ticks is one new candle.
 *
 *   Laddered y-scale (trace-scale.ts). Hugging the exact revealed range
 *   made the whole chart slide under the reader; a fixed range left
 *   sub-1.00x rounds off the plot. The axis steps on fixed rungs in
 *   BOTH directions instead, and the sub-1.5 ceiling rungs keep a
 *   0.7x round from wasting the top half of the plot.
 *
 *   Fixed scrolling x-window (Onety, 2026-09-05: no squashing). The
 *   plot shows the LAST N revealed candles at a constant slot width.
 *   Early round grows rightward from the left; once N candles have
 *   printed, old candles scroll off the left edge and the newest one
 *   holds the ~83% position. Slot width derives from N only, never
 *   from the total candle count, so the chart keeps its look no
 *   matter how long the round runs. The y-ladder hugs the VISIBLE
 *   window, so off-screen extremes stop pinning the scale.
 *
 *   The marker. A tag riding the current price on the right edge,
 *   green when the head candle closed up, red when it closed down. It
 *   is HTML rather than SVG text because the viewBox is stretched
 *   (preserveAspectRatio="none") and glyphs inside it would distort.
 *
 * Anchor at 1.00x: the gold baseline is the round's open and every
 * number in the product is a multiple OF it; the ladder keeps it in
 * frame by construction. The viewer's entry is the dashed gold rule.
 *
 * No className prop, deliberately: this root must be `relative` for
 * the labels layered over the SVG, and an earlier version accepting an
 * `absolute` class from its parent collapsed the box to zero height.
 * The caller positions a wrapper instead.
 * ------------------------------------------------------------------ */

const W = 1000
const H = 100

/** Fixed visible candle count. 30 fills the ~82% candle band at the
 * slot size the earlier port used as its floor; the window scrolls
 * left once the round prints more than this. */
const VISIBLE_N = 30

export function CandleTape({
  candles,
  revealCount,
  entryX,
  currentX,
  called,
}: {
  /** The round's full candle path, oldest first. */
  candles: Candle[]
  /** How many candles of the path have happened yet. */
  revealCount?: number
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

  const n = candles.length
  const shown = Math.max(1, Math.min(n, revealCount ?? n))

  /* Fixed visible window: the last VISIBLE_N revealed candles. */
  const start = Math.max(0, shown - VISIBLE_N)
  const visible = candles.slice(start, shown)

  /* The laddered band, computed over the VISIBLE candles only. See
   * trace-scale.ts: do not replace this with min/max of the visible
   * range, that regression has already been shipped and reported
   * twice. */
  const top = ceilingFor(visible)
  const bottom = floorFor(visible)
  const span = top - bottom

  const yOf = (v: number) => ((top - v) / span) * H
  /** As a percentage from the top — used to place HTML labels over the
   *  SVG, so the type stays crisp instead of being scaled with it. */
  const pctOf = (v: number) => `${((top - v) / span) * 100}%`

  /* x window: constant slot width derived from VISIBLE_N, never from
   * how many candles the round has printed. Candles use only ~82% of
   * the plot: the newest candle tops out around 82-84% of the width,
   * leaving permanent headroom on the right for the live price marker
   * (Onety, 2026-09-05: the head must never touch the right edge). */
  const slot = (W * 0.82) / VISIBLE_N
  const x0 = W * 0.02
  const bodyW = Math.max(2.5, slot * 0.7)
  const wickW = Math.max(1, slot * 0.12)
  const head = visible[visible.length - 1]
  const headUp = head ? head.closeX >= head.openX : true
  const markerX = currentX

  /* Scale labels sit on the same right-hand edge as the live tag, so
   * any that would land under it are dropped rather than overlapped.
   * The 1.00x line is never dropped. */
  const gridValues = [1, ...[0.25, 0.5, 0.75].map((f) => Number((bottom + span * f).toFixed(2)))]
    .filter((v, i, a) => v > bottom && v < top && a.indexOf(v) === i)
    .filter((v) => v === 1 || Math.abs(v - markerX) / span > 0.14)
    .sort((a, b) => b - a)

  const markerVisible = markerX > bottom && markerX < top

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

        {visible.map((c, i) => {
          const up = c.closeX >= c.openX
          const fill = up ? 'var(--color-up)' : 'var(--color-down)'
          const cx0 = x0 + i * slot + slot / 2
          const bodyTop = yOf(Math.max(c.openX, c.closeX))
          const bodyBottom = yOf(Math.min(c.openX, c.closeX))
          return (
            <g key={start + i} opacity={called ? 0.55 : i === visible.length - 1 ? 1 : 0.85}>
              <rect
                x={cx0 - wickW / 2}
                y={yOf(c.highX)}
                width={wickW}
                height={Math.max(0.4, yOf(c.lowX) - yOf(c.highX))}
                fill={fill}
                opacity="0.65"
              />
              <rect
                x={cx0 - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={Math.max(0.9, bodyBottom - bodyTop)}
                fill={fill}
              />
            </g>
          )
        })}

        {/* the live edge: a rule running out from the last close to the
            marker sitting at the end of it */}
        {head && !called && (
          <rect
            x={x0 + (visible.length - 1) * slot + slot / 2}
            y={yOf(head.closeX)}
            width={Math.max(0, W - (x0 + (visible.length - 1) * slot + slot / 2))}
            height="0.3"
            fill={headUp ? 'var(--color-up)' : 'var(--color-down)'}
            opacity="0.4"
          />
        )}

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

        {markerVisible && (
          <span
            className={cx(
              'nums absolute right-1 -translate-y-1/2 rounded-tag px-1.5 py-0.5 text-[10px] font-extrabold',
              called || !headUp ? 'bg-down text-void' : 'bg-up text-void',
            )}
            style={{ top: pctOf(markerX), zIndex: 1 }}
          >
            {x(markerX)}
          </span>
        )}
      </div>
    </div>
  )
}
