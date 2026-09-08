import { useEffect, useState } from 'react'
import type { Position, Round, RoundPhase } from '../../data/types'
import { AppLink } from '../../app/AppLink'
import { clock, x } from '../../lib/format'
import { FlightPath } from './FlightPath'
import { Altitude } from './Altitude'
import { TickerMark } from '../brand/TickerMark'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * THE SKY. Corner brackets, a HUD row, the altitude at the top and the
 * flight underneath. The launch countdown sits over it between rounds.
 * When the flight is lost the sky jolts once and the explosion flash
 * blooms from the centre. When you eject, EJECTED rises out of it.
 * ------------------------------------------------------------------ */

export function Sky({ round, phase, position, payoutX, ejected }: {
  round: Round
  phase: RoundPhase
  position: Position | null
  payoutX: number | null
  /** Bumps each time you sell, to fire the eject flash. */
  ejected: { n: number; payoutX: number; pnlEth: number } | null
}) {
  const called = phase === 'called'
  const inter = phase === 'intermission'
  const [fx, setFx] = useState<typeof ejected>(null)
  useEffect(() => {
    if (!ejected) return
    setFx(ejected)
    const t = window.setTimeout(() => setFx(null), 1700)
    return () => window.clearTimeout(t)
  }, [ejected])

  return (
    <section
      className={cx(
        'relative isolate min-h-[400px] overflow-hidden rounded-sky border border-line-2 shadow-[0_40px_80px_-30px_#000,inset_0_0_0_1px_rgb(79_240_255/0.06)] sm:min-h-[460px] lg:min-h-[520px]',
        called && 'anim-jolt',
      )}
      style={{ background: 'linear-gradient(180deg, #03040a 0%, #0a0f2b 70%, #17204f 100%)' }}
    >
      <FlightPath phase={phase} currentX={round.currentX} roundId={round.id} entryX={position ? position.entryX : null} />
      <span className="corner corner-tl" /><span className="corner corner-tr" /><span className="corner corner-bl" /><span className="corner corner-br" />

      <div className="absolute inset-x-6 top-6 z-10 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:inset-x-7">
      <header className="flex items-center gap-3">
        <TickerMark ticker={round.ticker} size={34} />
        <div>
          <div className="display text-xl font-bold normal-case text-ink">{round.ticker.symbol} <span className="text-ink-2">{round.leverage}x</span></div>
          <div className="num text-2xs text-ink-3 uppercase">{round.ticker.name} / flight {round.id}</div>
        </div>
      </header>
      <div className="flex items-center gap-2">
        <span className="num rounded-pill border border-line-2 bg-space/60 px-2.5 py-1 text-2xs text-ink-2">
          {phase === 'live' ? `T+${clock(round.elapsedSec)}` : called ? 'LOST' : `T-${round.opensInSec}`}
        </span>
        <span className={cx('num flex items-center gap-1.5 rounded-pill border bg-space/60 px-2.5 py-1 text-2xs', called ? 'border-down text-down' : phase === 'live' ? 'border-cyan text-cyan' : 'border-line-2 text-ink-2')}>
          <span aria-hidden="true" className="anim-blink size-1.5 rounded-pill bg-current" />
          {called ? 'MARGIN CALLED' : phase === 'live' ? 'IN FLIGHT' : 'ON THE PAD'}
        </span>
        <AppLink to="/fair" className="num hidden rounded-pill border border-line-2 bg-space/60 px-2.5 py-1 text-2xs text-ink-2 transition-colors hover:text-ink sm:block">FAIR</AppLink>
      </div>
      </div>

      {inter ? (
        <div className="absolute inset-0 z-10 grid place-items-center text-center">
          <div>
            <div className="label tracking-[0.3em] text-cyan">Launch in</div>
            <div key={round.opensInSec} className="anim-pop display text-[150px] leading-none font-extrabold italic tabular-nums text-white [text-shadow:0_0_40px_rgb(79_240_255/0.6)] sm:text-[150px]" aria-hidden="true">
              {round.opensInSec}
            </div>
            <div className="text-sm text-ink-2">Board now and you lift off at 1.00x</div>
            <p className="sr-only" aria-live="polite">Next round opens in {round.opensInSec} seconds.</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-4 top-[118px] z-10 sm:top-[84px]">
          <Altitude phase={phase} currentX={round.currentX} payoutX={payoutX} />
        </div>
      )}

      {called && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <span className="anim-boom absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, #fff 0%, var(--color-flame) 20%, var(--color-down) 45%, transparent 75%)' }} />
          <div className="absolute inset-x-6 top-[54%] flex flex-col items-center gap-3 text-center sm:top-[52%]">
            <div className="anim-pop display text-[clamp(40px,6vw,72px)] leading-none font-extrabold italic tracking-wide text-white uppercase [animation-delay:250ms] [text-shadow:0_0_30px_var(--color-down)]">Margin called</div>
            <div className="anim-pop num rounded-pill border border-down/60 bg-bg/60 px-3 py-1 text-xs tracking-wider text-down uppercase [animation-delay:400ms]">Flight lost at {x(round.currentX)}</div>
            <p className="anim-pop max-w-[34ch] text-sm text-ink-2 [animation-delay:500ms]">Everyone still aboard went down with it.</p>
          </div>
        </div>
      )}

      {fx && (
        <div key={fx.n} className="anim-ejectfx pointer-events-none absolute top-[38%] left-1/2 z-20 text-center">
          <div className="display text-6xl font-extrabold italic text-up [text-shadow:0_0_30px_rgb(92_255_157/0.7)]">EJECTED</div>
          <div className="num mt-1 text-lg text-white">{x(fx.payoutX)} · {fx.pnlEth >= 0 ? '+' : ''}{fx.pnlEth.toFixed(3)} ETH</div>
        </div>
      )}
    </section>
  )
}
