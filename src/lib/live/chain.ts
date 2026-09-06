/* ------------------------------------------------------------------ *
 * Live mode chain adapter. Ported from margincall-ui's lib/chain.js
 * (same contract, same rules): wallet connect with add-chain prompt,
 * reads via a public client, writes through the injected wallet, and
 * NOTHING resolves before the tx receipt says success (launch
 * checklist rule 5). All wei -> ETH conversion happens here; no
 * component ever sees a bigint.
 * ------------------------------------------------------------------ */

import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  http,
  parseEther,
  type Address,
  type PublicClient,
} from 'viem'
import { CONTRACT_ADDRESS, LIVE_CHAIN, OPERATOR_HTTP } from './config'

export const MARGINCALL_ABI = [
  { type: 'function', name: 'lastRoundId', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'nextRoundOpensAt', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint64' }] },
  { type: 'function', name: 'maxStake', stateMutability: 'view', inputs: [{ name: 'roundId', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'paused', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'operator', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  {
    type: 'function', name: 'rounds', stateMutability: 'view',
    inputs: [{ type: 'uint256' }],
    outputs: [
      { name: 'commitHash', type: 'bytes32' },
      { name: 'phase', type: 'uint8' },
      { name: 'openedAt', type: 'uint64' },
      { name: 'lockedAt', type: 'uint64' },
      { name: 'totalStaked', type: 'uint128' },
      { name: 'seed', type: 'bytes32' },
    ],
  },
  {
    type: 'function', name: 'entries', stateMutability: 'view',
    inputs: [{ type: 'uint256' }, { type: 'address' }],
    outputs: [
      { name: 'stake', type: 'uint128' },
      { name: 'cashedOut', type: 'bool' },
      { name: 'refunded', type: 'bool' },
    ],
  },
  { type: 'function', name: 'buy', stateMutability: 'payable', inputs: [{ name: 'roundId', type: 'uint256' }], outputs: [] },
  {
    type: 'function', name: 'cashOut', stateMutability: 'nonpayable',
    inputs: [
      { name: 'roundId', type: 'uint256' },
      { name: 'multipleX1e6', type: 'uint64' },
      { name: 'expiry', type: 'uint64' },
      { name: 'sig', type: 'bytes' },
    ],
    outputs: [],
  },
  { type: 'function', name: 'refund', stateMutability: 'nonpayable', inputs: [{ name: 'roundId', type: 'uint256' }], outputs: [] },
] as const

export const CHAIN_PHASE = ['none', 'open', 'live', 'settled', 'canceled'] as const

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    ethereum?: any
  }
}

export function hasWallet(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum
}

const viemChain = {
  id: LIVE_CHAIN.chainId,
  name: LIVE_CHAIN.chainName,
  nativeCurrency: LIVE_CHAIN.nativeCurrency,
  rpcUrls: { default: { http: [...LIVE_CHAIN.rpcUrls] } },
}

let pub: PublicClient | null = null
export function publicClient(): PublicClient {
  if (!pub) pub = createPublicClient({ chain: viemChain, transport: http(LIVE_CHAIN.rpcUrls[0]) }) as PublicClient
  return pub
}

function walletClient() {
  if (!hasWallet()) throw new Error('No injected wallet (window.ethereum)')
  return createWalletClient({ chain: viemChain, transport: custom(window.ethereum) })
}

/** Connect the injected wallet and switch/add Robinhood Chain testnet.
 *  EIP-3326 switch first, EIP-3085 add on 4902. Returns the address. */
export async function connectWallet(): Promise<Address> {
  if (!hasWallet()) throw new Error('No injected wallet found')
  const [addr] = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as Address[]
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: LIVE_CHAIN.chainIdHex }],
    })
  } catch (err: any) {
    if (err && (err.code === 4902 || err?.data?.originalError?.code === 4902)) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: LIVE_CHAIN.chainIdHex,
            chainName: LIVE_CHAIN.chainName,
            nativeCurrency: LIVE_CHAIN.nativeCurrency,
            rpcUrls: LIVE_CHAIN.rpcUrls,
            blockExplorerUrls: LIVE_CHAIN.blockExplorerUrls,
          },
        ],
      })
    } else {
      throw err
    }
  }
  return addr
}

