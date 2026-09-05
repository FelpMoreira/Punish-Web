import { useEffect, useState } from 'react'
import { Camera, LogOut, Trophy, CalendarClock } from 'lucide-react'
import { api, storage } from '../services/api'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import type { User } from '../types'

interface Props {
  onNavigate: (page: string) => void
}

const roleBadge = (role?: string) => {
  switch (role) {
    case 'ADMIN': return <Badge variant="finished">Admin</Badge>
    case 'ORGANIZER': return <Badge variant="running">Organizador</Badge>
    case 'PLAYER': return <Badge variant="waiting">Player</Badge>
    default: return <Badge variant="waiting">Player</Badge>
  }
}

export function Profile({ onNavigate }: Props) {
  const [user, setUser] = useState<User | null>(storage.user)
  const [stats, setStats] = useState<{ tournaments?: number; matches?: number } | null>(null)

  useEffect(() => {
    if (!storage.token) {
      onNavigate('home')
      return
    }
    api.auth.me().then((u) => {
      setUser(u)
      api.players.stats(u.id).then((s) => setStats({ matches: s.totalWins + s.totalLosses, tournaments: s.totalTournaments })).catch(() => {})
    }).catch(() => setUser(storage.user))
  }, [onNavigate])

  const logout = () => {
    api.auth.logout()
    onNavigate('home')
  }

  if (!user) return (
    <div className="h-full flex items-center justify-center">
      <div className="text-sm text-muted">Carregando...</div>
    </div>
  )

  return (
    <div className="h-dvh overflow-y-auto">
      <div className="max-w-[700px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-semibold tracking-wider uppercase">Perfil</div>
          <Button size="sm" variant="ghost" icon={LogOut} onClick={logout}>Sair</Button>
        </div>

        <div className="flex flex-col items-center gap-4 bg-bg-el border border-border rounded-md p-6 mb-4">
          <div className="flex flex-col items-center gap-2 -mt-2">
            <div className="w-20 h-20 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center text-[28px] font-bold text-purple">
              {user.nickname?.[0]?.toUpperCase() ?? '?'}
            </div>
            <button
              className="flex items-center gap-1.5 text-[11px] text-muted hover:text-text transition-colors cursor-pointer"
              title="Plano futuro: upload de foto de perfil (para o roadmap de Auth)"
            >
              <Camera size={12} />
              Foto de perfil — em breve
            </button>
            {roleBadge(user.role)}
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{user.nickname}</div>
            <div className="text-xs text-muted">{user.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-bg-el border border-border rounded-md p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-purple/20 text-purple flex items-center justify-center"><Trophy size={16} /></div>
            <div>
              <div className="text-lg font-semibold leading-none">{stats?.tournaments ?? '...'}</div>
              <div className="text-[11px] text-soft">Torneios</div>
            </div>
          </div>
          <div className="bg-bg-el border border-border rounded-md p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-cyan/20 text-cyan flex items-center justify-center"><CalendarClock size={16} /></div>
            <div>
              <div className="text-lg font-semibold leading-none">{stats?.matches ?? '...'}</div>
              <div className="text-[11px] text-soft">Partidas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}