/* ------------------------------------------------------------------ *
 * The product's destinations, in one list.
 *
 * The old build had seven top-level tabs — Trade, Portfolio, History,
 * Leaderboard, Rewards, Referrals, plus a demo/live switch — which is
 * why nobody could find anything. Four is the number a labelled tab bar
 * can carry at 360px without the targets getting too narrow, so:
 *
 *   Portfolio + History  ->  Me       (your money and your log)
 *   Leaderboard          ->  Board
 *   Rewards + Referrals  ->  Rewards  (both are "the house pays you")
 *
 * Fairness is deliberately NOT a tab. It is reached from a badge on the
 * table itself, where the doubt actually occurs, and from the footer.
 * ------------------------------------------------------------------ */

export interface Destination {
  href: string
  label: string
  icon: 'play' | 'me' | 'board' | 'rewards'
}

export const DESTINATIONS: Destination[] = [
  { href: '/', label: 'Play', icon: 'play' },
  { href: '/board', label: 'Board', icon: 'board' },
  { href: '/me', label: 'Me', icon: 'me' },
  { href: '/rewards', label: 'Rewards', icon: 'rewards' },
]
