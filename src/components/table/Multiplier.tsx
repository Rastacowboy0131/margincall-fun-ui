import type { RoundPhase } from '../../data/types'
import { x } from '../../lib/format'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * The number the whole product is about.
 *
 * It is the single most important thing on the screen, so it is the
 * single most prominent thing on the screen — display scale, the width
 * axis pushed wide so it reads like a machine printed it, and nothing
 * else on the felt is allowed to compete.
 *
 * A key is set on the PHASE so React remounts the element when the
 * round opens, rugs, or resets, which restarts the landing animation
 * at each of those moments. The key must NOT include the live value:
 * the engine ticks currentX every 50ms, and remounting per tick
 * restarts the 420ms slam (which begins at opacity 0, scale 1.45)
 * before it can finish, pinning the number at its invisible first
 * frame for the whole round. Between phase changes the digits update
 * in place; tabular-nums on .reel-face keeps the width stable so the
 * ticking reads as a machine counter, not a flicker.
 *
 * Accessibility: the digits themselves are hidden from screen readers,
 * because a value that changes every second and a live region are a
 * terrible pairing. The live region below announces the PHASE only —
 * round opened, round called, next round — which is the part a person
 * who cannot see the reel actually needs.
 * ------------------------------------------------------------------ */

/* The reel never gets wider than the column it sits in.
 *
 * --text-reel is the viewport-driven size that every screen already
 * looked right at; 34cqi is a ceiling measured against the number's own
 * column, which narrows when the printed ticket sits beside it on the
 * felt. min() means the ceiling only ever binds when the column is
 * genuinely tight, so no size that already looked good changes. */
const REEL_SIZE = 'min(var(--text-reel), 22cqi)'

export function Multiplier({
  phase,
  currentX,
  opensInSec,
  payoutX,
}: {
  phase: RoundPhase
  currentX: number
  opensInSec: number
  /** The viewer's payout multiple, when they are holding. */
  payoutX: number | null
}) {
  const losing = currentX < 1
  const tone =
    phase === 'called'
      ? 'text-down'
      : phase === 'intermission'
        ? 'text-gold'
        : losing
          ? 'text-down'
          : 'text-up'

  const glow =
    phase === 'called' || losing
      ? '0 0 34px rgb(255 77 94 / 0.5), 0 0 90px rgb(255 77 94 / 0.28)'
      : phase === 'intermission'
        ? '0 0 30px rgb(255 194 71 / 0.4), 0 0 80px rgb(255 194 71 / 0.2)'
        : '0 0 34px rgb(63 245 142 / 0.45), 0 0 96px rgb(63 245 142 / 0.24)'

  const announcement =
    phase === 'called'
      ? `Margin called at ${x(currentX)}.`
      : phase === 'intermission'
        ? `Next round opens in ${opensInSec} seconds.`
        : `Round live at ${x(currentX)}.`

  return (
    <div className="relative flex flex-col items-center">
      {/* A scrim under the digits. The felt carries candles behind this
       * number and a large figure still needs 3:1 against whatever it
       * lands on; this guarantees it without dimming the chart. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[230%] w-[190%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(closest-side, rgb(16 10 22 / 0.82) 0%, rgb(16 10 22 / 0.66) 34%, rgb(16 10 22 / 0.3) 62%, transparent 100%)',
        }}
      />

      {phase === 'called' && (
        <span
          className="anim-stamp mb-1 rounded-tag border-[3px] border-down px-3 py-1 font-sign text-lg tracking-tight text-down sm:text-2xl"
          style={{ boxShadow: '0 0 30px rgb(255 77 94 / 0.35)' }}
        >
          MARGIN CALLED
        </span>
      )}

      {phase === 'intermission' ? (
        <div className="flex flex-col items-center">
          <span className="eyebrow text-ink-3">Next position opens in</span>
          <span
            key={opensInSec}
            className={cx('anim-slam reel-face text-reel', tone)}
            style={{ textShadow: glow, fontSize: REEL_SIZE }}
            aria-hidden="true"
          >
            {opensInSec}
          </span>
        </div>
      ) : (
        <span
          key={phase}
          className={cx('anim-slam reel-face text-reel', tone)}
          style={{ textShadow: glow, fontSize: REEL_SIZE }}
          aria-hidden="true"
        >
          {currentX.toFixed(2)}
          <span className="text-[0.46em] font-black">x</span>
        </span>
      )}

      <p className="mt-0.5 min-h-[18px] text-center text-xs font-semibold text-ink-2 sm:text-[13px]">
        {phase === 'called' ? (
          <>
            Rugged at <span className="nums font-extrabold text-down">{x(currentX)}</span>. Anyone
            still holding lost the position.
          </>
        ) : phase === 'intermission' ? (
          <>Queue a buy now and you fill at the 1.00x open.</>
        ) : payoutX !== null ? (
          payoutX >= 1 ? (
            <>
              You are up{' '}
              <span className="nums font-extrabold text-up">{x(payoutX)}</span> on your entry
            </>
          ) : (
            <>
              You are down{' '}
              <span className="nums font-extrabold text-down">{x(payoutX)}</span> on your entry
            </>
          )
        ) : (
          <>
            No position. Buy at <span className="nums font-extrabold text-ink">{x(currentX)}</span>{' '}
            and this becomes your 1.00x.
          </>
        )}
      </p>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
