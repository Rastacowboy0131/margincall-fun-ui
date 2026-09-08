import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '../components/shell/Header'
import { Footer } from '../components/shell/Footer'
import { TabBar } from '../components/shell/TabBar'
import { Tape } from '../components/shell/Tape'
import { BalanceSheet } from '../components/shell/BalanceSheet'
import { ConnectSheet } from '../components/shell/ConnectSheet'
import { ProfileSheet } from '../components/shell/ProfileSheet'
import { goPaper } from '../lib/mode'

/* The shell: routing, page title, the sheets the header can open, and
 * the route transition. Everything framework-specific is in this file,
 * App.tsx and AppLink.tsx. */

const TITLES: Record<string, string> = {
  '/': 'Margin Call. Eject before the call.',
  '/me': 'Your flights. Margin Call',
  '/board': 'Leaderboard. Margin Call',
  '/rewards': 'Rewards. Margin Call',
  '/fair': 'Provably fair. Margin Call',
}

export function AppShell() {
  const { pathname } = useLocation()
  const [sheet, setSheet] = useState<'none' | 'balance' | 'connect' | 'profile'>('none')

  useEffect(() => {
    document.title = TITLES[pathname] ?? 'Margin Call'
    window.scrollTo(0, 0)
  }, [pathname])

  const close = useCallback(() => setSheet('none'), [])
  const isTable = pathname === '/'

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="hidden sm:block">
        <Tape />
      </div>

      <div className="sticky top-0 z-40">
        <Header
          pathname={pathname}
          onOpenBalance={() => setSheet('balance')}
          onOpenProfile={() => setSheet('profile')}
          onGoLive={() => setSheet('connect')}
          onGoPaper={() => goPaper()}
        />
      </div>

      {/* Keyed on the route so each page arrives rather than snaps. */}
      <main key={pathname} className="anim-page flex-1">
        <Outlet />
      </main>

      <Footer variant={isTable ? 'full' : 'short'} />

      <div aria-hidden="true" className="lg:hidden" style={{ height: 'calc(56px + env(safe-area-inset-bottom))' }} />

      <TabBar pathname={pathname} />

      <BalanceSheet open={sheet === 'balance'} onClose={close} onGoLive={() => setSheet('connect')} />
      <ConnectSheet open={sheet === 'connect'} onClose={close} />
      {sheet === 'profile' && <ProfileSheet open onClose={close} />}
    </div>
  )
}
