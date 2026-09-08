/* The product's destinations. Six tabs in the header; the phone's tab
 * bar carries five and reaches referrals from the rewards page. */

export interface Destination {
  href: string
  label: string
  icon: 'trade' | 'portfolio' | 'history' | 'leaderboard' | 'rewards' | 'referrals'
  /** Shown in the phone tab bar. */
  mobile: boolean
}

export const DESTINATIONS: Destination[] = [
  { href: '/', label: 'Trade', icon: 'trade', mobile: true },
  { href: '/portfolio', label: 'Portfolio', icon: 'portfolio', mobile: true },
  { href: '/history', label: 'History', icon: 'history', mobile: true },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard', mobile: true },
  { href: '/rewards', label: 'Rewards', icon: 'rewards', mobile: true },
  { href: '/referrals', label: 'Referrals', icon: 'referrals', mobile: false },
]
