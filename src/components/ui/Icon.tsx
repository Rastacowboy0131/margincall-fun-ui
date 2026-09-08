/* The icon set: one 24-unit grid, one stroke, round caps. Every icon is
 * aria-hidden; icon-only controls carry their own name. */

type IconName =
  | 'trade' | 'portfolio' | 'history' | 'leaderboard' | 'rewards' | 'referrals'
  | 'fair' | 'plus' | 'sound-on' | 'sound-off' | 'chevron' | 'copy' | 'check' | 'external' | 'up' | 'down' | 'users' | 'clock' | 'feed' | 'menu' | 'close' | 'info'

const PATHS: Record<IconName, string> = {
  trade: 'M3 17l5-6 4 4 4-6 5 6M3 21h18',
  portfolio: 'M4 7h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm4 0V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M3 12h18',
  history: 'M12 8v4l3 2M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 4v4h4',
  leaderboard: 'M5 20V11m7 9V4m7 16v-6M3 20h18',
  rewards: 'M4 11h16v9H4v-9ZM3 7h18v4H3V7Zm9 0v13M12 7S9.5 3 7.5 3.6 7 7 12 7Zm0 0s2.5-4 4.5-3.4S17 7 12 7Z',
  referrals: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0M16 4.5a3 3 0 0 1 0 5.9M21 20a6 6 0 0 0-4-5.6',
  fair: 'M12 3l7 3v5.5c0 4.2-2.9 7.6-7 8.5-4.1-.9-7-4.3-7-8.5V6l7-3Zm-3 8.5 2.2 2.2L15 9.8',
  plus: 'M12 6v12M6 12h12',
  'sound-on': 'M5 9.5h3l4-3.5v12l-4-3.5H5v-5ZM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',
  'sound-off': 'M5 9.5h3l4-3.5v12l-4-3.5H5v-5ZM16.5 10l4 4m0-4-4 4',
  chevron: 'm7 10 5 5 5-5',
  copy: 'M9 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1ZM5 15V6a1 1 0 0 1 1-1h9',
  check: 'm5 12.5 4.5 4.5L19 7',
  external: 'M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4',
  up: 'M12 19V5m0 0-6 6m6-6 6 6',
  down: 'M12 5v14m0 0 6-6m-6 6-6-6',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0M16 4.5a3 3 0 0 1 0 5.9M21 20a6 6 0 0 0-4-5.6',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  feed: 'M4 6h16M4 12h10M4 18h16',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  info: 'M12 11v5m0-8h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
}

export function Icon({ name, size = 18, className, strokeWidth = 1.8 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={PATHS[name]} />
    </svg>
  )
}
