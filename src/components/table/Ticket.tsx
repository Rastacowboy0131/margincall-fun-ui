import type { Position } from '../../data/types'
import { signedEth, x } from '../../lib/format'
import { TickerMark } from '../brand/TickerMark'
import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * THE TICKET.
 *
 * This is the one place in the product where the interface depicts the
 * thing instead of tabulating it, and it is the reason the table reads
 * as a table. Your position is a piece of paper: it prints out of a
 * slot in the console when you buy, it is the only warm, light object
 * on the whole screen, and when the house takes it, it is fed through a
 * shredder in front of you.
 *
 * The three states are the three things that can happen to a position:
 *
 *   none        printing / held. Live payout on it, updating.
 *   cashed      a green CASHED stamp, rotated, slammed on.
 *   liquidated  a red LIQUIDATED stamp, then seven strips fall out of
 *               the bottom of the frame on staggered delays.
 *
 * The figure the ticket exists to carry is PAYOUT — exit divided by
 * your entry — which is not the same as the round multiple printed
 * above it, and is the number new players consistently misread. So the
 * ticket says it in words underneath, on the paper, where the confusion
 * actually happens.
 * ------------------------------------------------------------------ */

const STRIPS = 7

export type TicketStamp = 'none' | 'cashed' | 'liquidated'

function Perforation({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <div
      aria-hidden="true"
      className="h-2 w-full shrink-0"
      style={{
        backgroundImage: `radial-gradient(circle at 7px ${edge === 'top' ? '0px' : '8px'}, transparent 0 4.5px, var(--color-paper) 5px)`,
        backgroundSize: '14px 8px',
        backgroundRepeat: 'repeat-x',
      }}
    />
  )
}

function Face({
  position,
  payoutX,
  pnlEth,
  stamp,
}: {
  position: Position
  payoutX: number | null
  pnlEth: number | null
  stamp: TicketStamp
}) {
  const dead = stamp === 'liquidated'
  return (
    <div className="flex w-full flex-col" style={{ fontFamily: 'var(--font-receipt)' }}>
      <Perforation edge="top" />
      <div className="bg-paper px-3.5 pb-3 pt-1 text-paper-ink">
        <div className="flex items-baseline justify-between text-[10px] font-bold tracking-widest">
          <span>MARGIN CALL</span>
          <span className="nums">#{position.roundId}</span>
        </div>

        <div className="my-2 border-t border-paper-rule" />

        <div className="flex items-center gap-2">
          <TickerMark ticker={position.ticker} size={26} />
          <span className="text-sm font-bold tracking-tight text-paper-ink">
            {position.ticker.symbol}
          </span>
          <span className="nums ml-auto rounded-[4px] bg-paper-ink px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-paper">
            {position.leverage}x {position.side === 'long' ? 'LONG' : 'SHORT'}
          </span>
        </div>

        <dl className="mt-2.5 flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between">
            <dt className="text-paper-ink-2">STAKE</dt>
            <dd className="nums font-bold">{position.stakeEth.toFixed(2)} ETH</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-paper-ink-2">ENTRY</dt>
            <dd className="nums font-bold">{x(position.entryX)}</dd>
          </div>
        </dl>

        <div
          aria-hidden="true"
          className="my-2.5 h-px w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--color-paper-rule) 0 4px, transparent 4px 8px)',
          }}
        />

        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-paper-ink-2">PAYOUT</div>
            <div className="nums text-2xl font-extrabold leading-none tracking-tight">
              {dead || payoutX === null ? '—' : x(payoutX)}
            </div>
          </div>
          <div
            className={cx(
              'nums text-lg font-extrabold leading-none',
              pnlEth !== null && pnlEth < 0 ? 'text-stamp-red' : 'text-stamp-green',
            )}
          >
            {pnlEth === null ? '' : `${signedEth(pnlEth)} ETH`}
          </div>
        </div>

        <p className="mt-1.5 text-[10px] leading-snug text-paper-ink-2">
          payout = sell price ÷ your entry, not the round multiple
        </p>

        <div className="mt-2 flex items-center justify-between border-t border-paper-rule pt-1.5 text-[10px] text-paper-ink-2">
          <span className="nums">opened {position.openedAtLabel}</span>
          <span className="tracking-widest">PAPER</span>
        </div>
      </div>
      <Perforation edge="bottom" />
    </div>
  )
}

export function Ticket({
  position,
  payoutX,
  pnlEth,
  stamp,
  className,
}: {
  position: Position
  payoutX: number | null
  pnlEth: number | null
  stamp: TicketStamp
  className?: string
}) {
  const face = <Face position={position} payoutX={payoutX} pnlEth={pnlEth} stamp={stamp} />

  if (stamp === 'liquidated') {
    return (
      <div className={cx('relative w-[248px] select-none', className)}>
        {/* The strips. Each one is a full copy of the ticket clipped to
         * its own column, so the shredded paper still reads as the
         * ticket that was there a moment ago rather than as confetti. */}
        {Array.from({ length: STRIPS }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={i === 0 ? 'relative' : 'absolute inset-0'}
            style={{
              clipPath: `inset(0 ${100 - ((i + 1) * 100) / STRIPS}% 0 ${(i * 100) / STRIPS}%)`,
              // The stamp lands first and is allowed to sit for a beat;
              // the paper only starts falling afterwards. Timed against
              // the 3.2s the 'called' frame is on screen so the last
              // strip has left the felt before the table resets.
              animation: 'mc-shred 1000ms cubic-bezier(0.5,0,0.9,0.6) both',
              animationDelay: `${850 + i * 80}ms`,
              // Alternating drift, so the strips fan out instead of
              // falling as one block.
              ['--shred-x' as string]: `${(i - (STRIPS - 1) / 2) * 9}px`,
              ['--shred-r' as string]: `${(i % 2 === 0 ? 1 : -1) * (5 + i)}deg`,
              filter: 'drop-shadow(3px 5px 0 rgb(0 0 0 / 0.45))',
            }}
          >
            {face}
          </div>
        ))}

        {/* The stamp must not outlive the paper it was stamped on, so it
         * runs a second, delayed fade after the strips start falling. */}
        <span
          className="pointer-events-none absolute top-[46%] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-[4px] border-[3px] border-stamp-red px-2 py-0.5 font-sign text-base whitespace-nowrap text-stamp-red"
          style={{
            animation:
              'mc-stamp 460ms 60ms var(--ease-slam) both, mc-fade 620ms 1000ms ease-in forwards',
          }}
        >
          LIQUIDATED
        </span>

        <p className="sr-only">Your position was liquidated. The ticket has been shredded.</p>
      </div>
    )
  }

  return (
    <div
      className={cx('anim-print relative w-[248px] select-none', className)}
      style={{ filter: 'drop-shadow(3px 5px 0 rgb(0 0 0 / 0.45))' }}
    >
      {face}
      {stamp === 'cashed' && (
        <span className="anim-stamp pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[4px] border-[3px] border-stamp-green px-2 py-0.5 font-sign text-base text-stamp-green">
          CASHED
        </span>
      )}
    </div>
  )
}
