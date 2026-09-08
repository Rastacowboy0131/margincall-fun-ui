import { useEffect, useRef } from 'react'
import type { RoundPhase } from '../../data/types'
import { x as fmt } from '../../lib/format'

/* ------------------------------------------------------------------ *
 * The sky and the flight.
 *
 * One canvas, one requestAnimationFrame loop, reading the latest
 * round state out of a ref so React re-renders never touch the frame
 * budget. It draws, back to front:
 *
 *   the star field, streaking faster the higher the multiple climbs
 *   the 1.00x line (the launch pad) and your boarding line
 *   the exhaust trail: three passes of the path, wide flame to thin cyan
 *   exhaust particles peeling off the head while the round is live
 *   the rocket, rotated along the tangent of the last few ticks
 *   the altitude tag beside it
 *
 * When the round is called the rocket is replaced by a burst of 80
 * particles and the stars stop. Between rounds the path is empty and
 * the rocket sits on the pad.
 *
 * The path is the tick-by-tick multiple accumulated here from the
 * engine's currentX, reset whenever the round changes. Under reduced
 * motion the stars hold still and no particles are spawned.
 * ------------------------------------------------------------------ */

const N = 240

interface Frame {
  phase: RoundPhase
  currentX: number
  entryX: number | null
}

interface Particle { x: number; y: number; vx: number; vy: number; life: number; c: string }

