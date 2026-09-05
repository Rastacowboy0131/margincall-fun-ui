import { useState } from 'react'
import type { Player, Round } from '../data/types'
import {
  ACTIVITY,
  CANDLES,
  CANDLES_CALLED,
  PLAYERS,
  PLAYERS_BETWEEN,
  PLAYERS_CALLED,
  POSITION,
  QUEUE,
  ROUND,
} from '../data/sample'
import { useReel } from '../lib/useReel'
import { ResultsStrip } from '../components/shell/ResultsStrip'
import { Machine } from '../components/table/Machine'
import { Felt } from '../components/table/Felt'
import { Console } from '../components/table/Console'
import { Ticket, type TicketStamp } from '../components/table/Ticket'
import { PlayersRail } from '../components/table/PlayersRail'
import { QueueRail } from '../components/table/QueueRail'
import { FeedRail } from '../components/table/FeedRail'
import { HowItWorks } from '../components/table/HowItWorks'

/* ------------------------------------------------------------------ *
 * The table.
 *
 * Layout, top to bottom: the results strip, then one grid whose middle
 * column is the table itself —
 * with the other players down the left and the betting console down the
 * right, beside the chart. Below lg the same three columns become one
 * stack in the order that matters on a phone: play, your slip, what is
 * next, who else is here, the feed.
 *
 * Everything on this page that changes over time comes out of useReel,
 * which walks a fixed list of frames. All the state declared here is
 * presentational: which chip is lifted, where auto-sell is set,
 * whether the sound icon is crossed out, and whether the ticket has
 * been stamped. None of it computes a figure anyone cares about.
 * ------------------------------------------------------------------ */

