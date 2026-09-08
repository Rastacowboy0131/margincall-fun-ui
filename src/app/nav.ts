/* The product's destinations, in one list. Four is what a labelled tab
 * bar carries at 360px. Fairness is reached from the sky itself. */

export interface Destination {
  href: string
  label: string
  icon: 'play' | 'me' | 'board' | 'rewards'
}

export const DESTINATIONS: Destination[] = [
  { href: '/', label: 'Launch', icon: 'play' },
  { href: '/board', label: 'Board', icon: 'board' },
  { href: '/me', label: 'Me', icon: 'me' },
  { href: '/rewards', label: 'Rewards', icon: 'rewards' },
]