export function FlightPath({ phase, currentX, roundId, entryX }: { phase: RoundPhase; currentX: number; roundId: number; entryX: number | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frame = useRef<Frame>({ phase, currentX, entryX })
  const path = useRef<number[]>([])
  const particles = useRef<Particle[]>([])
  /* Lazily seeded: `useRef(expr)` evaluates its argument on EVERY render
   * and throws the result away after the first. Play re-renders every
   * 50ms tick, so the inline form was rolling 480 Math.random() per
   * second and discarding all of them. Seed once on first frame. */
  const stars = useRef<{ x: number; y: number; z: number }[]>(null!)
  if (stars.current === null) {
    stars.current = Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2 }))
  }
  const lastPhase = useRef<RoundPhase | null>(null)
  const boomAt = useRef<{ x: number; y: number } | null>(null)

  /* accumulate the path, reset per round, spawn the explosion once */
  useEffect(() => {
    frame.current = { phase, currentX, entryX }
    if (phase === 'intermission') path.current = []
    else if (phase === 'live') {
      if (lastPhase.current !== 'live') path.current = []
      path.current.push(currentX)
    }
    if (phase === 'called' && lastPhase.current !== 'called') boomAt.current = { x: -1, y: -1 }
    lastPhase.current = phase
  }, [phase, currentX, roundId, entryX])

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0

    /* The rocket is an image (public/rocket.svg, drawn pointing up) so
     * it can carry real shading. It is rotated onto the path's tangent
     * here; the flame is drawn on the canvas behind its nozzle so it
     * can flicker. */
    const img = new Image()
    img.src = '/rocket.svg'
    const RW = 48, RH = 54
    const rocket = (x: number, y: number, ang: number, flame: boolean) => {
      const t = performance.now() / 60
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang)
      if (flame) {
        const f = 12 + Math.sin(t) * 4 + Math.random() * 4
        ctx.fillStyle = '#ff7a1a'
        ctx.beginPath(); ctx.moveTo(-RH / 2 + 6, -5); ctx.lineTo(-RH / 2 - f - 4, 0); ctx.lineTo(-RH / 2 + 6, 5); ctx.closePath(); ctx.fill()
        ctx.fillStyle = '#ffcf5a'
        ctx.beginPath(); ctx.moveTo(-RH / 2 + 6, -2.5); ctx.lineTo(-RH / 2 - f * 0.55, 0); ctx.lineTo(-RH / 2 + 6, 2.5); ctx.closePath(); ctx.fill()
      }
      ctx.rotate(Math.PI / 2)
      if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, -RW / 2, -RH / 2, RW, RH)
      ctx.restore()
    }

    const draw = () => {
      raf = requestAnimationFrame(draw)
      const dpr = window.devicePixelRatio || 1
      const w = cv.clientWidth, h = cv.clientHeight
      if (w === 0 || h === 0) return
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr) }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const f = frame.current
      const live = f.phase === 'live', called = f.phase === 'called'

      /* stars */
      const speed = reduce ? 0 : live ? Math.max(0.3, f.currentX - 0.8) * 2.2 : called ? 0 : 0.3
      for (const s of stars.current) {
        s.y += speed * s.z * 0.004
        if (s.y > 1) { s.y = 0; s.x = Math.random() }
        ctx.fillStyle = `rgba(255,255,255,${0.25 + s.z * 0.6})`
        ctx.fillRect(s.x * w, s.y * h, 1.2 + s.z, 1 + speed * s.z * 6)
      }

      const vis = path.current.slice(-N)
      const top0 = h < 480 ? 256 : Math.min(240, h * 0.42), bot = h - 40, left = 40, right = w - 110
      ctx.font = '600 12px "Barlow", sans-serif'

      if (vis.length < 2) {
        ctx.setLineDash([4, 8]); ctx.strokeStyle = 'rgba(79,240,255,.3)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(left, bot); ctx.lineTo(right, bot); ctx.stroke(); ctx.setLineDash([])
        ctx.fillStyle = 'rgba(154,166,208,.6)'; ctx.fillText('LAUNCH PAD  1.00x', left + 40, bot - 12)
        if (!called) rocket(left + 14, bot - 28, -Math.PI / 2, false)
        return
      }

      let hi = Math.max(1, ...vis), lo = Math.min(1, ...vis)
      const pad = (hi - lo) * 0.2 + 0.03; hi += pad; lo -= pad
      const yOf = (v: number) => bot - ((v - lo) / (hi - lo)) * (bot - top0)
      const xOf = (i: number) => left + (i / (N - 1)) * (right - left)

      ctx.setLineDash([4, 8]); ctx.strokeStyle = 'rgba(154,166,208,.35)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, yOf(1)); ctx.lineTo(w, yOf(1)); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle = 'rgba(154,166,208,.7)'; ctx.fillText('1.00x', w - 60, yOf(1) - 6)

      if (f.entryX !== null) {
        ctx.setLineDash([2, 6]); ctx.strokeStyle = 'rgba(255,207,90,.8)'
        ctx.beginPath(); ctx.moveTo(0, yOf(f.entryX)); ctx.lineTo(w, yOf(f.entryX)); ctx.stroke(); ctx.setLineDash([])
        ctx.fillStyle = '#ffcf5a'; ctx.fillText('YOU BOARDED ' + fmt(f.entryX), 40, yOf(f.entryX) - 6)
      }

      const last = vis[vis.length - 1], up = last >= 1
      const col = called ? '#ff4d6d' : up ? '#4ff0ff' : '#ff4d6d'
      const trace = () => { ctx.beginPath(); vis.forEach((v, i) => (i ? ctx.lineTo(xOf(i), yOf(v)) : ctx.moveTo(xOf(i), yOf(v)))) }
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'
      trace(); ctx.strokeStyle = 'rgba(255,122,26,.18)'; ctx.lineWidth = 16; ctx.stroke()
      trace(); ctx.strokeStyle = 'rgba(255,207,90,.35)'; ctx.lineWidth = 7; ctx.stroke()
      trace(); ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke(); ctx.shadowBlur = 0

      const li = vis.length - 1, pi = Math.max(0, li - 4)
      const lx = xOf(li), hy = yOf(last)
      const ang = Math.atan2(yOf(last) - yOf(vis[pi]), xOf(li) - xOf(pi))

      if (!reduce) {
        if (live) for (let i = 0; i < 3; i++) particles.current.push({ x: lx, y: hy, vx: -Math.cos(ang) * (2 + Math.random() * 2) + (Math.random() - 0.5), vy: -Math.sin(ang) * (2 + Math.random() * 2) + (Math.random() - 0.5), life: 1, c: Math.random() < 0.5 ? '#ff7a1a' : '#ffcf5a' })
        if (boomAt.current) {
          boomAt.current = null
          for (let i = 0; i < 90; i++) { const a = Math.random() * 7, sp = 2 + Math.random() * 6; particles.current.push({ x: lx, y: hy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, c: ['#ff7a1a', '#ff4d6d', '#fff', '#ffcf5a'][i % 4] }) }
        }
      }
      particles.current = particles.current.filter((p) => p.life > 0)
      for (const p of particles.current) { p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= 0.03; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 3, 3) }
      ctx.globalAlpha = 1

      if (!called) rocket(lx, hy, ang, live)
      ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(lx + 32, hy - 12, 60, 24, 6); ctx.fill()
      ctx.fillStyle = '#05070f'; ctx.font = '700 13px "Barlow", sans-serif'; ctx.fillText(fmt(last), lx + 39, hy + 4)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />
}
