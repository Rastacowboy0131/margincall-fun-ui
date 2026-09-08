import { useEffect, useId, useState } from 'react'
import type { RoundPhase } from '../../data/types'
import { AUTO_SELL_STEPS_X, CHAIN, STAKE_CHIPS_ETH } from '../../data/sample'
import { signedEth, stake as fmtStake, x } from '../../lib/format'
import { Segmented } from '../ui/Segmented'
import { Icon } from '../ui/Icon'
import { cx } from '../../lib/cx'

/** Round DOWN to 2 significant figures so a live preset never exceeds
 *  the on-chain max stake it was derived from. */
export function floorSig(v: number): number {
  if (v <= 0) return 0
  const mag = Math.pow(10, Math.floor(Math.log10(v)) - 1)
  return Math.floor(v / mag) * mag
}

/* ------------------------------------------------------------------ *
 * THE COCKPIT. Fuel (stake), auto-eject, and the one button: BOARD
 * while you are out, EJECT while you are aboard. The button's label
 * swaps with a blur crossfade because it changes under your thumb.
 * ------------------------------------------------------------------ */

export function Cockpit({
  phase, stakeEth, onStake, autoSell, onAutoSell, autoSellAtX, onAutoSellAtX, sound, onSound,
  holding, queued, payoutX, pnlEth, canBuy, onBuy, onCashOut, cashed, live = false, liveMaxStakeEth = 0,
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
  holding: boolean
  queued: boolean
  payoutX: number | null
  pnlEth: number | null
  canBuy: boolean
  onBuy: () => void
  onCashOut: () => void
  cashed: boolean
  live?: boolean
  liveMaxStakeEth?: number
}) {
  const uid = useId()

  /* The field holds its own text so a half-typed "0.00" survives; the
   * stake only changes when the text parses to a positive number. A
   * preset or MAX tap rewrites the text. */
  const [text, setText] = useState(fmtStake(stakeEth))
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!editing) setText(fmtStake(stakeEth))
  }, [stakeEth, editing])
  const onText = (v: string) => {
    const clean = v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setText(clean)
    const n = Number(clean)
    if (clean !== '' && Number.isFinite(n) && n > 0) onStake(Math.min(n, maxStakeFor()))
  }
  const queueing = phase === 'intermission'
  const frozen = phase === 'called'
  const canAct = !frozen && !queued && canBuy

  const presets: readonly number[] = live ? (liveMaxStakeEth > 0 ? [0.25, 0.5, 0.75, 1].map((f) => floorSig(liveMaxStakeEth * f)) : []) : STAKE_CHIPS_ETH
  const maxStake = live ? liveMaxStakeEth : CHAIN.maxStakeEth
  function maxStakeFor() { return maxStake > 0 ? maxStake : Infinity }
  const label = (v: number) => (v >= 0.001 ? String(v) : `${(v * 1000).toPrecision(2)}m`)
  const selling = holding && !cashed
  const actionKey = selling ? (frozen ? 'gone' : 'eject') : queued ? 'queued' : queueing ? 'queue' : 'board'

  const hint = frozen ? 'Flight lost. Next launch in a moment.'
    : cashed ? 'You ejected with the payout. Still flying, board again any time.'
    : holding ? 'Eject any time. Still aboard at the call and the stake is gone.'
    : queued ? 'You are strapped in. Lift-off fills at 1.00x.'
    : !canBuy ? 'Not enough fuel for that stake. Pick a smaller one.'
    : 'Board any time mid-flight. Eject before the call.'

  return (
    <div className="@container rounded-sky border border-line-2 bg-gradient-to-b from-surface-2 to-surface p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] sm:p-5">
      <div className="grid grid-cols-1 gap-4 @min-[860px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px] @min-[860px]:items-end">
        <div className="min-w-0">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <label htmlFor={`${uid}-stake`} className="label">Stake</label>
            <span className={cx('flex min-h-[32px] items-center rounded-pill border bg-[#0a0e22] pr-2.5 pl-3 transition-colors', editing ? 'border-gold' : 'border-line-2')}>
              <input
                id={`${uid}-stake`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={text}
                onChange={(e) => onText(e.target.value)}
                onFocus={(e) => { setEditing(true); e.currentTarget.select() }}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                aria-label="Stake in ETH"
                data-testid="stake-readout"
                className="num w-[9ch] bg-transparent text-right text-sm text-gold outline-none"
              />
              <span className="label ml-1.5 text-[9px]">ETH</span>
            </span>
          </div>
          <Segmented
            ariaLabel="Stake"
            tone="gold"
            value={presets.includes(stakeEth) ? stakeEth : stakeEth === maxStake ? maxStake : null}
            onChange={onStake}
            items={[...presets.map((v) => ({ value: v, label: label(v), name: `Stake ${v} ETH` })), { value: maxStake, label: 'MAX', name: `Stake the maximum, ${maxStake} ETH` }]}
          />
        </div>

        <div className="min-w-0">
          <div className="mb-2.5 flex items-center justify-between">
            <label htmlFor={`${uid}-auto`} className="flex cursor-pointer items-center gap-2">
              <input id={`${uid}-auto`} type="checkbox" checked={autoSell} onChange={(e) => onAutoSell(e.target.checked)} className="peer sr-only" />
              <span aria-hidden="true" className={cx('relative h-[18px] w-8 shrink-0 rounded-pill transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan', autoSell ? 'bg-cyan' : 'bg-line-2')}>
                <span className={cx('absolute top-[2px] left-[2px] size-3.5 rounded-pill transition-transform duration-200 ease-[var(--ease-out)]', autoSell ? 'translate-x-[14px] bg-bg' : 'bg-ink-2')} />
              </span>
              <span className="label">Auto-eject at</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="num text-xs text-cyan">{autoSell ? x(autoSellAtX) : 'off'}</span>
              <button type="button" onClick={() => onSound(!sound)} aria-pressed={sound} className="-my-2 grid size-8 place-items-center rounded-pill text-ink-3 transition-colors hover:text-ink">
                <Icon name={sound ? 'sound-on' : 'sound-off'} size={15} />
                <span className="sr-only">{sound ? 'Mute sound' : 'Unmute sound'}</span>
              </button>
            </div>
          </div>
          <Segmented ariaLabel="Auto-eject target" tone="cyan" value={autoSell ? autoSellAtX : null} onChange={(n) => { onAutoSellAtX(n); onAutoSell(true) }} items={AUTO_SELL_STEPS_X.map((n) => ({ value: n, label: x(n) }))} />
        </div>

        <div className="min-w-0">
          {selling ? (
            <button type="button" onClick={onCashOut} disabled={frozen} className={cx('key flex min-h-[92px] w-full items-center gap-4 rounded-[20px] pr-4 pl-4 text-left', !frozen && 'key-abort anim-alarm')}>
              <span aria-hidden="true" className={cx('grid size-11 shrink-0 place-items-center rounded-pill', frozen ? 'bg-surface-3 text-ink-3' : 'bg-bg/25 text-white')}>
                <Icon name="down" size={22} strokeWidth={2.8} />
              </span>
              <span key={actionKey} className="anim-swap min-w-0 flex-1">
                <span className="display block text-3xl leading-none font-extrabold italic tracking-wide">{frozen ? 'Lost' : 'Eject'}</span>
                <span className="num mt-1.5 block text-2xs opacity-80">{frozen ? 'the house took it' : 'cash out now'}</span>
              </span>
              {!frozen && payoutX !== null && pnlEth !== null && (
                <span className="num shrink-0 rounded-[12px] bg-bg/30 px-3 py-2 text-right leading-none">
                  <span className="block text-base font-bold">{x(payoutX)}</span>
                  <span className="mt-1 block text-2xs opacity-85">{signedEth(pnlEth, 3)} ETH</span>
                </span>
              )}
            </button>
          ) : (
            <button type="button" onClick={onBuy} disabled={!canAct} className={cx('key flex min-h-[92px] w-full items-center gap-4 rounded-[20px] pr-4 pl-4 text-left', canAct && 'key-go')}>
              <span aria-hidden="true" className={cx('grid size-11 shrink-0 place-items-center rounded-pill', canAct ? 'bg-bg/20 text-bg' : 'bg-surface-3 text-ink-3')}>
                <Icon name="up" size={22} strokeWidth={2.8} />
              </span>
              <span key={actionKey} className="anim-swap min-w-0 flex-1">
                <span className="display block text-3xl leading-none font-extrabold italic tracking-wide">{queued ? 'Boarded' : 'Board'}</span>
                <span className="num mt-1.5 block text-2xs opacity-80">{queued || queueing ? 'lifts off at 1.00x' : 'long from here'}</span>
              </span>
              <span className={cx('num shrink-0 rounded-[12px] px-3 py-2.5 text-base font-bold leading-none', canAct ? 'bg-bg/20' : 'bg-surface-3')}>{fmtStake(stakeEth)} ETH</span>
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-3" aria-live="polite">{hint}</p>
    </div>
  )
}
