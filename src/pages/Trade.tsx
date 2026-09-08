import { useEffect, useRef, useState } from 'react'
import type { Player, Position, Round } from '../data/types'
import { useReel } from '../lib/useReel'
import { signedEth, stake as fmtStake, x } from '../lib/format'
import { toast } from '../lib/toast'
import { ResultsStrip } from '../components/shell/ResultsStrip'
import { ChartCard } from '../components/table/ChartCard'
import { OrderPanel, floorSig } from '../components/table/OrderPanel'
import { PlayersRail } from '../components/table/PlayersRail'
import { FeedRail } from '../components/table/FeedRail'
import { SettledRail } from '../components/table/SettledRail'
import { HowItWorks } from '../components/table/HowItWorks'

/* ------------------------------------------------------------------ *
 * The trade screen.
 *
 *   [ players ] [ chart                    ] [ order panel ]
 *   [ activity feed                        ] [ settled     ]
 *
 * Below lg: chart, order panel, previous rounds, players, feed. Everything
 * that changes over time comes out of useReel; the state here is the order
 * form. Toasts announce fills, cash-outs and liquidations so you hear
 * about your money even when the panel has scrolled away.
 * ------------------------------------------------------------------ */

const YOU_TINT = '#2a3128'

export function Trade() {
  const reel = useReel()
  const [stakeEth, setStakeEth] = useState(0.01)
  const [autoSell, setAutoSell] = useState(false)
  const [autoSellAtX, setAutoSellAtX] = useState(2)
  const [sound, setSound] = useState(true)

  const { you } = reel
  const live = reel.mode === 'live'

  useEffect(() => {
    if (live && reel.liveMaxStakeEth > 0 && stakeEth > reel.liveMaxStakeEth) setStakeEth(floorSig(reel.liveMaxStakeEth))
  }, [live, reel.liveMaxStakeEth, stakeEth])

  const buy = () => { if (reel.buy(stakeEth)) toast({ tone: reel.phase === 'live' ? 'lime' : 'amber', title: reel.phase === 'live' ? `Bought ${reel.ticker.symbol} at ${x(reel.currentX)}` : `Queued ${reel.ticker.symbol} for the open`, body: `${fmtStake(stakeEth)} ETH · ${reel.leverage}x long` }) }
  const sell = () => {
    const p = reel.payoutX, pnl = reel.pnlEth, sym = reel.ticker.symbol
    if (reel.sell() && p !== null && pnl !== null) toast({ tone: pnl >= 0 ? 'lime' : 'amber', title: `Sold ${sym} at ${x(p)}`, body: `${signedEth(pnl, 4)} ETH realised` })
  }

  useEffect(() => {
    if (!autoSell || reel.phase !== 'live' || you.status !== 'in') return
    if (reel.payoutX !== null && reel.payoutX >= autoSellAtX) sell()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSell, autoSellAtX, reel.payoutX, reel.phase, you.status])

  /* the liquidation notice, once per call */
  const lastStatus = useRef(you.status)
  useEffect(() => {
    if (you.status === 'called' && lastStatus.current === 'in') toast({ tone: 'down', title: 'Your position has been closed', body: `${reel.leverage}x long ${reel.ticker.symbol} liquidated at ${x(reel.currentX)} · -${fmtStake(you.stakeEth)} ETH` })
    lastStatus.current = you.status
  }, [you.status, reel.leverage, reel.ticker.symbol, reel.currentX, you.stakeEth])

  const round: Round = { id: reel.roundId, ticker: reel.ticker, leverage: reel.leverage, phase: reel.phase, currentX: reel.currentX, elapsedSec: reel.elapsedSec, ruggedAtX: reel.ruggedAtX, opensInSec: reel.opensInSec, holding: reel.holding, watching: reel.watching }

  const cashed = you.status === 'out', dead = you.status === 'called'
  const holding = you.status === 'in'
  const position: Position | null = holding || cashed || dead
    ? { ticker: reel.ticker, leverage: reel.leverage, side: 'long', stakeEth: you.stakeEth, entryX: you.entryX ?? 1, payoutX: reel.payoutX ?? 1, pnlEth: reel.pnlEth ?? 0, roundId: reel.roundId, openedAtLabel: you.openedAtLabel }
    : null
  const soldPayoutX = cashed && you.exitX !== null && you.entryX !== null ? Math.min(25, you.exitX / you.entryX) : null
  const seatPnl = holding ? (reel.pnlEth ?? 0) : cashed && soldPayoutX !== null ? you.stakeEth * (soldPayoutX - 1) : dead ? -you.stakeEth : 0
  const yourSeat: Player | null = position ? { handle: 'you', tint: YOU_TINT, entryX: position.entryX, atX: cashed ? (you.exitX ?? reel.currentX) : reel.currentX, pnlEth: seatPnl, status: holding ? 'holding' : cashed ? 'out' : 'called' } : null

  const liveCanBuy = reel.phase === 'intermission' && stakeEth <= reel.session.buyingPowerEth && (reel.liveMaxStakeEth <= 0 || stakeEth <= reel.liveMaxStakeEth)

  return (
    <>
      <div className="sticky top-14 z-30"><ResultsStrip liveX={reel.currentX} phase={reel.phase} opensInSec={reel.opensInSec} results={reel.results} /></div>
      {live && reel.liveError && (
        <div className="mx-auto max-w-[1560px] px-4 pt-3 sm:px-6" data-testid="live-error"><p className="rounded-ctl border border-down/40 bg-down-wash px-3 py-2 text-xs text-ink" role="alert">{reel.liveError}</p></div>
      )}
      <div className="mx-auto max-w-[1560px] px-4 py-4 sm:px-6 lg:py-5">
        <h1 className="sr-only">Margin Call, trade</h1>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
          <div className="order-3 min-w-0 lg:order-none lg:h-full"><PlayersRail players={reel.players} watching={reel.watching} you={yourSeat} /></div>
          <div className="order-1 min-w-0 lg:order-none">
            <ChartCard round={round} phase={reel.phase} candles={reel.candles} revealCount={reel.revealCount} position={holding ? position : null} payoutX={holding ? reel.payoutX : null} pnlEth={holding ? reel.pnlEth : null} sound={sound} onSound={setSound} />
          </div>
          <div className="order-2 min-w-0 lg:order-none">
            <OrderPanel phase={reel.phase} stakeEth={stakeEth} onStake={setStakeEth} autoSell={autoSell} onAutoSell={setAutoSell} autoSellAtX={autoSellAtX} onAutoSellAtX={setAutoSellAtX}
              position={holding ? position : null} payoutX={reel.payoutX} pnlEth={reel.pnlEth} queued={you.status === 'queued'} cashed={cashed}
              canBuy={live ? liveCanBuy : stakeEth <= reel.session.buyingPowerEth} onBuy={buy} onCashOut={sell} live={live} liveMaxStakeEth={reel.liveMaxStakeEth} leverage={reel.leverage} buyingPowerEth={reel.session.buyingPowerEth} />
          </div>
          <div className="order-4 min-w-0 lg:order-none lg:col-span-2"><FeedRail items={reel.feed} /></div>
          <div className="order-5 min-w-0 lg:order-none"><SettledRail round={round} phase={reel.phase} results={reel.results} /></div>
        </div>
      </div>
      <HowItWorks />
    </>
  )
}
