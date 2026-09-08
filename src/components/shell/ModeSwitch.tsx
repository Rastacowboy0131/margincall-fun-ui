import type { Wallet } from '../../data/types'
import { Segmented } from '../ui/Segmented'

/* PAPER | LIVE. Tapping LIVE opens the connect sheet. */

export function ModeSwitch({ mode, onGoLive, onGoPaper }: { mode: Wallet['mode']; onGoLive: () => void; onGoPaper: () => void }) {
  return (
    <Segmented
      ariaLabel="Trading mode"
      size="sm"
      tone="cyan"
      className="w-[112px] sm:w-[132px]"
      value={mode}
      onChange={(v) => { if (v === mode) return; if (v === 'live') onGoLive(); else onGoPaper() }}
      items={[
        { value: 'demo', label: <span className="font-sans text-[10px] font-bold tracking-wider">PAPER</span> },
        { value: 'live', label: <span className="flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-wider">{mode === 'live' && <span aria-hidden="true" className="anim-blink size-1.5 rounded-pill bg-bg" />}LIVE</span> },
      ]}
    />
  )
}
