/* ------------------------------------------------------------------ *
 * The icon set.
 *
 * All of it. Drawn here, on one 24-unit grid, at one 2px stroke, with
 * round caps and joins — because mixing two icon libraries is the
 * loudest amateur tell there is, and it happens by accident the moment
 * a second package gets installed. If this product needs a new glyph,
 * it gets drawn in this file at these settings.
 *
 * Every icon is aria-hidden. Any control that shows only an icon
 * carries its own accessible name.
 * ------------------------------------------------------------------ */

type IconName =
  | 'play'
  | 'me'
  | 'board'
  | 'rewards'
  | 'fair'
  | 'plus'
  | 'sound-on'
  | 'sound-off'
  | 'chevron'
  | 'copy'
  | 'check'
  | 'external'
  | 'skull'
  | 'up'
  | 'down'

const PATHS: Record<IconName, string> = {
  // a rising pair of candles
  play: 'M7 4v3m0 10v3M7 7h0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2 2 2 0 0 1-2-2V9a2 2 0 0 1 2-2ZM17 3v4m0 8v6m0-16h0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2 2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z',
  me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0',
  board: 'M5 20V11m7 9V4m7 16v-6M3 20h18',
  rewards: 'M4 11h16v9H4v-9ZM3 7h18v4H3V7Zm9 0v13M12 7S9.5 3 7.5 3.6 7 7 12 7Zm0 0s2.5-4 4.5-3.4S17 7 12 7Z',
  fair: 'M12 3l7 3v5.5c0 4.2-2.9 7.6-7 8.5-4.1-.9-7-4.3-7-8.5V6l7-3Zm-3 8.5 2.2 2.2L15 9.8',
  plus: 'M12 6v12M6 12h12',
  'sound-on': 'M5 9.5h3l4-3.5v12l-4-3.5H5v-5ZM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',
  'sound-off': 'M5 9.5h3l4-3.5v12l-4-3.5H5v-5ZM16.5 10l4 4m0-4-4 4',
  chevron: 'm7 10 5 5 5-5',
  copy: 'M9 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1ZM5 15V6a1 1 0 0 1 1-1h9',
  check: 'm5 12.5 4.5 4.5L19 7',
  external: 'M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4',
  skull: 'M12 3c4.4 0 7 2.9 7 6.6 0 2.3-1 3.7-2 4.6v2.3a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-2.3c-1-.9-2-2.3-2-4.6C5 5.9 7.6 3 12 3Zm-2.5 7.5h.01m5 0h.01M10.5 20v-2m3 2v-2',
  up: 'M12 19V5m0 0-6 6m6-6 6 6',
  down: 'M12 5v14m0 0 6-6m-6 6-6-6',
}

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 2,
}: {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
