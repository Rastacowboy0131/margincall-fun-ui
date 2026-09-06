import { CHAIN } from '../../data/sample'
import { useReel } from '../../lib/useReel'
import { getAddress } from '../../lib/mode'
import { LIVE_CHAIN } from '../../lib/live/config'
import { eth, signedEth } from '../../lib/format'
import { Key } from '../ui/Key'
import { Sheet } from '../ui/Sheet'
import { Tag } from '../ui/Tag'

/* The wallet sheet. Four figures that have to add up, and the two
 * things you can do about them.
 *
 * Reset is destructive and it is the last thing in the sheet, in the
 * loss colour, with the consequence spelled out under it — easy reach
 * and easy mis-tap are the same pixels, and this one wipes a session. */

export function BalanceSheet({ open, onClose, onGoLive }: {
  open: boolean
  onClose: () => void
  onGoLive: () => void
}) {
  const { session, resetAccount, mode } = useReel()
  const live = mode === 'live'
  const addr = getAddress()
  const addrShort = addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—'

  const rows: Array<[string, string, string]> = [
    ['Buying power', `${eth(session.buyingPowerEth)} ETH`, 'text-ink'],
    ['At risk (open position)', `${eth(session.atRiskEth)} ETH`, 'text-ink'],
    [
      'Session net P&L',
      `${signedEth(session.netPnlEth, 4)} ETH`,
      session.netPnlEth < 0 ? 'text-down' : 'text-up',
    ],
  ]

  return (
    <Sheet
      open={open}
      onClose={onClose}
      labelId="balance-sheet-title"
      title="Your money"
      subtitle={
        live
          ? `Live on ${LIVE_CHAIN.chainName}. Buying power is your wallet balance.`
          : `Paper trading. Nothing here has touched ${CHAIN.networkName}.`
      }
    >
      <div className="mb-4 flex items-center gap-2">
        <Tag tone="gold">{live ? 'Live · on chain' : 'Demo · paper'}</Tag>
        <span className="nums text-xs text-ink-3">{live ? addrShort : ''}</span>
      </div>

      <dl className="overflow-hidden rounded-key border border-rim">
        {rows.map(([label, value, tone], i) => (
          <div
            key={label}
            className={`flex items-baseline justify-between gap-4 px-3.5 py-3 ${i > 0 ? 'border-t border-rim' : ''}`}
          >
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className={`nums text-sm font-bold ${tone}`}>{value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t-2 border-rim-hi bg-void px-3.5 py-3.5">
          <dt className="text-sm font-bold text-ink">Account value</dt>
          <dd className="nums text-lg font-extrabold text-gold">
            {eth(session.accountValueEth, 4)} ETH
          </dd>
        </div>
      </dl>

      {!live && (
        <Key variant="cash" size="xl" full className="mt-4" onClick={onGoLive}>
          Go live on {CHAIN.networkName}
        </Key>
      )}

      {!live && (
        <div className="mt-5 border-t border-rim pt-4">
          <Key variant="quiet" size="md" full onClick={resetAccount}>
            <span className="text-down">Reset paper balance</span>
          </Key>
          <p className="mt-2 text-xs text-ink-3">
            Puts you back to {eth(CHAIN.paperStartEth, 0)} ETH and wipes this session&rsquo;s log.
            Your leaderboard entries stay where everyone can see them.
          </p>
        </div>
      )}
    </Sheet>
  )
}
