/* ------------------------------------------------------------------ *
 * PAPER | LIVE mode store. One module-level source of truth so the
 * header, the sheets and useReel can never disagree. Live mode is only
 * ever entered through goLive(), which connects the injected wallet
 * and switches/adds Robinhood Chain testnet first. Demo remains the
 * default; a persisted live session is only resumed silently when the
 * wallet still exposes the account (no popups on load).
 * ------------------------------------------------------------------ */

import type { Address } from 'viem'
import { connectWallet, hasWallet, onAccountsChanged } from './live/chain'

export type Mode = 'demo' | 'live'

const MODE_KEY = 'mcfun.mode.v1'

let mode: Mode = 'demo'
let address: Address | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const fn of listeners) fn()
}

export function subscribeMode(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getMode(): Mode {
  return mode
}

export function getAddress(): Address | null {
  return address
}

/** Connect the wallet (prompting), switch chain, enter live mode. */
export async function goLive(): Promise<Address> {
  const addr = await connectWallet()
  address = addr
  mode = 'live'
  try {
    localStorage.setItem(MODE_KEY, 'live')
  } catch { /* private browsing */ }
  emit()
  return addr
}

export function goPaper(): void {
  mode = 'demo'
  address = null
  try {
    localStorage.setItem(MODE_KEY, 'demo')
  } catch { /* private browsing */ }
  emit()
}

/** Resume a persisted live session without prompting. Called once. */
export async function resumeLive(): Promise<void> {
  try {
    if (localStorage.getItem(MODE_KEY) !== 'live' || !hasWallet()) return
    const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as Address[]
    if (accounts && accounts.length > 0) {
      address = accounts[0]
      mode = 'live'
      emit()
    } else {
      goPaper()
    }
  } catch {
    goPaper()
  }
}

// Losing the account drops us back to paper rather than stranding a
// live UI with no signer.
if (typeof window !== 'undefined') {
  onAccountsChanged((accounts) => {
    if (mode !== 'live') return
    if (!accounts || accounts.length === 0) goPaper()
    else {
      address = accounts[0] as Address
      emit()
    }
  })
  void resumeLive()
}
