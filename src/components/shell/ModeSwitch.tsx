import type { Wallet } from '../../data/types'
import { Segmented } from '../ui/Segmented'

export function ModeSwitch({ mode, onGoLive, onGoPaper }: { mode: Wallet['mode']; onGoLive: () => void; onGoPaper: () => void }) {
  return (
    /* The switch is the only header control that can give up width. At
     * 360px the right cluster (mode switch, balance readout, avatar)
     * needed 373px and scrolled every phone sideways; 124px here is a
     * comfort width, not a legibility floor, so it narrows below sm.
     * Nothing is dropped: both labels stay readable. */
    <Segmented ariaLabel="Trading mode" size="sm" tone="lime" className="w-[88px] sm:w-[124px]" value={mode}
      onChange={(v) => { if (v === mode) return; if (v === 'live') onGoLive(); else onGoPaper() }}
      items={[
        { value: 'demo', label: <span className="text-[10px] font-bold tracking-wider">DEMO</span> },
        { value: 'live', label: <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider">{mode === 'live' && <span aria-hidden="true" className="anim-pulse size-1.5 rounded-pill bg-bg" />}LIVE</span> },
      ]} />
  )
}