export function onAccountsChanged(fn: (accounts: string[]) => void): () => void {
  if (!hasWallet()) return () => {}
  window.ethereum.on('accountsChanged', fn)
  return () => window.ethereum.removeListener('accountsChanged', fn)
}

/* ---- reads --------------------------------------------------------- */

export interface LiveRoundState {
  roundId: number
  phase: (typeof CHAIN_PHASE)[number]
  totalStakedEth: number
  maxStakeEth: number
  paused: boolean
  nextRoundOpensAt: number
  entry: { stakeEth: number; cashedOut: boolean; refunded: boolean } | null
}

export async function readRoundState(playerAddr?: Address | null): Promise<LiveRoundState> {
  const pc = publicClient()
  const contract = { address: CONTRACT_ADDRESS as Address, abi: MARGINCALL_ABI } as const
  const [roundId, nextOpens, paused] = await Promise.all([
    pc.readContract({ ...contract, functionName: 'lastRoundId' }),
    pc.readContract({ ...contract, functionName: 'nextRoundOpensAt' }),
    pc.readContract({ ...contract, functionName: 'paused' }),
  ])
  let phase: (typeof CHAIN_PHASE)[number] = 'none'
  let totalStaked = 0n
  let entry: LiveRoundState['entry'] = null
  let maxStake = 0n
  if (roundId > 0n) {
    const [r, ms] = await Promise.all([
      pc.readContract({ ...contract, functionName: 'rounds', args: [roundId] }),
      pc.readContract({ ...contract, functionName: 'maxStake', args: [roundId] }),
    ])
    phase = CHAIN_PHASE[Number(r[1])] ?? 'none'
    totalStaked = r[4]
    maxStake = ms
    if (playerAddr) {
      const e = await pc.readContract({ ...contract, functionName: 'entries', args: [roundId, playerAddr] })
      if (e[0] > 0n) entry = { stakeEth: Number(formatEther(e[0])), cashedOut: e[1], refunded: e[2] }
    }
  }
  return {
    roundId: Number(roundId),
    phase,
    totalStakedEth: Number(formatEther(totalStaked)),
    maxStakeEth: Number(formatEther(maxStake)),
    paused,
    nextRoundOpensAt: Number(nextOpens),
    entry,
  }
}

export async function readBalanceEth(addr: Address): Promise<number> {
  const wei = await publicClient().getBalance({ address: addr })
  return Number(formatEther(wei))
}

/* ---- writes (resolve only on confirmed receipts) ------------------- */

async function confirmed(hash: `0x${string}`) {
  const receipt = await publicClient().waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') throw new Error('Transaction reverted: ' + hash)
  return receipt
}

export async function buyLive(roundId: number, stakeEth: number, account: Address) {
  const wc = walletClient()
  const hash = await wc.writeContract({
    address: CONTRACT_ADDRESS as Address,
    abi: MARGINCALL_ABI,
    functionName: 'buy',
    args: [BigInt(roundId)],
    value: parseEther(String(stakeEth)),
    account,
    chain: viemChain,
  })
  return confirmed(hash)
}

/** Fetch an operator-signed tick over HTTP, then submit cashOut().
 *  Throws with .reason = 'operator' when the operator refuses. */
export async function cashOutLive(roundId: number, account: Address) {
  let tick: { multipleX1e6: string; expiry: string; signature: `0x${string}` }
  try {
    const res = await fetch(`${OPERATOR_HTTP}/cashout`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ roundId: String(roundId), player: account }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as any)
      const e: any = new Error('Operator refused: ' + (body.error || res.status))
      e.reason = 'operator'
      throw e
    }
    tick = await res.json()
  } catch (err: any) {
    if (err.reason === 'operator') throw err
    const e: any = new Error('Operator unreachable: ' + (err?.message || err))
    e.reason = 'operator'
    throw e
  }
  const wc = walletClient()
  const hash = await wc.writeContract({
    address: CONTRACT_ADDRESS as Address,
    abi: MARGINCALL_ABI,
    functionName: 'cashOut',
    args: [BigInt(roundId), BigInt(tick.multipleX1e6), BigInt(tick.expiry), tick.signature],
    account,
    chain: viemChain,
  })
  const receipt = await confirmed(hash)
  return { receipt, multipleX1e6: tick.multipleX1e6 }
}
