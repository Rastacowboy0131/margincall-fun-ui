import { useState } from 'react'
import { CHAIN } from '../../data/sample'
import { LIVE_CHAIN } from '../../lib/live/config'
import { hasWallet } from '../../lib/live/chain'
import { goLive } from '../../lib/mode'
import { Icon } from '../ui/Icon'
import { Sheet } from '../ui/Sheet'

/* Connect. Every row funnels into the same EIP-1193 connect; rows
 * exist so the player recognises their wallet. The marks are abstract
 * shapes in each wallet's brand colour, not redrawn logos. */

const WALLETS = [
  { id: 'robinhood', name: 'Robinhood Wallet', note: 'Native to this chain', tint: '#9dff3f' },
  { id: 'metamask', name: 'MetaMask', note: 'Browser extension', tint: '#f6851b' },
  { id: 'walletconnect', name: 'WalletConnect', note: 'Scan with any wallet', tint: '#3b99fc' },
  { id: 'coinbase', name: 'Coinbase Wallet', note: 'App or extension', tint: '#0052ff' },
]

export function ConnectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    if (busy) return
    setError(null)
    if (!hasWallet()) {
      setError('No wallet extension found. Install MetaMask (or any injected wallet) and reload.')
      return
    }
    setBusy(true)
    try {
      await goLive()
      onClose()
    } catch (err) {
      setError((err as Error)?.message ?? String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      labelId="connect-sheet-title"
      title="Go live"
      subtitle={`Real ETH on ${LIVE_CHAIN.chainName}. Real margin calls.`}
    >
      <ul className="overflow-hidden rounded-ctl border border-line" data-testid="connect-wallets">
        {WALLETS.map((w, i) => (
          <li key={w.id} className={i > 0 ? 'border-t border-line' : undefined}>
            <button
              type="button"
              onClick={connect}
              disabled={busy}
              data-testid={`connect-${w.id}`}
              className="flex min-h-[56px] w-full items-center gap-3 px-3 text-left transition-colors hover:bg-surface-2 disabled:opacity-60"
            >
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-pill" style={{ background: w.tint }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{w.name}</span>
                <span className="block truncate text-xs text-ink-3">{busy ? 'Connecting…' : w.note}</span>
              </span>
              <Icon name="chevron" size={16} className="-rotate-90 shrink-0 text-ink-3" />
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <p className="mt-3 rounded-ctl border border-down/40 bg-down-wash px-3 py-2 text-xs text-ink" role="alert">
          {error}
        </p>
      )}

      <p className="mt-4 text-xs text-ink-3">
        Your paper balance stays in this browser either way. Live mode settles on chain, house edge{' '}
        {CHAIN.houseEdgePct}%, stated openly.
      </p>
    </Sheet>
  )
}
