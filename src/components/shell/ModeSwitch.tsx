import type { Wallet } from '../../data/types'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * PAPER | LIVE.
 *
 * The most consequential piece of state in the whole product: whether
 * the number you are about to stake is imaginary or is real ETH. So it
 * is a switch in the header at every width, not a badge, and not
 * something you have to open a sheet to find.
 *
 * Tapping the side you are not on is the entry to the wallet flow —
 * LIVE opens the connect sheet, and from live, PAPER drops you back to
 * the demo desk. The side you are already on is inert and says so with
 * aria-pressed.
 *
 * Nora: `onGoLive` is the connector seam and `onGoPaper` is the
 * teardown. The component never holds the mode itself — it renders
 * whatever `mode` it is handed.
 * ------------------------------------------------------------------ */

export function ModeSwitch({
  mode,
  onGoLive,
  onGoPaper,
}: {
  mode: Wallet['mode']
  onGoLive: () => void
  onGoPaper: () => void
}) {
  const live = mode === 'live'

  return (
    <div
      role="group"
      aria-label="Trading mode"
      className="flex shrink-0 overflow-hidden rounded-key border border-rim bg-void"
    >
      <button
        type="button"
        aria-pressed={!live}
        onClick={live ? onGoPaper : undefined}
        className={cx(
          'key-3d relative flex min-h-[46px] items-center px-2.5 text-[10px] font-extrabold tracking-widest sm:px-3 sm:text-micro',
          !live
            ? 'bg-gold text-void [--key-depth:0px]'
            : 'text-ink-3 hover:text-ink [--key-depth:0px]',
        )}
      >
        PAPER
        {live && <span className="sr-only"> — go back to the demo desk</span>}
      </button>

      <span aria-hidden="true" className="w-px bg-rim" />

      <button
        type="button"
        aria-pressed={live}
        onClick={live ? undefined : onGoLive}
        className={cx(
          'key-3d relative flex min-h-[46px] items-center gap-1.5 px-2.5 text-[10px] font-extrabold tracking-widest sm:px-3 sm:text-micro',
          live
            ? 'bg-gold text-void [--key-depth:0px]'
            : 'text-ink-3 hover:text-ink [--key-depth:0px]',
        )}
      >
        {/* Only drawn when live money is actually at stake. */}
        {live && <span aria-hidden="true" className="anim-pulse size-1.5 rounded-chip bg-up" />}
        LIVE
        {!live && <span className="sr-only"> — connect a wallet and trade real ETH</span>}
      </button>
    </div>
  )
}
