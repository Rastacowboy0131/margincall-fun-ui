import { useState } from 'react'
import { CHAIN } from '../../data/sample'
import { LIVE_CHAIN } from '../../lib/live/config'
import { hasWallet } from '../../lib/live/chain'
import { goLive } from '../../lib/mode'
import { Icon } from '../ui/Icon'
import { Sheet } from '../ui/Sheet'

/* ------------------------------------------------------------------ *
 * Connect.
 *
 * Nora: this is the seam. The rows below are a list of names and marks
 * and nothing else — no provider objects, no connector instances, no
 * chain switching. Wire each row's onClick to your connector and the
 * layout does not change.
 *
 * The marks are abstract shapes in each wallet's brand colour rather
 * than their actual logos: shipping a redrawn approximation of someone
 * else's mark is worse than not shipping it. Swap in the real assets
 * when you have licence to.
 * ------------------------------------------------------------------ */

const WALLETS = [
  { id: 'robinhood', name: 'Robinhood Wallet', note: 'Native to this chain', tint: '#9dff3f', dark: true },
  { id: 'metamask', name: 'MetaMask', note: 'Browser extension', tint: '#f6851b', dark: true },
  { id: 'walletconnect', name: 'WalletConnect', note: 'Scan with any wallet', tint: '#3b99fc', dark: false },
  { id: 'coinbase', name: 'Coinbase Wallet', note: 'App or extension', tint: '#0052ff', dark: false },
]

export function ConnectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Every row funnels into the same EIP-1193 connect: the injected
  // provider decides which wallet answers. Rows exist so the player
  // recognises their wallet, not because we run four connectors.
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
      <ul className="flex flex-col gap-2" data-testid="connect-wallets">
        {WALLETS.map((w) => (
          <li key={w.id}>
            <button
              type="button"
              onClick={connect}
              disabled={busy}
              data-testid={`connect-${w.id}`}
              className="key-3d flex min-h-[60px] w-full items-center gap-3 rounded-key border border-rim bg-panel-2 px-3 text-left [--key-depth:3px] [--key-under:var(--color-void)] disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-tag"
                style={{ background: w.tint }}
              >
                <span
                  className="size-4 rounded-chip border-[3px]"
                  style={{ borderColor: w.dark ? 'var(--color-void)' : '#ffffff' }}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-bold text-ink">{w.name}</span>
                <span className="block truncate text-xs text-ink-3">{busy ? 'Connecting…' : w.note}</span>
              </span>
              <Icon name="chevron" size={18} className="-rotate-90 shrink-0 text-ink-3" />
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <p className="mt-3 rounded-tag border border-down/40 bg-down/10 px-3 py-2 text-xs text-ink" role="alert">
          {error}
        </p>
      )}

      <p className="mt-4 text-xs text-ink-3">
        Your paper balance stays in this browser either way. Live mode settles on chain, house
        edge {CHAIN.houseEdgePct}%, stated openly.
      </p>
    </Sheet>
  )
}
