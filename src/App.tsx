import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { Play } from './pages/Play'
import { Me } from './pages/Me'
import { Board } from './pages/Board'
import { Rewards } from './pages/Rewards'
import { Fair } from './pages/Fair'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Play />} />
          <Route path="/me" element={<Me />} />
          <Route path="/board" element={<Board />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/fair" element={<Fair />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
