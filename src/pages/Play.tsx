import { useEffect, useState } from 'react'
import type { Player, Position, Round } from '../data/types'
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
 * which subscribes to the round engine (src/lib/engine.ts): a seeded
 * random walk per round, looping live -> called -> intermission
 * forever. The state declared here is presentational — which chip is
 * lifted, where auto-sell is set, whether the sound icon is crossed
 * out. The money is the engine's.
 * ------------------------------------------------------------------ */

export function Play() {
  const reel = useReel()

  const [stakeEth, setStakeEth] = useState(0.5)
  const [autoSell, setAutoSell] = useState(false)
  const [autoSellAtX, setAutoSellAtX] = useState(2)
  const [sound, setSound] = useState(true)

  const { you } = reel
  const live = reel.mode === 'live'

  /* Entering live mode with the demo's 0.5 ETH default selected would
   * leave every buy reverting on the 2% max; clamp the stake into the
   * live range the moment the live max is known. */
  useEffect(() => {
    if (live && reel.liveMaxStakeEth > 0 && stakeEth > reel.liveMaxStakeEth) {
      setStakeEth(Number(reel.liveMaxStakeEth.toPrecision(2)))
    }
  }, [live, reel.liveMaxStakeEth, stakeEth])

  /* Auto-sell: fires the same sell the button does, once, the first
   * tick the payout multiple touches the target. */
  useEffect(() => {
    if (!autoSell) return
    if (reel.phase !== 'live' || you.status !== 'in') return
    if (reel.payoutX !== null && reel.payoutX >= autoSellAtX) reel.sell()
  }, [autoSell, autoSellAtX, reel, you.status])

  const round: Round = {
    id: reel.roundId,
    ticker: reel.ticker,
    leverage: reel.leverage,
    phase: reel.phase,
    currentX: reel.currentX,
    elapsedSec: reel.elapsedSec,
    ruggedAtX: reel.ruggedAtX,
    opensInSec: reel.opensInSec,
    holding: reel.holding,
    watching: reel.watching,
  }

  /* Your position, assembled from the engine's `you`. Sold and called
   * positions keep their ticket on the felt until the table resets, so
   * the stamp lands on the paper that was there. */
  const hasTicket = you.status === 'in' || you.status === 'out' || you.status === 'called'
  const cashed = you.status === 'out'
  const dead = you.status === 'called'

  const soldPayoutX =
    cashed && you.exitX !== null && you.entryX !== null
      ? Math.min(25, you.exitX / you.entryX)
      : null
  const ticketPayoutX = cashed ? soldPayoutX : dead ? null : reel.payoutX
  const ticketPnlEth = cashed
    ? soldPayoutX !== null
      ? you.stakeEth * (soldPayoutX - 1)
      : null
    : dead
      ? -you.stakeEth
      : reel.pnlEth

  const position: Position | null = hasTicket
    ? {
        ticker: reel.ticker,
        leverage: reel.leverage,
        side: 'long',
        stakeEth: you.stakeEth,
        entryX: you.entryX ?? 1,
        payoutX: ticketPayoutX ?? 1,
        pnlEth: ticketPnlEth ?? 0,
        roundId: reel.roundId,
        openedAtLabel: you.openedAtLabel,
      }
    : null

  const stamp: TicketStamp = cashed ? 'cashed' : dead ? 'liquidated' : 'none'

  const ticket = position ? (
    <Ticket position={position} payoutX={ticketPayoutX} pnlEth={ticketPnlEth} stamp={stamp} />
  ) : null

  /* Console props, built once: the page renders the console twice (the
   * welded copy on phones, the panel copy in the rail from lg), and
   * both copies MUST read the same values so they can never disagree.
   *
   * Live mode tightens canBuy: entries only exist during the betting
   * window (the contract rejects mid-round buys), and the stake must
   * clear the on-chain 2%-of-bankroll max as well as the wallet. */
  const liveCanBuy =
    reel.phase === 'intermission' &&
    stakeEth <= reel.session.buyingPowerEth &&
    (reel.liveMaxStakeEth <= 0 || stakeEth <= reel.liveMaxStakeEth)
  const consoleProps = {
    phase: reel.phase,
    stakeEth,
    onStake: setStakeEth,
    autoSell,
    onAutoSell: setAutoSell,
    autoSellAtX,
    onAutoSellAtX: setAutoSellAtX,
    sound,
    onSound: setSound,
    holding: you.status === 'in',
    queued: you.status === 'queued',
    payoutX: reel.payoutX,
    pnlEth: reel.pnlEth,
    cashed,
    canBuy: live ? liveCanBuy : stakeEth <= reel.session.buyingPowerEth,
    onBuy: () => reel.buy(stakeEth),
    onCashOut: () => reel.sell(),
    live,
    liveMaxStakeEth: reel.liveMaxStakeEth,
  }

  /* Your seat is built here rather than living in the roster, so the
   * rail can never claim you are holding while the console says flat. */
  const yourSeat: Player | null = position
    ? {
        handle: 'you',
        tint: '#ffc247',
        entryX: position.entryX,
        atX: cashed ? (you.exitX ?? reel.currentX) : reel.currentX,
        pnlEth: ticketPnlEth ?? 0,
        status: cashed ? 'out' : dead ? 'called' : 'holding',
      }
    : null

  return (
    <>
      <div className="sticky top-14 z-30">
        <ResultsStrip liveX={reel.currentX} phase={reel.phase} results={reel.results} />
      </div>

      {live && reel.liveError && (
        <div className="mx-auto max-w-[1560px] px-3 pt-3 sm:px-5" data-testid="live-error">
          <p className="rounded-tag border border-down/40 bg-down/10 px-3 py-2 text-xs text-ink" role="alert">
            {reel.liveError}
          </p>
        </div>
      )}

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
            <PlayersRail players={reel.players} watching={reel.watching} you={yourSeat} />
          </div>

          <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-none">
            <Machine phase={reel.phase}>
              <Felt
                round={round}
                phase={reel.phase}
                candles={reel.candles}
                revealCount={reel.revealCount}
                position={you.status === 'in' ? position : null}
                payoutX={you.status === 'in' ? reel.payoutX : null}
                ticket={ticket}
              />
              {/* Welded under the felt on a phone, where a right-hand
               * rail does not exist and the thumb is at the bottom. */}
              <div className="lg:hidden">
                <Console {...consoleProps} />
              </div>
            </Machine>

            {/* On a phone the console is welded above, so the paper
             * really is coming out of that slot. Centred here is right
             * because the whole page is one centred column. */}
            {ticket && <div className="flex justify-center lg:hidden">{ticket}</div>}

            <QueueRail round={round} phase={reel.phase} results={reel.results} />
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
              <Console variant="panel" {...consoleProps} />
            </div>
            <FeedRail items={reel.feed} />
          </div>
        </div>
      </div>

      <HowItWorks />
    </>
  )
}
