import type { ReactNode } from 'react'
import type { Candle, Position, Round, RoundPhase } from '../../data/types'
import { AppLink } from '../../app/AppLink'
import { clock } from '../../lib/format'
import { CandleTape } from './CandleTape'
import { Multiplier } from './Multiplier'
import { TickerMark } from '../brand/TickerMark'
import { Icon } from '../ui/Icon'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * THE TABLE.
 *
 * A rim of brushed metal, a stitched line inside it, baize with a nap
 * on it and a lamp hanging over the middle.
 *
 * When the house takes the round the whole table moves: it shakes once,
 * the felt floods red, the candles dim, and the ticket goes through the
 * shredder. That is the signature moment of the product and it happens
 * exactly once per round — nothing here loops.
 * ------------------------------------------------------------------ */

export function Felt({
  round,
  phase,
  candles,
  revealCount,
  position,
  payoutX,
  ticket,
}: {
  round: Round
  phase: RoundPhase
  candles: Candle[]
  /** How many candles of the path have happened yet. */
  revealCount?: number
  /** The viewer's position, for the entry line on the chart. */
  position: Position | null
  payoutX: number | null
  /** The printed ticket, placed on the felt on wide screens. */
  ticket?: ReactNode
}) {
  const called = phase === 'called'

  return (
    <div className="felt-nap felt-lamp relative flex min-h-[272px] flex-col bg-felt sm:min-h-[318px] lg:min-h-[430px]">
      {/* The stitched line just inside the rim. Decorative. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 z-10 rounded-[20px] border border-dashed border-gold/15"
      />

      {/* The rope light chasing round the top edge while a round runs. */}
      <span
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px]',
          phase === 'live' ? 'rim-chase' : called ? 'bg-down' : 'bg-gold/35',
        )}
      />

      {/* ---- the table's own header ---- */}
      <header className="relative z-20 flex items-center gap-2.5 px-3.5 pt-4 sm:px-5">
        <TickerMark ticker={round.ticker} size={38} />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-base font-extrabold tracking-tight text-ink">
              {round.ticker.symbol}
            </span>
            <span className="nums rounded-tag bg-panel-2 px-1.5 py-0.5 text-[11px] font-extrabold text-gold">
              {round.leverage}x
            </span>
          </div>
          <span className="truncate text-[11px] text-ink-3">
            {round.ticker.name} · round #{round.id}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span
            className={cx(
              'nums flex h-8 items-center gap-1.5 rounded-tag border px-2 text-xs font-bold',
              called
                ? 'border-down-deep/50 bg-down-wash text-down'
                : phase === 'intermission'
                  ? 'border-rim bg-panel text-ink-3'
                  : 'border-up-deep/45 bg-up-wash text-up',
            )}
          >
            <span
              aria-hidden="true"
              className={cx(
                'size-1.5 rounded-chip',
                called ? 'bg-down' : phase === 'intermission' ? 'bg-ink-3' : 'anim-pulse bg-up',
              )}
            />
            {called ? 'over' : phase === 'intermission' ? 'reset' : clock(round.elapsedSec)}
          </span>

          {/* Doubt happens here, at the table, not in a footer — so the
           * way to check the round is here too. */}
          <AppLink
            to="/fair"
            className="hidden min-h-[44px] items-center gap-1.5 rounded-tag border border-rim bg-panel px-2.5 text-[11px] font-bold text-ink-2 hover:text-gold sm:flex"
          >
            <Icon name="fair" size={13} />
            Provably fair
          </AppLink>
        </div>
      </header>

      {/* ---- the round ---- */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* When the ticket is on the felt the chart starts to the right
         * of it, rather than running underneath the paper where the
         * first third of the round would be hidden. The top inset
         * reserves the band where the multiplier now lives, so the
         * candle path never runs under the number. */}
        <div
          className={cx(
            'absolute top-16 right-3 bottom-3 left-3 sm:top-20 sm:right-5 sm:left-5 lg:top-[104px]',
            Boolean(ticket) && 'xl:left-[302px]',
          )}
        >
          <CandleTape
            candles={candles}
            revealCount={revealCount}
            entryX={position ? position.entryX : null}
            currentX={round.currentX}
            called={called}
          />
        </div>

        {/* From xl the ticket sits ON the felt, to the left, as a
         * column of its own. */}
        <div className="relative z-20 flex flex-1 items-end gap-5 px-4 pb-5 sm:px-6">
          {ticket && <div className="hidden shrink-0 xl:block">{ticket}</div>}
          <div className="min-w-0 flex-1" />
        </div>

        {/* The multiplier sits at the TOP of the plot area (top-center),
         * clear of the candle path, offset right when the ticket column
         * is on the felt so it stays centered over the chart itself.
         * @container: sized against this band, not the viewport. */}
        <div
          className={cx(
            '@container pointer-events-none absolute inset-x-3 top-2 z-20 grid place-items-center sm:inset-x-5 sm:top-3',
            Boolean(ticket) && 'xl:left-[302px]',
          )}
        >
          <Multiplier
            phase={phase}
            currentX={round.currentX}
            opensInSec={round.opensInSec}
            payoutX={payoutX}
          />
        </div>
      </div>

      {/* ---- the house taking the round ---- */}
      {called && (
        <span
          aria-hidden="true"
          className="anim-flood pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(70% 60% at 50% 45%, rgb(255 77 94 / 0.34) 0%, rgb(109 18 32 / 0.55) 60%, rgb(45 8 16 / 0.72) 100%)',
          }}
        />
      )}
    </div>
  )
}
