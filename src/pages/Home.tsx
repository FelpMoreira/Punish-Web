import { useState, useEffect } from 'react'
import { Trophy, Plus, ChevronRight, LogIn, LogOut, User as UserIcon } from 'lucide-react'
import { api, storage } from '../services/api'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import type { Tournament, Player } from '../types'

interface Props {
  onNavigate: (page: string, id?: number) => void
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'STARTED': return <Badge variant="running">Acontecendo</Badge>
    case 'CREATED': return <Badge variant="waiting">Aberto</Badge>
    case 'FINISHED': return <Badge variant="finished">Finalizado</Badge>
    default: return <Badge variant="waiting">{status}</Badge>
  }
}

export function Home({ onNavigate }: Props) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [name, setName] = useState('')
  const [game, setGame] = useState('')
  const [playerCounts, setPlayerCounts] = useState<Record<number, number>>({})
  const [matchCounts, setMatchCounts] = useState<Record<number, number>>({})
  const loggedUser = storage.user
  const [logged, setLogged] = useState(() => !!storage.token && !!storage.user)

  const load = () => {
    api.tournaments.list().then(async (list) => {
      setTournaments(list)
      const pcs: Record<number, number> = {}
      const mcs: Record<number, number> = {}
      await Promise.all(list.map(async (t) => {
        try {
          const ps = await api.tournaments.players(t.id)
          pcs[t.id] = ps.length
        } catch { pcs[t.id] = 0 }
        try {
          const ms = await api.tournaments.matches(t.id)
          mcs[t.id] = ms.length
        } catch { mcs[t.id] = 0 }
      }))
      setPlayerCounts(pcs)
      setMatchCounts(mcs)
    }).catch(() => {})
    api.players.list().then(setPlayers).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name.trim() || !game.trim()) return
    try {
      const t = await api.tournaments.create(name.trim(), game.trim())
      setName('')
      setGame('')
      onNavigate('tournament-detail', t.id)
    } catch {}
  }

  const hasTournaments = tournaments.length > 0
  const activeTournaments = tournaments.filter(t => t.status !== 'FINISHED')

  return (
    <div className="h-dvh overflow-y-auto">
      <div className="max-w-[900px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-purple rounded-sm flex items-center justify-center text-[11px] font-bold text-white">PT</div>
            <span className="text-sm font-semibold tracking-wider uppercase">Punish</span>
          </div>
          <div className="flex items-center gap-2">
            {logged ? (
              <>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 bg-bg-el border border-border rounded-md px-2.5 py-1.5 text-xs text-muted hover:border-purple/30 hover:text-text transition-colors cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-sm bg-purple/20 text-purple flex items-center justify-center">
                    <UserIcon size={12} />
                  </span>
                  {loggedUser?.nickname}
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={LogOut}
                  onClick={() => { api.auth.logout(); setLogged(false) }}
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="secondary" icon={LogIn} onClick={() => onNavigate('login')}>
                  Entrar
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onNavigate('register')}>
                  Registrar
                </Button>
              </>
            )}
            <Button size="sm" icon={Plus} onClick={() => hasTournaments ? onNavigate('create') : create()}>
              Criar torneio
            </Button>
          </div>
        </div>

        {!hasTournaments && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5 items-start">
            <div className="bg-bg-el border border-border rounded-md p-4">
              <div className="text-sm font-semibold mb-3">Criar torneio</div>
              <div className="flex flex-col gap-2.5">
                <Input placeholder="Nome do torneio" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Jogo (ex: Street Fighter 6)" value={game} onChange={(e) => setGame(e.target.value)} />
                <Button icon={Trophy} style={{ width: '100%', justifyContent: 'center' }} onClick={create} disabled={!name.trim() || !game.trim()}>
                  Criar
                </Button>
              </div>
            </div>
            <div className="bg-bg-el border border-border rounded-md p-4">
              <div className="text-sm font-semibold mb-3">Players ({players.length})</div>
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto -mx-4 px-4">
                {players.length === 0 ? (
                  <div className="text-xs text-muted py-2 text-center">Nenhum player cadastrado.</div>
                ) : players.map(p => (
                  <div key={p.id} className="text-sm py-1 border-b border-border last:border-b-0">
                    {p.nickname}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasTournaments && (
          <div className="flex flex-col gap-3">
            {activeTournaments.length > 0 && (
              <>
                <div className="text-xs font-semibold uppercase tracking-wider text-soft">
                  Acontecendo agora ({activeTournaments.length})
                </div>
                {activeTournaments.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onNavigate('tournament-detail', t.id)}
                    className="bg-bg-el border border-border rounded-md p-4 text-left hover:border-purple/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{t.name}</span>
                          {statusBadge(t.status)}
                        </div>
                        <div className="text-xs text-muted">{t.game}</div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-soft shrink-0">
                        <span>{playerCounts[t.id] ?? '...'} players</span>
                        <span className="hidden sm:inline">{matchCounts[t.id] ?? '...'} partidas</span>
                        <ChevronRight size={14} className="text-muted group-hover:text-text transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {tournaments.filter(t => t.status === 'FINISHED').length > 0 && (
              <>
                <div className="text-xs font-semibold uppercase tracking-wider text-soft mt-2">
                  Finalizados
                </div>
                {tournaments.filter(t => t.status === 'FINISHED').map(t => (
                  <button
                    key={t.id}
                    onClick={() => onNavigate('tournament-detail', t.id)}
                    className="bg-bg-el border border-border rounded-md p-4 text-left hover:border-purple/30 transition-colors cursor-pointer group opacity-60 hover:opacity-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{t.name}</span>
                          {statusBadge(t.status)}
                        </div>
                        <div className="text-xs text-muted">{t.game}</div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-soft shrink-0">
                        <span>{playerCounts[t.id] ?? '...'} players</span>
                        <ChevronRight size={14} className="text-muted group-hover:text-text transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
