import { useState, useEffect, useCallback } from 'react'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { TournamentList } from './pages/TournamentList'
import { TournamentDetail } from './pages/TournamentDetail'
import { Players } from './pages/Players'
import { Create } from './pages/Create'
import { Settings } from './pages/Settings'
import { Sidebar } from './components/layout/Sidebar'
import { api, storage } from './services/api'

type Page = 'home' | 'login' | 'register' | 'dashboard' | 'tournament-list' | 'tournament-detail' | 'players' | 'create' | 'settings'

function parseHash(): { page: Page; tournamentId: number | null } {
  const hash = window.location.hash.replace('#', '')
  const parts = hash.split('/').filter(Boolean)
  if (parts.length === 0) return { page: 'home', tournamentId: null }
  if (parts[0] === 'tournament-detail' && parts[1]) {
    return { page: 'tournament-detail', tournamentId: Number(parts[1]) }
  }
  return { page: parts[0] as Page, tournamentId: null }
}

function buildHash(page: Page, tournamentId?: number): string {
  if (page === 'tournament-detail' && tournamentId) return `#/tournament-detail/${tournamentId}`
  return `#/${page}`
}

export default function App() {
  const [page, setPage] = useState<Page>(() => parseHash().page)
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(() => parseHash().tournamentId)

  const navigate = useCallback((p: string, tournamentId?: number) => {
    const pg = p as Page
    window.location.hash = buildHash(pg, tournamentId)
    setPage(pg)
    if (tournamentId) setSelectedTournamentId(tournamentId)
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const { page: pg, tournamentId: tid } = parseHash()
      setPage(pg)
      if (tid) setSelectedTournamentId(tid)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (page === 'home') return <Home onNavigate={navigate} />
  if (page === 'login') return <Login onNavigate={navigate} />
  if (page === 'register') return <Register onNavigate={navigate} />

  if (!storage.token) return <Login onNavigate={navigate} />

  return (
    <div className="flex h-screen overflow-hidden">
          <Sidebar
            active={page}
            onNavigate={(p) => navigate(p)}
            onLogout={() => {
              api.auth.logout()
              window.location.hash = '#/login'
              setPage('login')
            }}
          />

      <div className="flex-1 flex flex-col overflow-hidden">
        {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {page === 'tournament-list' && <TournamentList onNavigate={navigate} />}
        {page === 'tournament-detail' && <TournamentDetail onNavigate={navigate} tournamentId={selectedTournamentId!} />}
        {page === 'players' && <Players />}
        {page === 'create' && <Create onNavigate={navigate} />}
        {page === 'settings' && <Settings />}
      </div>
    </div>
  )
}
