import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '../components/shell/Header'
import { Footer } from '../components/shell/Footer'
import { TabBar } from '../components/shell/TabBar'
import { Tape } from '../components/shell/Tape'
import { Toaster } from '../components/shell/Toaster'
import { BalanceSheet } from '../components/shell/BalanceSheet'
import { ConnectSheet } from '../components/shell/ConnectSheet'
import { ProfileSheet } from '../components/shell/ProfileSheet'
import { goPaper } from '../lib/mode'

const TITLES: Record<string, string> = {
  '/': 'Margin Call: get liquidated with friends',
  '/portfolio': 'Portfolio · Margin Call',
  '/history': 'History · Margin Call',
  '/leaderboard': 'Leaderboard · Margin Call',
  '/rewards': 'Rewards · Margin Call',
  '/referrals': 'Referrals · Margin Call',
  '/verify': 'Provably fair · Margin Call',
}

export function AppShell() {
  const { pathname } = useLocation()
  const [sheet, setSheet] = useState<'none' | 'balance' | 'connect' | 'profile'>('none')

  useEffect(() => {
    document.title = TITLES[pathname] ?? 'Margin Call'
    window.scrollTo(0, 0)
  }, [pathname])

  const close = useCallback(() => setSheet('none'), [])

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="hidden sm:block"><Tape /></div>
      <div className="sticky top-0 z-40">
        <Header pathname={pathname} onOpenBalance={() => setSheet('balance')} onOpenProfile={() => setSheet('profile')} onGoLive={() => setSheet('connect')} onGoPaper={() => goPaper()} />
      </div>
      <main key={pathname} className="anim-page flex-1">
        <Outlet />
      </main>
      <Footer />
      <div aria-hidden="true" className="lg:hidden" style={{ height: 'calc(56px + env(safe-area-inset-bottom))' }} />
      <TabBar pathname={pathname} />
      <Toaster />
      <BalanceSheet open={sheet === 'balance'} onClose={close} onGoLive={() => setSheet('connect')} />
      <ConnectSheet open={sheet === 'connect'} onClose={close} />
      {sheet === 'profile' && <ProfileSheet open onClose={close} />}
    </div>
  )
}
