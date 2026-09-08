import { CHAIN } from '../../data/sample'
import { useReel } from '../../lib/useReel'
import { getAddress } from '../../lib/mode'
import { LIVE_CHAIN } from '../../lib/live/config'
import { eth, signedEth } from '../../lib/format'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'
import { Tag } from '../ui/Tag'
import { cx } from '../../lib/cx'

/* The wallet sheet. Four figures that have to add up, and the two
 * things you can do about them. Reset is last, in the loss colour. */

export function BalanceSheet({ open, onClose, onGoLive }: {
  open: boolean
  onClose: () => void
  onGoLive: () => void
}) {
  const { session, resetAccount, mode } = useReel()
  const live = mode === 'live'
  const addr = getAddress()
  const addrShort = addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''

  const rows: Array<[string, string, string]> = [
    ['Buying power', `${eth(session.buyingPowerEth)} ETH`, 'text-ink'],
    ['At risk', `${eth(session.atRiskEth)} ETH`, 'text-ink'],
    ['Session P&L', `${signedEth(session.netPnlEth, 4)} ETH`, session.netPnlEth < 0 ? 'text-down' : 'text-up'],
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
        <Tag tone={live ? 'lime' : 'quiet'}>{live ? 'Live, on chain' : 'Paper'}</Tag>
        {live && <span className="num text-xs text-ink-3">{addrShort}</span>}
      </div>

      <dl className="overflow-hidden rounded-ctl border border-line">
        {rows.map(([label, value, tone], i) => (
          <div key={label} className={cx('flex items-baseline justify-between gap-4 px-3.5 py-3', i > 0 && 'border-t border-line')}>
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className={cx('num text-sm font-medium', tone)}>{value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t border-line bg-surface-2 px-3.5 py-3.5">
          <dt className="text-sm font-medium text-ink">Account value</dt>
          <dd className="num text-lg font-semibold text-ink">{eth(session.accountValueEth, 4)} ETH</dd>
        </div>
      </dl>

      {!live && (
        <>
          <Button variant="lime" size="xl" full className="mt-4" onClick={onGoLive}>
            Go live on {CHAIN.networkName}
          </Button>
          <div className="mt-5 border-t border-line pt-4">
            <Button variant="ghost" size="md" full onClick={resetAccount}>
              <span className="text-down">Reset paper balance</span>
            </Button>
            <p className="mt-2 text-xs text-ink-3">
              Puts you back to {eth(CHAIN.paperStartEth, 0)} ETH and wipes this session&rsquo;s log.
            </p>
          </div>
        </>
      )}
    </Sheet>
  )
}
