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
  queued,
  payoutX,
  pnlEth,
  canBuy,
  onBuy,
  onCashOut,
  cashed,
  variant = 'welded',
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
  /** True while a buy is queued for the next 1.00x open. */
  queued: boolean
  payoutX: number | null
  pnlEth: number | null
  /** False when the stake exceeds buying power. */
  canBuy: boolean
  onBuy: () => void
  onCashOut: () => void
  cashed: boolean
  /** 'welded' sits under the felt as part of the machine (phones).
   *  'panel' is a standalone object in the right-hand rail, beside the
   *  chart, which is where it belongs on a desktop: you can watch the
   *  number and reach the keys without moving your eyes or scrolling. */
  variant?: 'welded' | 'panel'
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
  // that stops you acting is the round being over, a buy already queued,
  // or the stake outrunning your buying power.
  const canAct = !frozen && !queued && canBuy

  const panel = variant === 'panel'

  return (
    <div
      className={cx(
        'relative',
        panel
          ? 'overflow-hidden rounded-panel border border-gold-deep/40 bg-panel shadow-lift'
          : 'border-t-2 border-rim-hi bg-panel',
      )}
    >
      {panel ? (
        <>
          {/* In the rail the console is its own object, so it gets the
           * table's gold edge along the top instead of a slot. */}
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gold/60" />
          <header className="flex min-h-[44px] items-center gap-2 border-b border-rim px-4">
            <span className="eyebrow text-gold">Your bet</span>
          </header>
        </>
      ) : (
        /* Welded under the felt: the slot the ticket prints out of.
         * Decorative, but it is what makes the panel read as a machine
         * rather than as a toolbar. */
        <span
          aria-hidden="true"
          className="absolute top-0 left-1/2 h-1.5 w-28 -translate-x-1/2 -translate-y-1/2 rounded-chip bg-void shadow-[inset_0_2px_2px_rgb(0_0_0/0.9)]"
        />
      )}

      {/* The layout below responds to the CONSOLE's own width, not the
       * viewport's — it is a full-width bar under the chart on a phone
       * and a 292px column beside the chart on desktop, and a media
       * query cannot tell those apart. */}
      <div className="@container flex flex-col gap-3 p-3 sm:p-4">
        {/* Container query, not a viewport one. At 1024 the machine
         * column is only ~400px wide even though the VIEWPORT is wide,
         * so a `sm:flex-row` here crushed the auto-sell keys into an
         * unreadable 40px column. The console has to respond to its own
         * width, which is the one thing a media query cannot see. */}
        <div className="flex flex-col gap-4 @min-[600px]:flex-row @min-[600px]:gap-6">
        {/* ---- stake ------------------------------------------------ */}
        <div className="min-w-0 @min-[600px]:w-[286px] @min-[600px]:shrink-0">
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
            <div className="grid grid-cols-1 gap-2.5 @min-[380px]:grid-cols-2">
              <Key variant="long" size="xl" disabled={!canAct} onClick={onBuy}>
                <span className="flex flex-col items-center leading-none">
                  <span className="flex items-center gap-1.5 text-base">
                    <Icon name="up" size={16} strokeWidth={3} />
                    {queued ? 'QUEUED' : queueing ? 'QUEUE LONG' : 'LONG'}
                  </span>
                  <span className="mt-1 text-[10px] font-bold opacity-75">
                    {queued ? 'fills at the 1.00x open' : 'price goes up'}
                  </span>
                </span>
              </Key>
              <Key variant="short" size="xl" disabled>
                <span className="flex flex-col items-center leading-none">
                  <span className="flex items-center gap-1.5 text-base">
                    <Icon name="down" size={16} strokeWidth={3} />
                    SHORT
                  </span>
                  <span className="mt-1 text-[10px] font-bold opacity-75">
                    coming soon
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
                  : queued
                    ? 'Your buy is in the queue. It fills the moment the round opens.'
                    : !canBuy
                      ? 'Stake is more than your buying power. Pick a smaller chip.'
                      : 'Buy any time mid-round — your entry becomes your 1.00x.'}
          </p>
        </div>
      </div>
    </div>
  )
}
