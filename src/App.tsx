import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { Trade } from './pages/Trade'
import { Portfolio } from './pages/Portfolio'
import { History } from './pages/History'
import { Leaderboard } from './pages/Leaderboard'
import { Rewards } from './pages/Rewards'
import { Referrals } from './pages/Referrals'
import { Verify } from './pages/Verify'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Trade />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/history" element={<History />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/verify" element={<Verify />} />
          {/* old routes */}
          <Route path="/me" element={<Navigate to="/portfolio" replace />} />
          <Route path="/board" element={<Navigate to="/leaderboard" replace />} />
          <Route path="/fair" element={<Navigate to="/verify" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
