import type { RoundPhase } from '../../data/types'
import { x } from '../../lib/format'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The altitude: the number the whole product is about. White with a
 * cyan glow while climbing, gold and burning from 2.5x, red under the
 * open or once the flight is lost. Keyed on the phase only, never the
 * value, so the landing animation is not restarted every 50ms.
 * ------------------------------------------------------------------ */

export function Altitude({ phase, currentX, payoutX }: { phase: RoundPhase; currentX: number; payoutX: number | null }) {
  const called = phase === 'called'
  const tone = called || currentX < 1
    ? 'text-down [text-shadow:0_0_30px_rgb(255_77_109/0.6)]'
    : currentX >= 2.5
      ? 'text-gold [text-shadow:0_0_30px_rgb(255_207_90/0.7),0_0_90px_rgb(255_122_26/0.5)]'
      : 'text-white [text-shadow:0_0_30px_rgb(79_240_255/0.5),0_0_80px_rgb(79_240_255/0.25)]'

  return (
    <div className="pointer-events-none text-center">
      <div className="label tracking-[0.3em]">Altitude</div>
      <div key={phase} className={cx('anim-pop display text-alt font-extrabold italic tracking-tight tabular-nums transition-colors duration-300', tone)} aria-hidden="true">
        {currentX.toFixed(2)}
        <span className="text-[0.5em] font-semibold normal-case not-italic text-ink-2">x</span>
      </div>
      <p className="mt-1.5 min-h-[20px] text-sm text-ink-2">
        {called ? null : payoutX !== null ? (
          payoutX >= 1
            ? <>You are up <span className="num text-up">{x(payoutX)}</span> since boarding. Eject any time.</>
            : <>Down <span className="num text-down">{x(payoutX)}</span> since boarding. Hold or bail?</>
        ) : (
          <>Board now, <span className="num text-ink">{x(currentX)}</span> becomes your 1.00x.</>
        )}
      </p>
      <p className="sr-only" aria-live="polite">
        {called ? `Margin called at ${x(currentX)}.` : `Round live at ${x(currentX)}.`}
      </p>
    </div>
  )
}
