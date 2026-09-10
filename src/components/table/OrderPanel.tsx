import { useEffect, useId, useState } from 'react'
import type { Position, RoundPhase } from '../../data/types'
import { AUTO_SELL_STEPS_X, CHAIN, STAKE_CHIPS_ETH } from '../../data/sample'
import { signedEth, stake as fmtStake, x } from '../../lib/format'
import { Segmented } from '../ui/Segmented'
import { Icon } from '../ui/Icon'
import { TickerMark } from '../brand/TickerMark'
import { cx } from '../../lib/cx'

/* Floor to two significant figures, then scrub binary-float noise so the
 * result is the number a person would write. Without the round-trip,
 * 0.000236246 * 0.25 lands as 0.000059999999999999995 and that string ends
 * up printed on a preset chip. */
export function floorSig(v: number): number {
  if (v <= 0) return 0
  const mag = Math.pow(10, Math.floor(Math.log10(v)) - 1)
  return Number((Math.floor(v / mag) * mag).toPrecision(6))
}

/* ------------------------------------------------------------------ *
 * THE ORDER PANEL. Two faces:
 *
 *   flat     amount (typed or preset), auto cash-out target, the round's
 *            leverage as a fact, BUY (Go Long). SELL (Go Short) is
 *            visible but disabled: it is coming, and hiding it would
 *            make the game look like it only goes one way.
 *   holding  the open position: entry, payout, unrealised P&L, and
 *            one big CASH OUT.
 *
 * What is deliberately NOT here: an asset picker (the house picks the
 * ticker), Market/Limit tabs (auto cash-out IS the limit), a risk bar.
 * ------------------------------------------------------------------ */

