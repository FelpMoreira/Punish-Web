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
import { Profile } from './pages/Profile'
import { Invite } from './pages/Invite'
import { Admin } from './pages/Admin'
import { Sidebar } from './components/layout/Sidebar'
import { MobileNav } from './components/layout/MobileNav'
import { api, storage } from './services/api'

type Page = 'home' | 'login' | 'register' | 'dashboard' | 'tournament-list' | 'tournament-detail' | 'players' | 'create' | 'settings' | 'profile' | 'invite' | 'admin'

function parseHash(): { page: Page; tournamentId: number | null; codigo: string | null } {
  const hash = window.location.hash.replace('#', '')
  const parts = hash.split('/').filter(Boolean)
  if (parts.length === 0) return { page: 'home', tournamentId: null, codigo: null }
  if (parts[0] === 'tournament-detail' && parts[1]) {
    return { page: 'tournament-detail', tournamentId: Number(parts[1]), codigo: null }
  }
  if (parts[0] === 'invite' && parts[1]) {
    return { page: 'invite', tournamentId: null, codigo: parts[1] }
  }
  return { page: parts[0] as Page, tournamentId: null, codigo: null }
}

function buildHash(page: Page, tournamentId?: number | string, codigo?: string): string {
  if (page === 'tournament-detail' && tournamentId) return `#/tournament-detail/${tournamentId}`
  if (page === 'invite' && codigo) return `#/invite/${codigo}`
  return `#/${page}`
}

export default function App() {
  const [page, setPage] = useState<Page>(() => parseHash().page)
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(() => parseHash().tournamentId)
  const [inviteCode, setInviteCode] = useState<string | null>(() => parseHash().codigo)

  const navigate = useCallback((p: string, tournamentId?: number | string, codigo?: string) => {
    const pg = p as Page
    window.location.hash = buildHash(pg, tournamentId, codigo)
    setPage(pg)
    if (tournamentId) setSelectedTournamentId(Number(tournamentId))
    if (codigo) setInviteCode(codigo)
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const { page: pg, tournamentId: tid, codigo } = parseHash()
      setPage(pg)
      if (tid) setSelectedTournamentId(tid)
      if (codigo) setInviteCode(codigo)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const isAdmin = storage.user?.role === 'ADMIN'

  if (page === 'home') return <Home onNavigate={navigate} />
  if (page === 'login') return <Login onNavigate={navigate} />
  if (page === 'register') return <Register onNavigate={navigate} />
  if (page === 'invite') return <Invite onNavigate={navigate} codigo={inviteCode!} />

  if (!storage.token) return <Login onNavigate={navigate} />

  if (page === 'admin' && !isAdmin) {
    window.location.hash = '#/dashboard'
    return null
  }

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

      <div className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
        {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {page === 'tournament-list' && <TournamentList onNavigate={navigate} />}
        {page === 'tournament-detail' && <TournamentDetail onNavigate={navigate} tournamentId={selectedTournamentId!} />}
        {page === 'players' && <Players />}
        {page === 'create' && <Create onNavigate={navigate} />}
        {page === 'settings' && <Settings />}
        {page === 'profile' && <Profile onNavigate={navigate} />}
        {page === 'admin' && isAdmin && <Admin />}
      </div>

      <MobileNav
        active={page}
        onNavigate={(p) => navigate(p)}
        onLogout={() => {
          api.auth.logout()
          window.location.hash = '#/login'
          setPage('login')
        }}
      />
    </div>
  )
}
