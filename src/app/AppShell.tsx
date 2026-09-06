import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '../components/shell/Header'
import { Footer } from '../components/shell/Footer'
import { TabBar } from '../components/shell/TabBar'
import { Tape } from '../components/shell/Tape'
import { BalanceSheet } from '../components/shell/BalanceSheet'
import { ConnectSheet } from '../components/shell/ConnectSheet'
import { ProfileSheet } from '../components/shell/ProfileSheet'

/* ------------------------------------------------------------------ *
 * The shell. Routing, page title, and the two sheets the header can
 * open. Everything framework-specific in this product is in this file,
 * App.tsx and AppLink.tsx — three files, one folder.
 * ------------------------------------------------------------------ */

const TITLES: Record<string, string> = {
  '/': 'Margin Call — sell before the call',
  '/me': 'Your positions — Margin Call',
  '/board': 'Leaderboard — Margin Call',
  '/rewards': 'Rewards — Margin Call',
  '/fair': 'Provably fair — Margin Call',
}

export function AppShell() {
  const { pathname } = useLocation()
  const [sheet, setSheet] = useState<'none' | 'balance' | 'connect' | 'profile'>('none')

  useEffect(() => {
    document.title = TITLES[pathname] ?? 'Margin Call'
  }, [pathname])

  // A route change should start the new page at the top, not halfway
  // down where the last one was left.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const close = useCallback(() => setSheet('none'), [])
  const isTable = pathname === '/'

  return (
    <div className="flex min-h-dvh flex-col">
      {/* The tape is flavour. It costs 26px, which a phone cannot spare
       * on the one screen where the game itself has to fit. */}
      <div className="hidden sm:block">
        <Tape />
      </div>

      <div className="sticky top-0 z-40">
        <Header
          pathname={pathname}
          onOpenBalance={() => setSheet('balance')}
          onOpenProfile={() => setSheet('profile')}
          onGoLive={() => setSheet('connect')}
          onGoPaper={() => setSheet('balance')}
        />
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer variant={isTable ? 'full' : 'short'} />

      {/* Reserves the fixed tab bar's height so the last element of every
       * page stays reachable. Scroll to the bottom of each route when
       * checking this — it is the classic bottom-nav bug. */}
      <div
        aria-hidden="true"
        className="lg:hidden"
        style={{ height: 'calc(58px + env(safe-area-inset-bottom))' }}
      />

      <TabBar pathname={pathname} />

      <BalanceSheet
        open={sheet === 'balance'}
        onClose={close}
        onGoLive={() => setSheet('connect')}
      />
      <ConnectSheet open={sheet === 'connect'} onClose={close} />
      {/* Keyed by open so the sheet re-reads the saved profile each time
       * it opens, instead of resurrecting a stale draft. */}
      {sheet === 'profile' && <ProfileSheet open onClose={close} />}
    </div>
  )
}
