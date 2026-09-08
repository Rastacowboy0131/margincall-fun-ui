import { AppLink } from '../../app/AppLink'
import { useReel } from '../../lib/useReel'
import { ethShort } from '../../lib/format'
import { useFlash } from '../../lib/useFlash'
import { Wordmark } from '../brand/Wordmark'
import { Avatar } from '../brand/Avatar'
import { displayName, useProfile } from '../../lib/profile'
import { NavRail } from './NavRail'
import { ModeSwitch } from './ModeSwitch'
import { Icon } from '../ui/Icon'
import { cx } from '../../lib/cx'

/* Who this is, where you can go, how much you have. The balance is a
 * readout with a "+" key on its right edge that opens the wallet. */

export function Header({ pathname, onOpenBalance, onOpenProfile, onGoLive, onGoPaper }: {
  pathname: string; onOpenBalance: () => void; onOpenProfile: () => void; onGoLive: () => void; onGoPaper: () => void
}) {
  const { session, mode } = useReel()
  const profile = useProfile()
  const flash = useFlash(session.buyingPowerEth)
  return (
    <header className="border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1560px] items-center gap-5 px-4 sm:px-6">
        <AppLink to="/" className="flex min-h-[44px] shrink-0 items-center" aria-label="Margin Call, home"><Wordmark /></AppLink>
        <NavRail pathname={pathname} />
        <div className="ml-auto flex min-w-0 shrink items-center gap-2">
          <ModeSwitch mode={mode} onGoLive={onGoLive} onGoPaper={onGoPaper} />
          <button type="button" onClick={onOpenBalance} className="press flex min-h-[38px] min-w-0 items-center gap-2.5 rounded-ctl border border-line-2 bg-surface-2 pr-1 pl-2 sm:pl-3">
            <span className="flex min-w-0 flex-col items-end leading-none">
              {/* "Buying power" is the first thing to go at 360px: the
               * right cluster overran the viewport by 13px and pushed
               * the whole document sideways. The figure never goes. */}
              <span className="label hidden text-[9px] sm:block">Buying power</span>
              <span key={flash.key} className={cx('num truncate text-[13px] font-bold text-ink sm:mt-0.5', flash.cls)}>{ethShort(session.buyingPowerEth)} <span className="text-2xs font-semibold text-ink-3">ETH</span></span>
            </span>
            <span aria-hidden="true" className="grid size-7 place-items-center rounded-[6px] bg-lime text-bg"><Icon name="plus" size={14} strokeWidth={2.6} /></span>
            <span className="sr-only">Open wallet and balance</span>
          </button>
          <button type="button" onClick={onOpenProfile} className="press grid size-9 place-items-center rounded-pill border border-line-2 bg-surface-2">
            <Avatar handle={displayName(profile)} tint="#2a3128" size={26} pfp={profile.pfp || undefined} />
            <span className="sr-only">Edit your profile</span>
          </button>
        </div>
      </div>
    </header>
  )
}
