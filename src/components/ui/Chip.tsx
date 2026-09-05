import { cx } from '../../lib/cx'

/* ------------------------------------------------------------------ *
 * A poker chip.
 *
 * This is the stake control, and it is drawn as the object rather than
 * tabulated as a number field, because a chip is the thing every player
 * in the world already knows how to use. Tapping one sets your stake —
 * it does not add to it. Additive stacking would mean the console had
 * to do arithmetic, and arithmetic on a figure the player cares about
 * is not the front end's to do.
 *
 * The denomination colours below are RAW HEX ON PURPOSE, the same way a
 * ticker's brand swatch is. They are a fifth, non-semantic ramp: they
 * deliberately avoid the mint and the red so a chip can never be
 * misread as a profit or a loss. Every one was measured against the
 * ink printed on it (cyan 8.6:1, purple 5.6:1, orange 9.4:1, and the
 * high-roller chip carries gold at 11.2:1).
 * ------------------------------------------------------------------ */

interface ChipFace {
  body: string
  spot: string
  ink: string
  ring: string
}

const FACES: ChipFace[] = [
  { body: '#3fb6f5', spot: '#e8f6ff', ink: '#100a16', ring: '#1c86bd' },
  { body: '#9d6bff', spot: '#efe6ff', ink: '#100a16', ring: '#6a3fc0' },
  { body: '#ff9d3f', spot: '#fff1de', ink: '#100a16', ring: '#c26c17' },
  { body: '#1a1424', spot: '#ffc247', ink: '#ffc247', ring: '#8a5c17' },
]

/** Denominations arrive in order, so the fourth chip is always the
 *  high-roller one. If the house ever ships a fifth, add a face. */
function chipFace(index: number): ChipFace {
  return FACES[index % FACES.length]
}

interface ChipProps {
  /** Stake this chip sets, in ETH. Printed on the face. */
  valueEth: number
  /** Position in the denomination list — picks the face. */
  index: number
  selected: boolean
  onSelect: () => void
  /** 52px on a phone, 60px from md up. Set by the console, not here. */
  size?: number
}

export function Chip({ valueEth, index, selected, onSelect, size = 56 }: ChipProps) {
  const face = chipFace(index)
  // Six edge spots, the way a real clay chip is moulded.
  const spots = [0, 60, 120, 180, 240, 300]

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cx(
        'key-3d relative grid shrink-0 place-items-center rounded-chip',
        'transition-transform',
        selected ? 'z-10' : 'opacity-90',
      )}
      style={{
        width: size,
        height: size,
        // The selected chip is lifted out of the tray, and the lift is
        // what carries the state — the gold ring only confirms it.
        transform: selected ? 'translateY(-6px)' : undefined,
        filter: selected ? 'drop-shadow(0 8px 0 rgb(0 0 0 / 0.5))' : 'drop-shadow(0 3px 0 rgb(0 0 0 / 0.45))',
      }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <circle cx="32" cy="32" r="31" fill={face.body} />
        {spots.map((deg) => (
          <rect
            key={deg}
            x="29"
            y="0.5"
            width="6"
            height="10"
            rx="1.5"
            fill={face.spot}
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
        <circle cx="32" cy="32" r="30" fill="none" stroke={face.ring} strokeWidth="2.5" />
        <circle cx="32" cy="32" r="23" fill="none" stroke={face.ring} strokeWidth="1.5" opacity="0.85" />
        <circle cx="32" cy="32" r="21.5" fill={face.body} />
        {selected && (
          <circle cx="32" cy="32" r="31" fill="none" stroke="var(--color-gold)" strokeWidth="3" />
        )}
      </svg>
      <span
        className="pointer-events-none absolute font-sign nums"
        style={{
          color: face.ink,
          fontSize: valueEth >= 1 ? size * 0.3 : size * 0.235,
          letterSpacing: '-0.02em',
        }}
      >
        {valueEth >= 1 ? valueEth : valueEth.toFixed(1).replace(/^0/, '.')}
      </span>
      <span className="sr-only">{`Stake ${valueEth} ETH`}</span>
    </button>
  )
}
