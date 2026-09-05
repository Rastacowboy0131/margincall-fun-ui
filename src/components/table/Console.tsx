import { useId } from 'react'
import type { RoundPhase } from '../../data/types'
import { AUTO_SELL_STEPS_X, CHAIN, STAKE_CHIPS_ETH } from '../../data/sample'
import { signedEth, x } from '../../lib/format'
import { Chip } from '../ui/Chip'
import { Icon } from '../ui/Icon'
import { Key } from '../ui/Key'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * THE CONSOLE.
 *
 * The structural bet of this whole redesign. Every other leveraged-
 * trading interface puts the order ticket in a right-hand rail, which
 * is the worst possible place for it on a phone and the reason the last
 * build was unusable one-handed. Here the controls are a physical panel
 * bolted to the bottom edge of the table — the same panel at 1440px and
 * at 360px, always under the thumb, never scrolled away from.
 *
 * Three decisions and no more, which is the whole point:
 *
 *   how much   a chip. Tapping one SETS the stake, it does not add to
 *              it — additive stacking would make the console do
 *              arithmetic on a figure the player cares about, and that
 *              is not the front end's arithmetic to do.
 *   which way  two keys, LONG and SHORT, each carrying a word AND an
 *              arrow, never colour alone.
 *   when       pressing one of them.
 *
 * There is deliberately no risk meter here. The previous build had a
 * LOW RISK / HIGH RISK gradient bar with a percentage on it; it has
 * been removed at the client's request and nothing has been smuggled
 * back in to replace it.
 * ------------------------------------------------------------------ */