export function OrderPanel({
  phase, stakeEth, onStake, autoSell, onAutoSell, autoSellAtX, onAutoSellAtX, position, payoutX, pnlEth, queued, cashed, canBuy, onBuy, onCashOut, live = false, liveMaxStakeEth = 0, leverage, buyingPowerEth,
}: {
  phase: RoundPhase; stakeEth: number; onStake: (v: number) => void; autoSell: boolean; onAutoSell: (v: boolean) => void; autoSellAtX: number; onAutoSellAtX: (v: number) => void
  position: Position | null; payoutX: number | null; pnlEth: number | null; queued: boolean; cashed: boolean; canBuy: boolean; onBuy: () => void; onCashOut: () => void
  live?: boolean; liveMaxStakeEth?: number; leverage: number; buyingPowerEth: number
}) {
  /* Why the buy button is off, in the order a player would ask. "More than
   * your buying power" used to be the answer to every case, including the
   * common one where the amount was fine and the betting window had simply
   * closed. */
  const uid = useId()
  const frozen = phase === 'called', queueing = phase === 'intermission'
  const holding = position !== null && !cashed
  const canAct = !frozen && !queued && canBuy

  const presets: readonly number[] = live ? (liveMaxStakeEth > 0 ? [0.25, 0.5, 0.75, 1].map((f) => floorSig(liveMaxStakeEth * f)) : []) : STAKE_CHIPS_ETH
  const overBalance = stakeEth > buyingPowerEth
  const overTableMax = live && liveMaxStakeEth > 0 && stakeEth > liveMaxStakeEth
  const windowShut = live && phase === 'live'
  const blockedWhy = frozen
    ? 'Round over. The next one opens in a moment.'
    : overBalance
      ? 'Amount is more than your wallet balance.'
      : overTableMax
        ? `Table max this round is ${fmtStake(liveMaxStakeEth)} ETH.`
        : windowShut
          ? 'Round is running. Your buy lands in the next window.'
          : 'Amount is more than your buying power.'
  const maxStake = live ? liveMaxStakeEth : CHAIN.maxStakeEth
  const maxFor = () => (maxStake > 0 ? maxStake : Infinity)

  const [text, setText] = useState(fmtStake(stakeEth))
  const [editing, setEditing] = useState(false)
  useEffect(() => { if (!editing) setText(fmtStake(stakeEth)) }, [stakeEth, editing])
  const onText = (v: string) => {
    const clean = v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setText(clean)
    const n = Number(clean)
    if (clean !== '' && Number.isFinite(n) && n > 0) onStake(Math.min(n, maxFor()))
  }

  const maxWin = stakeEth * (CHAIN.maxPayoutX - 1)

  return (
    <section className="card overflow-hidden">
      {holding && position ? (
        <>
          <header className="flex min-h-[40px] items-center justify-between border-b border-line px-4">
            <span className="label">Open position</span>
            <span className="num flex items-center gap-1.5 text-xs font-semibold text-lime"><span aria-hidden="true" className="anim-pulse size-1.5 rounded-pill bg-lime" />Live</span>
          </header>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-3">
              <TickerMark ticker={position.ticker} size={34} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-ink">{position.ticker.symbol} <span className="text-ink-2">{position.leverage}x long</span></div>
                <div className="num text-xs text-ink-3">opened {position.openedAtLabel}</div>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-2">
              {[['Size', `${fmtStake(position.stakeEth)} ETH`, 'text-ink'], ['Entry', x(position.entryX), 'text-ink'], ['Payout', payoutX === null ? '' : x(payoutX), payoutX !== null && payoutX < 1 ? 'text-down' : 'text-lime']].map(([k, v, t]) => (
                <div key={k} className="rounded-ctl border border-line bg-surface-2 px-3 py-2.5"><dt className="label">{k}</dt><dd className={cx('num mt-1 text-sm font-bold', t)}>{v}</dd></div>
              ))}
            </dl>
            <div className="rounded-ctl border border-line bg-bg px-4 py-3 text-center">
              <div className="label">Unrealised P&L</div>
              <div className={cx('num mt-1 text-3xl font-bold leading-none', pnlEth !== null && pnlEth < 0 ? 'text-down' : 'text-lime')}>{pnlEth === null ? '' : `${signedEth(pnlEth, 4)} ETH`}</div>
            </div>
            <button type="button" onClick={onCashOut} disabled={frozen} className={cx('press flex min-h-[60px] w-full flex-col items-center justify-center rounded-ctl text-base font-extrabold tracking-wide', frozen ? 'bg-surface-3 text-ink-3' : 'bg-lime text-bg glow-lime')}>
              <span key={frozen ? 'f' : 's'} className="anim-swap">{frozen ? 'Position gone' : `Cash out ${payoutX === null ? '' : x(payoutX)}`}</span>
              <span className="num mt-0.5 text-2xs font-semibold opacity-75">{frozen ? 'the house took it' : 'sell at market'}</span>
            </button>
            <p className="text-center text-2xs text-ink-3">{frozen ? 'Round over. The next one opens in a moment.' : 'Sell any time. Holding at the call loses the position.'}</p>
          </div>
        </>
      ) : (
        <>
          <header className="flex min-h-[40px] items-center justify-between border-b border-line px-4">
            <span className="label">Place order</span>
            <span className="num text-xs text-ink-3">Balance {fmtStake(buyingPowerEth)} ETH</span>
          </header>
          <div className="flex flex-col gap-4 p-4">
            <div>
              <div className="mb-2 flex items-center justify-between"><label htmlFor={`${uid}-amt`} className="label">Amount</label>{cashed && <span className="num text-2xs text-lime">out with profit, buy back in?</span>}</div>
              <div className={cx('flex min-h-[46px] items-center rounded-ctl border bg-bg px-3 transition-colors', editing ? 'border-lime' : 'border-line-2')}>
                <span aria-hidden="true" className="mr-2.5 grid size-6 place-items-center rounded-[5px] bg-[#627eea] text-[10px] font-bold text-white">Ξ</span>
                <input id={`${uid}-amt`} type="text" inputMode="decimal" autoComplete="off" value={text} onChange={(e) => onText(e.target.value)} onFocus={(e) => { setEditing(true); e.currentTarget.select() }} onBlur={() => setEditing(false)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} data-testid="stake-readout"
                  className="num min-w-0 flex-1 bg-transparent text-lg font-bold text-ink outline-none" />
                <span className="label">ETH</span>
              </div>
              <Segmented ariaLabel="Amount presets" size="sm" className="mt-2" value={presets.includes(stakeEth) ? stakeEth : stakeEth === maxStake ? maxStake : null} onChange={onStake}
                items={[...presets.map((v) => ({ value: v, label: fmtStake(v), name: `Stake ${fmtStake(v)} ETH` })), { value: maxStake, label: 'MAX', name: `Stake the maximum` }]} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor={`${uid}-auto`} className="flex cursor-pointer items-center gap-2">
                  <input id={`${uid}-auto`} type="checkbox" checked={autoSell} onChange={(e) => onAutoSell(e.target.checked)} className="peer sr-only" />
                  <span aria-hidden="true" className={cx('relative h-[18px] w-8 shrink-0 rounded-pill transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime', autoSell ? 'bg-lime' : 'bg-line-2')}>
                    <span className={cx('absolute top-[2px] left-[2px] size-3.5 rounded-pill transition-transform duration-200 ease-[var(--ease-out)]', autoSell ? 'translate-x-[14px] bg-bg' : 'bg-ink-2')} />
                  </span>
                  <span className="label">Auto cash-out</span>
                </label>
                <span className="num text-xs text-ink-2">{autoSell ? `at ${x(autoSellAtX)}` : 'off'}</span>
              </div>
              <Segmented ariaLabel="Auto cash-out target" size="sm" value={autoSell ? autoSellAtX : null} onChange={(n) => { onAutoSellAtX(n); onAutoSell(true) }} items={AUTO_SELL_STEPS_X.map((n) => ({ value: n, label: x(n) }))} />
            </div>

            <div className="flex items-center justify-between rounded-ctl border border-line bg-surface-2 px-3 py-2.5">
              <div><div className="text-sm font-semibold text-ink">Leverage</div><div className="text-2xs text-ink-3">set by the house per round</div></div>
              <span className="num rounded-[6px] bg-lime px-2 py-1 text-sm font-extrabold text-bg">{leverage}x</span>
            </div>

            <button type="button" onClick={onBuy} disabled={!canAct} className={cx('press flex min-h-[60px] w-full flex-col items-center justify-center rounded-ctl text-base font-extrabold tracking-wide', canAct ? 'bg-lime text-bg glow-lime' : 'bg-surface-3 text-ink-3')}>
              <span key={queued ? 'q' : queueing ? 'i' : 'b'} className="anim-swap flex items-center gap-2">{queued ? 'Queued' : queueing ? 'Queue buy' : 'Buy'} <Icon name="up" size={16} strokeWidth={2.6} className="rotate-45" /> <span className="font-semibold opacity-80">(Go long)</span></span>
              <span className="num mt-0.5 text-2xs font-semibold opacity-75">{queued ? 'fills at the 1.00x open' : queueing ? `${fmtStake(stakeEth)} ETH at the 1.00x open` : `${fmtStake(stakeEth)} ETH at market`}</span>
            </button>
            <button type="button" disabled className="flex min-h-[48px] w-full flex-col items-center justify-center rounded-ctl border border-line text-sm font-bold text-ink-3">
              <span className="flex items-center gap-2">Sell <Icon name="down" size={14} strokeWidth={2.6} className="-rotate-45" /> (Go short)</span>
              <span className="text-2xs font-medium">coming soon</span>
            </button>
            <p className="num flex items-center justify-between text-2xs text-ink-3">
              <span>{frozen || !canBuy ? blockedWhy : queueing ? 'Buys placed now fill at the open.' : 'Buy any time mid-round. Your entry becomes your 1.00x.'}</span>
              <span>Max win <b className="text-ink-2">{fmtStake(maxWin)} ETH</b></span>
            </p>
          </div>
        </>
      )}
    </section>
  )
}
