import { AppLink } from '../../app/AppLink'
import { WALLET } from '../../data/sample'
import { useReel } from '../../lib/useReel'
import { ethShort } from '../../lib/format'
import { Wordmark } from '../brand/Wordmark'
import { Avatar } from '../brand/Avatar'
import { displayName, useProfile } from '../../lib/profile'
import { Icon } from '../ui/Icon'
import { NavRail } from './NavRail'
import { ModeSwitch } from './ModeSwitch'

/* ------------------------------------------------------------------ *
 * The header carries three things and no more: who this is, where you
 * can go, and how much you have got.
 *
 * The balance is the one figure that belongs on every route — it is the
 * thing the player is spending — so it is a readout window rather than
 * a line of text: a sunken panel with gold numerals and a moulded "+"
 * key bolted to its right edge, which is also what opens the wallet
 * sheet. Marketing chrome does not get the same treatment; see Footer.
 * ------------------------------------------------------------------ */

export function Header({
  pathname,
  onOpenBalance,
  onOpenProfile,
  onGoLive,
  onGoPaper,
}: {
  pathname: string
  onOpenBalance: () => void
  onOpenProfile: () => void
  onGoLive: () => void
  onGoPaper: () => void
}) {
  const { session } = useReel()
  const profile = useProfile()
  return (
    <header className="border-b border-rim bg-panel/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1560px] items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-6">
          <AppLink
            to="/"
            className="flex min-h-[44px] shrink-0 items-center rounded-key"
            aria-label="Margin Call — home"
          >
            <Wordmark />
          </AppLink>
          <NavRail pathname={pathname} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Paper vs real money is the single most consequential thing
           * about the state you are in, so it is a switch you can reach
           * at every width — not a badge, and not something buried a
           * sheet deep. Tapping LIVE is the way into the wallet flow. */}
          <ModeSwitch mode={WALLET.mode} onGoLive={onGoLive} onGoPaper={onGoPaper} />

          <button
            type="button"
            onClick={onOpenBalance}
            className="key-3d group flex min-h-[44px] items-center gap-2 rounded-key border border-rim bg-void pl-3 pr-1.5 [--key-depth:3px] [--key-under:var(--color-void)]"
          >
            <span className="flex flex-col items-end leading-none">
              <span className="eyebrow text-[9px] text-ink-3">Buying power</span>
              <span className="nums mt-0.5 text-sm font-extrabold text-gold">
                {ethShort(session.buyingPowerEth)}
                <span className="ml-1 text-micro font-bold text-ink-3">ETH</span>
              </span>
            </span>
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-tag bg-gold text-void"
            >
              <Icon name="plus" size={16} strokeWidth={2.6} />
            </span>
            <span className="sr-only">Open wallet and balance</span>
          </button>

          {/* The account chip. It is the player's own casino chip: their
           * pfp or initial, gold-ringed, opening the profile editor. */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="key-3d grid min-h-[44px] min-w-[44px] place-items-center rounded-key border border-rim bg-panel-2 [--key-depth:3px] [--key-under:var(--color-void)]"
          >
            <Avatar
              handle={displayName(profile)}
              tint="#ffc247"
              size={28}
              pfp={profile.pfp || undefined}
            />
            <span className="sr-only">Edit your profile</span>
          </button>
        </div>
      </div>
    </header>
  )
}
