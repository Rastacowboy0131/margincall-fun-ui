import { AppLink } from '../../app/AppLink'
import { useReel } from '../../lib/useReel'
import { ethShort } from '../../lib/format'
import { useFlash } from '../../lib/useFlash'
import { Wordmark } from '../brand/Wordmark'
import { displayName, useProfile } from '../../lib/profile'
import { NavRail } from './NavRail'
import { ModeSwitch } from './ModeSwitch'
import { cx } from '../../lib/cx'

/* Who this is, where you can go, how much fuel you have. */

export function Header({ pathname, onOpenBalance, onOpenProfile, onGoLive, onGoPaper }: {
  pathname: string
  onOpenBalance: () => void
  onOpenProfile: () => void
  onGoLive: () => void
  onGoPaper: () => void
}) {
  const { session, mode } = useReel()
  const profile = useProfile()
  const flash = useFlash(session.buyingPowerEth)
  return (
    <header className="border-b border-line bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <AppLink to="/" className="flex min-h-[44px] shrink-0 items-center" aria-label="Margin Call, home"><Wordmark /></AppLink>
        <NavRail pathname={pathname} />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ModeSwitch mode={mode} onGoLive={onGoLive} onGoPaper={onGoPaper} />
          <button type="button" onClick={onOpenBalance} className="press flex min-h-[38px] items-center gap-2 rounded-pill border border-line-2 bg-surface px-2.5 sm:gap-2.5 sm:px-3.5">
            {/* The word "Fuel" and the ETH unit are the first things to
             * go at 360px: the row (wordmark, mode switch, balance,
             * account) needed 404px in a 360px viewport and pushed the
             * whole document sideways. The figure itself never goes. */}
            <span className="label hidden sm:inline">Fuel</span>
            <span key={flash.key} className={cx('num text-[15px] text-gold', flash.cls)}>{ethShort(session.buyingPowerEth)}</span>
            <span className="label hidden sm:inline">ETH</span>
            <span className="sr-only">Open wallet and balance</span>
          </button>
          <button type="button" onClick={onOpenProfile} className="press grid size-9 place-items-center overflow-hidden rounded-pill" style={{ background: 'linear-gradient(135deg, var(--color-cyan), var(--color-gold))' }}>
            {profile.pfp ? <img src={profile.pfp} alt="" className="size-full object-cover" /> : <span className="display text-xs font-extrabold text-bg">{displayName(profile).charAt(0).toUpperCase()}</span>}
            <span className="sr-only">Edit your profile</span>
          </button>
        </div>
      </div>
    </header>
  )
}