export function Play() {
  const frame = useReel()

  const [stakeEth, setStakeEth] = useState(0.5)
  const [autoSell, setAutoSell] = useState(false)
  const [autoSellAtX, setAutoSellAtX] = useState(2)
  const [sound, setSound] = useState(true)

  /* Pressing SELL stamps the ticket CASHED and freezes the figures that
   * were on it at that moment, so the paper and the reel can never
   * disagree about what you walked away with. Cleared when the table
   * resets. */
  const [cashedAt, setCashedAt] = useState<{ atX: number; payoutX: number; pnlEth: number } | null>(
    null,
  )

  /* Adjusted during render rather than from an effect. React documents
   * this for "reset some state when a value changes", and it matters
   * here: an effect would let one frame paint with a CASHED ticket on a
   * table that has already reset. */
  const [phaseSeen, setPhaseSeen] = useState(frame.phase)
  if (phaseSeen !== frame.phase) {
    setPhaseSeen(frame.phase)
    if (frame.phase === 'intermission') setCashedAt(null)
  }

  const round: Round = {
    ...ROUND,
    phase: frame.phase,
    currentX: frame.currentX,
    elapsedSec: frame.elapsedSec,
    opensInSec: frame.opensInSec,
    ruggedAtX: frame.phase === 'called' ? frame.currentX : null,
    holding: frame.holding,
    watching: frame.watching,
  }

  const path = frame.phase === 'called' ? CANDLES_CALLED : CANDLES
  const candles = path.slice(0, frame.candles)

  const inRound = frame.phase !== 'intermission'
  const position = inRound ? POSITION : null
  const stillHolding = inRound && cashedAt === null

  const ticketPayoutX = cashedAt ? cashedAt.payoutX : frame.payoutX
  const ticketPnlEth = cashedAt ? cashedAt.pnlEth : frame.pnlEth
  const stamp: TicketStamp = cashedAt
    ? 'cashed'
    : frame.phase === 'called'
      ? 'liquidated'
      : 'none'

  const ticket = position ? (
    <Ticket
      position={position}
      payoutX={ticketPayoutX}
      pnlEth={ticketPnlEth}
      stamp={stamp}
    />
  ) : null

  const roster =
    frame.phase === 'called'
      ? PLAYERS_CALLED
      : frame.phase === 'intermission'
        ? PLAYERS_BETWEEN
        : PLAYERS

  /* Shared by both console copies so they can never diverge. */
  const cashOut = () => {
    if (frame.payoutX !== null && frame.pnlEth !== null) {
      setCashedAt({ atX: frame.currentX, payoutX: frame.payoutX, pnlEth: frame.pnlEth })
    }
  }

  /* Your seat is built here rather than living in the roster, so the
   * rail can never claim you are holding while the console says flat. */
  const yourSeat: Player | null = position
    ? {
        handle: 'you',
        tint: '#ffc247',
        entryX: position.entryX,
        atX: cashedAt ? cashedAt.atX : frame.currentX,
        pnlEth: ticketPnlEth ?? 0,
        status: cashedAt ? 'out' : frame.phase === 'called' ? 'called' : 'holding',
      }
    : null

  return (
    <>
      <div className="sticky top-14 z-30">
        <ResultsStrip liveX={frame.currentX} phase={frame.phase} />
      </div>

      <div className="mx-auto max-w-[1560px] px-3 py-3 sm:px-5 lg:py-5">
        <h1 className="sr-only">Margin Call — the table</h1>

        {/* grid-cols-1 is load-bearing: without an explicit base column
         * the children land in an implicit max-content track and the
         * scroll rails inside them blow the page out sideways.
         *
         * THREE COLUMNS, EACH ITS OWN STACK — no grid rows.
         *
         *   [ your slip  ] [ the table  ] [ your bet   ]
         *   [ at the table] [ up next   ] [ live feed  ]
         *
         * The betting console takes the right-hand rail so the chart and
         * the LONG / SHORT keys sit SIDE BY SIDE — you watch the number
         * and reach the keys without moving your eyes or scrolling, at
         * any window height. "Up next" moves under the chart, because
         * knowing which ticker is coming matters far less than being
         * able to act on the one that is running.
         *
         * Deliberately NOT placed on explicit grid rows. With rows, a
         * tall item in one column stretches the row and punches dead
         * space into the other two — which is exactly what happened when
         * the printed ticket sat loose in the middle column: it made
         * that column 715px against 440 everywhere else and threw the
         * whole page out of alignment. Independent column stacks cannot
         * do that to each other. */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[262px_minmax(0,1fr)_292px]">
          <div className="order-2 flex min-w-0 flex-col gap-4 lg:order-none">
            {/* Between lg and xl the felt is too narrow to carry the
             * ticket beside the chart, so the paper heads this rail
             * instead — flush in a 262px column with the seats below it,
             * rather than floating centred in open page. */}
            {ticket && <div className="hidden lg:block xl:hidden">{ticket}</div>}
            <PlayersRail players={roster} watching={frame.watching} you={yourSeat} />
          </div>

          <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-none">
            <Machine phase={frame.phase}>
              <Felt
                round={round}
                phase={frame.phase}
                candles={candles}
                position={position}
                payoutX={stillHolding ? frame.payoutX : null}
                ticket={ticket}
              />
              {/* Welded under the felt on a phone, where a right-hand
               * rail does not exist and the thumb is at the bottom. */}
              <div className="lg:hidden">
                <Console
                  phase={frame.phase}
                  stakeEth={stakeEth}
                  onStake={setStakeEth}
                  autoSell={autoSell}
                  onAutoSell={setAutoSell}
                  autoSellAtX={autoSellAtX}
                  onAutoSellAtX={setAutoSellAtX}
                  sound={sound}
                  onSound={setSound}
                  holding={stillHolding}
                  payoutX={frame.payoutX}
                  pnlEth={frame.pnlEth}
                  cashed={cashedAt !== null}
                  onCashOut={cashOut}
                />
              </div>
            </Machine>

            {/* On a phone the console is welded above, so the paper
             * really is coming out of that slot. Centred here is right
             * because the whole page is one centred column. */}
            {ticket && <div className="flex justify-center lg:hidden">{ticket}</div>}

            <QueueRail round={round} phase={frame.phase} queue={QUEUE} />
          </div>

          {/* The console, in the rail, beside the chart. Rendered twice
           * rather than moved: a DOM node cannot be in two grid columns,
           * and both copies read the same props from this page, so they
           * cannot disagree. Console calls useId(), so the two auto-sell
           * checkboxes get distinct ids and neither <label for> breaks. */}
          <div className="order-3 flex min-w-0 flex-col gap-4 lg:order-none">
            {/* The panel copy only exists from lg; below that the welded
             * one inside the machine is the real console. The feed under
             * it stays visible at every width. */}
            <div className="hidden lg:block">
              <Console
                variant="panel"
                phase={frame.phase}
                stakeEth={stakeEth}
                onStake={setStakeEth}
                autoSell={autoSell}
                onAutoSell={setAutoSell}
                autoSellAtX={autoSellAtX}
                onAutoSellAtX={setAutoSellAtX}
                sound={sound}
                onSound={setSound}
                holding={stillHolding}
                payoutX={frame.payoutX}
                pnlEth={frame.pnlEth}
                cashed={cashedAt !== null}
                onCashOut={cashOut}
              />
            </div>
            <FeedRail items={ACTIVITY} />
          </div>
        </div>
      </div>

      <HowItWorks />
    </>
  )
}
