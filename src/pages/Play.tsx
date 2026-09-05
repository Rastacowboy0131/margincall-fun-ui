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
 * column is the machine — felt and console as a single moulded object —
 * with the other players down the left and what is coming next down the
 * right. Below lg the same three regions become one stack in the order
 * that matters on a phone: play, then who else is here, then what is
 * next, then the feed.
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

      <div className="mx-auto max-w-[1560px] px-3 py-3 sm:px-5 lg:py-5">
        <h1 className="sr-only">Margin Call — the table</h1>

        {/* grid-cols-1 is load-bearing: without an explicit base column
         * the children land in an implicit max-content track and the
         * scroll rails inside them blow the page out sideways. */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[262px_minmax(0,1fr)_292px]">
          <div className="order-2 min-w-0 lg:order-none">
            <PlayersRail players={reel.players} watching={reel.watching} you={yourSeat} />
          </div>

          <div className="order-1 min-w-0 lg:order-none">
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
              <Console
                phase={reel.phase}
                stakeEth={stakeEth}
                onStake={setStakeEth}
                autoSell={autoSell}
                onAutoSell={setAutoSell}
                autoSellAtX={autoSellAtX}
                onAutoSellAtX={setAutoSellAtX}
                sound={sound}
                onSound={setSound}
                holding={you.status === 'in'}
                queued={you.status === 'queued'}
                payoutX={reel.payoutX}
                pnlEth={reel.pnlEth}
                cashed={cashed}
                canBuy={stakeEth <= reel.session.buyingPowerEth}
                onBuy={() => reel.buy(stakeEth)}
                onCashOut={() => reel.sell()}
              />
            </Machine>

            {/* Below xl there is no room on the felt for the ticket, so
             * it sits directly under the slot it came out of. */}
            {ticket && (
              <div className="mt-4 flex justify-center xl:hidden">{ticket}</div>
            )}
          </div>

          <div className="order-3 flex min-w-0 flex-col gap-4 lg:order-none">
            <QueueRail round={round} phase={reel.phase} queue={reel.queue} />
            <FeedRail items={reel.feed} />
          </div>
        </div>
      </div>

      <HowItWorks />
    </>
  )
}
