import { useRef } from 'react'
import type { Candle, RoundPhase } from '../../data/types'
import { x } from '../../lib/format'
import { cx } from '../../lib/cx'
import { ceilingFor, floorFor } from './trace-scale'

/* ------------------------------------------------------------------ *
 * The round's price path, live, as candles.
 *
 * Completed candles come from the engine pre-built. The HEAD candle is
 * built here from the ticks seen so far in its period: open is the
 * previous close, high and low are the extremes so far, close is the
 * current price. That is what makes the price tag sit exactly on the
 * candle it belongs to; a pre-built head would already show where the
 * price is going to be.
 *
 * Laddered y-scale (trace-scale.ts), fixed scrolling x-window of the
 * last VISIBLE_N candles at a constant slot width. Labels are HTML over
 * the SVG so type is never stretched by preserveAspectRatio="none".
 * ------------------------------------------------------------------ */

const W = 1000
const H = 100
const VISIBLE_N = 30
const RIGHT_GUTTER = 0.86 // candles use this share of the width; the rest is headroom for the tag

export function CandleTape({ candles, revealCount, entryX, currentX, phase, elapsedSec = 0 }: {
  candles: Candle[]
  revealCount?: number
  entryX: number | null
  currentX: number
  phase: RoundPhase
  elapsedSec?: number
}) {
  const called = phase === 'called', live = phase === 'live'

  /* ticks inside the current head candle */
  const headIdx = useRef(-1)
  const ticks = useRef<number[]>([])

  const n = candles.length
  const shown = Math.max(1, Math.min(n, revealCount ?? n))
  const idx = shown - 1

  if (live) {
    if (headIdx.current !== idx) { headIdx.current = idx; ticks.current = [currentX] }
    else if (ticks.current[ticks.current.length - 1] !== currentX) ticks.current.push(currentX)
  } else {
    headIdx.current = -1
  }

  if (n === 0) {
    return (
      <div className="relative size-full" aria-hidden="true">
        <span className="absolute inset-x-0 bottom-8 border-t border-dashed border-line-2" />
        <span className="num absolute right-0 bottom-8 -translate-y-1/2 text-[10px] text-ink-3">1.00x</span>
      </div>
    )
  }

  const done = candles.slice(0, live ? idx : shown)
  const head: Candle | null = live
    ? (() => {
        const open = idx > 0 ? candles[idx - 1].closeX : 1
        const t = ticks.current.length ? ticks.current : [currentX]
        return { openX: open, highX: Math.max(open, ...t), lowX: Math.min(open, ...t), closeX: currentX }
      })()
    : null
  const all = head ? [...done, head] : done
  const start = Math.max(0, all.length - VISIBLE_N)
  const visible = all.slice(start)

  const top = ceilingFor(visible)
  const bottom = floorFor(visible)
  const span = top - bottom
  const yOf = (v: number) => ((top - v) / span) * H
  const pctY = (v: number) => `${((top - v) / span) * 100}%`

  const slot = (W * RIGHT_GUTTER) / VISIBLE_N
  const x0 = W * 0.015
  const bodyW = slot * 0.62
  const wickW = Math.max(1.4, slot * 0.09)
  const li = visible.length - 1
  const headCx = x0 + li * slot + slot / 2
  const last = visible[li]
  const lastUp = last.closeX >= last.openX
  const price = live ? currentX : last.closeX
  const priceVisible = price > bottom && price < top && !(phase === 'intermission')

  const gridValues = [1, ...[0.25, 0.5, 0.75].map((f) => Number((bottom + span * f).toFixed(2)))]
    .filter((v, i, a) => v > bottom && v < top && a.indexOf(v) === i)
    .filter((v) => v === 1 || !priceVisible || Math.abs(v - price) / span > 0.1)
    .sort((a, b) => b - a)

  return (
    <div className="relative size-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
        {gridValues.map((v) => (
          <rect key={v} x="0" y={yOf(v)} width={W} height="0.22" fill={v === 1 ? 'var(--color-ink-3)' : 'var(--color-line-2)'} opacity={v === 1 ? 0.9 : 0.7} />
        ))}

        {visible.map((c, i) => {
          const up = c.closeX >= c.openX
          const fill = up ? 'var(--color-lime)' : 'var(--color-down)'
          const cx0 = x0 + i * slot + slot / 2
          const bodyTop = yOf(Math.max(c.openX, c.closeX))
          const bodyBottom = yOf(Math.min(c.openX, c.closeX))
          return (
            <g key={start + i} opacity={called ? 0.55 : 1}>
              <rect x={cx0 - wickW / 2} y={yOf(c.highX)} width={wickW} height={Math.max(0.3, yOf(c.lowX) - yOf(c.highX))} fill={fill} opacity="0.85" />
              <rect x={cx0 - bodyW / 2} y={bodyTop} width={bodyW} height={Math.max(1.1, bodyBottom - bodyTop)} fill={fill} />
            </g>
          )
        })}

        {/* last price line, from the head to the axis */}
        {priceVisible && (
          <line x1={headCx + bodyW / 2} y1={yOf(price)} x2={W} y2={yOf(price)} stroke={called || !lastUp ? 'var(--color-down)' : 'var(--color-lime)'} strokeWidth="0.25" strokeDasharray="1.2 1.2" opacity="0.7" />
        )}

        {entryX !== null && entryX > bottom && entryX < top && (
          <rect x="0" y={yOf(entryX)} width={W} height="0.28" fill="var(--color-amber)" opacity="0.9" />
        )}
      </svg>

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {gridValues.map((v) => (
          <span key={v} className={cx('num absolute right-0 -translate-y-1/2 text-[10px]', v === 1 ? 'text-ink-2' : 'text-ink-3')} style={{ top: pctY(v) }}>{x(v)}</span>
        ))}

        {[0.2, 0.5, 0.8].map((f) => {
          const secAgo = Math.round((1 - f) * (VISIBLE_N * 0.35))
          const t = Math.max(0, elapsedSec - secAgo)
          return (
            <span key={f} className="num absolute bottom-0 -translate-x-1/2 text-[10px] text-ink-3" style={{ left: `${(x0 / W) * 100 + f * RIGHT_GUTTER * 100}%` }}>
              {Math.floor(t / 60)}:{String(Math.floor(t % 60)).padStart(2, '0')}
            </span>
          )
        })}

        {entryX !== null && entryX > bottom && entryX < top && (
          <span className="num absolute left-0 -translate-y-1/2 rounded-[4px] bg-amber px-1.5 py-0.5 text-[10px] font-bold text-bg" style={{ top: pctY(entryX) }}>entry {x(entryX)}</span>
        )}

        {/* the price tag, hanging off the head candle */}
        {priceVisible && (
          <span
            className={cx('num absolute -translate-y-1/2 rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold text-bg transition-[top,left] duration-100 ease-linear', called || !lastUp ? 'bg-down' : 'bg-lime')}
            style={{ top: pctY(price), left: `calc(${((headCx + bodyW / 2) / W) * 100}% + 6px)`, zIndex: 1 }}
          >
            {x(price)}
          </span>
        )}
      </div>
    </div>
  )
}