export function Console({
  phase,
  stakeEth,
  onStake,
  autoSell,
  onAutoSell,
  autoSellAtX,
  onAutoSellAtX,
  sound,
  onSound,
  holding,
  payoutX,
  pnlEth,
  onCashOut,
  cashed,
}: {
  phase: RoundPhase
  stakeEth: number
  onStake: (v: number) => void
  autoSell: boolean
  onAutoSell: (v: boolean) => void
  autoSellAtX: number
  onAutoSellAtX: (v: number) => void
  sound: boolean
  onSound: (v: boolean) => void
  /** True while the viewer has an open position in this round. */
  holding: boolean
  payoutX: number | null
  pnlEth: number | null
  onCashOut: () => void
  cashed: boolean
}) {
  // This panel renders once per page today, but a console that can also
  // appear in a sheet would produce duplicate ids and silently break
  // <label for> on one of them. useId costs nothing and closes it.
  const uid = useId()
  const autoId = `${uid}-auto`

  const queueing = phase === 'intermission'
  const frozen = phase === 'called'
  // Selling does not lock you out of the round — the whole pitch is that
  // you can buy the dip, sell the rip and buy back in. The only thing
  // that stops you acting is the round being over.
  const canAct = !frozen

  return (
    <div className="relative border-t-2 border-rim-hi bg-panel">
      {/* The slot the ticket prints out of. Decorative, but it is what
       * makes the panel read as a machine rather than as a toolbar. */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-1.5 w-28 -translate-x-1/2 -translate-y-1/2 rounded-chip bg-void shadow-[inset_0_2px_2px_rgb(0_0_0/0.9)]"
      />

      {/* Two rows, at every width.
       *
       * The first attempt put stake, leverage and the action keys in one
       * row from lg up. The middle column of the table grid is about
       * 890px at 1512, which left the leverage group barely 100px wide:
       * every key collapsed and its label spilled out across the panel.
       * Nothing errored and the source read fine — it took a screenshot.
       *
       * Two rows also puts the LONG and SHORT keys across the full width
       * of the machine, which is where the primary action belongs. */}
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        {/* ---- stake ------------------------------------------------ */}
        <div className="min-w-0 sm:w-[286px] sm:shrink-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="eyebrow text-ink-3">Stake</span>
            <div className="flex items-center gap-2">
              <span className="nums rounded-tag border border-rim bg-void px-2 py-1 text-xs font-extrabold text-gold">
                {stakeEth.toFixed(2)} ETH
              </span>
              {/* MAX lives up here beside the readout rather than at the
               * end of the chip tray, where it was the first thing to
               * scroll out of reach on a phone. */}
              <Key
                variant={(STAKE_CHIPS_ETH as readonly number[]).includes(stakeEth) ? 'quiet' : 'cash'}
                size="sm"
                className="shrink-0"
                onClick={() => onStake(CHAIN.maxStakeEth)}
              >
                MAX
              </Key>
            </div>
          </div>
          <div className="rail flex items-center gap-2.5 pt-1.5 pb-0.5">
            {STAKE_CHIPS_ETH.map((v, i) => (
              <Chip
                key={v}
                valueEth={v}
                index={i}
                selected={stakeEth === v}
                onSelect={() => onStake(v)}
              />
            ))}
          </div>
        </div>

        {/* ---- auto-sell -------------------------------------------- */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor={autoId}
              className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-xs font-bold text-ink-2"
            >
              <input
                id={autoId}
                type="checkbox"
                checked={autoSell}
                onChange={(e) => onAutoSell(e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cx(
                  'relative h-6 w-11 shrink-0 rounded-chip border transition-colors peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold',
                  autoSell ? 'border-up-deep bg-up' : 'border-edge bg-void',
                )}
              >
                <span
                  className={cx(
                    'absolute top-0.5 size-4.5 rounded-chip transition-transform',
                    autoSell ? 'translate-x-[22px] bg-void' : 'translate-x-0.5 bg-edge',
                  )}
                />
              </span>
              <span className="eyebrow">Auto-sell at</span>
            </label>
            <button
              type="button"
              onClick={() => onSound(!sound)}
              aria-pressed={sound}
              className="relative -mr-2 grid size-11 place-items-center rounded-tag text-ink-3 hover:text-ink"
            >
              {/* Nora: this is the audio seam — wire it to the bus. */}
              <Icon name={sound ? 'sound-on' : 'sound-off'} size={18} />
              <span className="sr-only">{sound ? 'Mute sound' : 'Unmute sound'}</span>
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {AUTO_SELL_STEPS_X.map((n) => {
              const on = autoSell && autoSellAtX === n
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    onAutoSellAtX(n)
                    onAutoSell(true)
                  }}
                  className={cx(
                    'key-3d nums flex min-h-[44px] items-center justify-center rounded-key text-sm font-extrabold [--key-depth:3px]',
                    on
                      ? 'bg-up text-void [--key-under:var(--color-up-dark)]'
                      : autoSell
                        ? 'border border-edge bg-panel-2 text-ink [--key-under:var(--color-void)]'
                        : 'border border-rim bg-panel text-ink-3 [--key-under:var(--color-void)]',
                  )}
                >
                  {x(n)}
                </button>
              )
            })}
          </div>
        </div>

        </div>

        {/* ---- the action, full width of the machine ----------------- */}
        <div className="min-w-0">
          {holding && !cashed ? (
            <Key variant="cash" size="xl" full onClick={onCashOut} disabled={frozen}>
              <span className="flex flex-col items-center leading-none">
                <span className="text-base">
                  {frozen ? 'Position gone' : 'SELL — CASH OUT'}
                </span>
                <span className="nums mt-1 text-xs font-bold opacity-80">
                  {payoutX !== null && pnlEth !== null
                    ? `${x(payoutX)} · ${signedEth(pnlEth)} ETH`
                    : 'the house took it'}
                </span>
              </span>
            </Key>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <Key variant="long" size="xl" disabled={!canAct}>
                <span className="flex flex-col items-center leading-none">
                  <span className="flex items-center gap-1.5 text-base">
                    <Icon name="up" size={16} strokeWidth={3} />
                    {queueing ? 'QUEUE LONG' : 'LONG'}
                  </span>
                  <span className="mt-1 text-[10px] font-bold opacity-75">
                    price goes up
                  </span>
                </span>
              </Key>
              <Key variant="short" size="xl" disabled={!canAct}>
                <span className="flex flex-col items-center leading-none">
                  <span className="flex items-center gap-1.5 text-base">
                    <Icon name="down" size={16} strokeWidth={3} />
                    {queueing ? 'QUEUE SHORT' : 'SHORT'}
                  </span>
                  <span className="mt-1 text-[10px] font-bold opacity-75">
                    price goes down
                  </span>
                </span>
              </Key>
            </div>
          )}

          <p
            className="mt-2 text-center text-[11px] text-ink-3"
            aria-live="polite"
          >
            {frozen
              ? 'Round over. The next one opens in a moment.'
              : cashed
                ? 'Out with your profit. Buy back in any time — the round is still running.'
                : holding
                  ? 'Sell any time. Holding at the call loses the position.'
                  : 'Buy any time mid-round — your entry becomes your 1.00x.'}
          </p>
        </div>
      </div>
    </div>
  )
}
