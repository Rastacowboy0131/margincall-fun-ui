import { useEffect, useState } from 'react'
import type { Player, Position, Round } from '../data/types'
import { useReel } from '../lib/useReel'
import { ResultsStrip } from '../components/shell/ResultsStrip'
import { Sky } from '../components/table/Sky'
import { Cockpit, floorSig } from '../components/table/Cockpit'
import { PositionCard, type TicketStamp } from '../components/table/PositionCard'
import { Crew } from '../components/table/Crew'
import { FeedRail } from '../components/table/FeedRail'
import { HowItWorks } from '../components/table/HowItWorks'

/* ------------------------------------------------------------------ *
 * The launch.
 *
 *   [ crew ] [ sky                    ]
 *   [      ] [ cockpit                ]
 *   [      ] [ your seat, radio       ]
 *
 * Below lg it is one column: sky, cockpit, seat, crew along a rail,
 * radio. Everything that changes over time comes out of useReel.
 * ------------------------------------------------------------------ */

const YOU_TINT = '#ffcf5a'

export function Play() {
  const reel = useReel()
  const [stakeEth, setStakeEth] = useState(0.01)
  const [autoSell, setAutoSell] = useState(false)
  const [autoSellAtX, setAutoSellAtX] = useState(2)
  const [sound, setSound] = useState(true)
  const [ejected, setEjected] = useState<{ n: number; payoutX: number; pnlEth: number } | null>(null)

  const { you } = reel
  const live = reel.mode === 'live'

  useEffect(() => {
    if (live && reel.liveMaxStakeEth > 0 && stakeEth > reel.liveMaxStakeEth) setStakeEth(floorSig(reel.liveMaxStakeEth))
  }, [live, reel.liveMaxStakeEth, stakeEth])

  const sell = () => {
    const p = reel.payoutX, pnl = reel.pnlEth
    if (reel.sell() && p !== null && pnl !== null) setEjected((e) => ({ n: (e?.n ?? 0) + 1, payoutX: p, pnlEth: pnl }))
  }

  useEffect(() => {
    if (!autoSell || reel.phase !== 'live' || you.status !== 'in') return
    if (reel.payoutX !== null && reel.payoutX >= autoSellAtX) sell()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSell, autoSellAtX, reel.payoutX, reel.phase, you.status])

  const round: Round = {
    id: reel.roundId, ticker: reel.ticker, leverage: reel.leverage, phase: reel.phase, currentX: reel.currentX,
    elapsedSec: reel.elapsedSec, ruggedAtX: reel.ruggedAtX, opensInSec: reel.opensInSec, holding: reel.holding, watching: reel.watching,
  }

  const hasTicket = you.status === 'in' || you.status === 'out' || you.status === 'called'
  const cashed = you.status === 'out', dead = you.status === 'called'
  const soldPayoutX = cashed && you.exitX !== null && you.entryX !== null ? Math.min(25, you.exitX / you.entryX) : null
  const ticketPayoutX = cashed ? soldPayoutX : dead ? null : reel.payoutX
  const ticketPnlEth = cashed ? (soldPayoutX !== null ? you.stakeEth * (soldPayoutX - 1) : null) : dead ? -you.stakeEth : reel.pnlEth

  const position: Position | null = hasTicket
    ? { ticker: reel.ticker, leverage: reel.leverage, side: 'long', stakeEth: you.stakeEth, entryX: you.entryX ?? 1, payoutX: ticketPayoutX ?? 1, pnlEth: ticketPnlEth ?? 0, roundId: reel.roundId, openedAtLabel: you.openedAtLabel }
    : null
  const stamp: TicketStamp = cashed ? 'cashed' : dead ? 'liquidated' : 'none'

  const liveCanBuy = reel.phase === 'intermission' && stakeEth <= reel.session.buyingPowerEth && (reel.liveMaxStakeEth <= 0 || stakeEth <= reel.liveMaxStakeEth)

  const yourSeat: Player | null = position
    ? { handle: 'you', tint: YOU_TINT, entryX: position.entryX, atX: cashed ? (you.exitX ?? reel.currentX) : reel.currentX, pnlEth: ticketPnlEth ?? 0, status: cashed ? 'out' : dead ? 'called' : 'holding' }
    : null

  return (
    <>
      <div className="sticky top-16 z-30">
        <ResultsStrip liveX={reel.currentX} phase={reel.phase} opensInSec={reel.opensInSec} results={reel.results} />
      </div>

      {live && reel.liveError && (
        <div className="mx-auto max-w-[1440px] px-4 pt-3 sm:px-6" data-testid="live-error">
          <p className="rounded-ctl border border-down/40 bg-down-wash px-3 py-2 text-xs text-ink" role="alert">{reel.liveError}</p>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:py-5">
        <h1 className="sr-only">Margin Call, the launch</h1>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="order-2 min-w-0 lg:order-none">
            <Crew players={reel.players} watching={reel.watching} you={yourSeat} />
          </div>
          <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-none">
            <Sky round={round} phase={reel.phase} position={you.status === 'in' ? position : null} payoutX={you.status === 'in' ? reel.payoutX : null} ejected={ejected} />
            <Cockpit
              phase={reel.phase} stakeEth={stakeEth} onStake={setStakeEth}
              autoSell={autoSell} onAutoSell={setAutoSell} autoSellAtX={autoSellAtX} onAutoSellAtX={setAutoSellAtX}
              sound={sound} onSound={setSound}
              holding={you.status === 'in'} queued={you.status === 'queued'} payoutX={reel.payoutX} pnlEth={reel.pnlEth} cashed={cashed}
              canBuy={live ? liveCanBuy : stakeEth <= reel.session.buyingPowerEth}
              onBuy={() => reel.buy(stakeEth)} onCashOut={sell}
              live={live} liveMaxStakeEth={reel.liveMaxStakeEth}
            />
            {position && <PositionCard position={position} payoutX={ticketPayoutX} pnlEth={ticketPnlEth} stamp={stamp} />}
          </div>
          <div className="order-3 min-w-0 lg:col-start-2">
            <FeedRail items={reel.feed} />
          </div>
        </div>
      </div>

      <HowItWorks />
    </>
  )
}
