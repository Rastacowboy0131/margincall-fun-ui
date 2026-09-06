/* ------------------------------------------------------------------ *
 * Live mode chain config: the single source of truth for every
 * address, chain id and endpoint live mode touches. Same rule as
 * margincall-ui's lib/chain-config.js: nothing else hardcodes these.
 *
 * Currently pointed at the Robinhood Chain TESTNET deploy
 * (contracts repo DEPLOYMENTS.md, no-min-stake build 2026-09-06).
 * ------------------------------------------------------------------ */

export const CONTRACT_ADDRESS = '0x9ba7baff650080ca55b0e68550b18e45bf096cb0' as const

/** Operator service (railway): ws feed, tick signing, round state. */
export const OPERATOR_HTTP = 'https://margincall-operator-production.up.railway.app'
export const OPERATOR_WS = 'wss://margincall-operator-production.up.railway.app/ws'

/** EIP-3085 shape for wallet_addEthereumChain. */
export const LIVE_CHAIN = {
  chainId: 46630,
  chainIdHex: '0xb626',
  chainName: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.testnet.chain.robinhood.com'],
  blockExplorerUrls: ['https://explorer.testnet.chain.robinhood.com'],
} as const

export function isLiveConfigured(): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS) && OPERATOR_HTTP.startsWith('http')
}
