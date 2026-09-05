import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Topbar } from '../components/layout/Topbar'
import type { Tournament } from '../types'
import { Users, Play, Trash2, Search } from 'lucide-react'

interface Props {
  onNavigate: (page: string, id?: number) => void
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'STARTED': return <Badge variant="running">Running</Badge>
    case 'CREATED': return <Badge variant="waiting">Waiting</Badge>
    case 'FINISHED': return <Badge variant="finished">Finished</Badge>
    default: return <Badge variant="waiting">{status}</Badge>
  }
}

export function TournamentList({ onNavigate }: Props) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filterName, setFilterName] = useState('')
  const [filterGame, setFilterGame] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      api.tournaments.list({
        name: filterName || undefined,
        game: filterGame || undefined,
        status: filterStatus || undefined,
      }).then(setTournaments).catch(() => {})
    }, 200)
    return () => clearTimeout(timeout)
  }, [filterName, filterGame, filterStatus])

  const deleteTournament = (id: number) => {
    api.tournaments.delete(id).then(() => {
      setTournaments((prev) => prev.filter((t) => t.id !== id))
    }).catch(() => {})
  }

  return (
    <>
      <Topbar
        title="My Tournaments"
        actions={
          <Button size="sm" onClick={() => onNavigate('create')}>
            Create
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search by name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-bg-el border border-border rounded-md outline-none focus:border-purple"
            />
          </div>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search by game..."
              value={filterGame}
              onChange={(e) => setFilterGame(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-bg-el border border-border rounded-md outline-none focus:border-purple"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 px-2 text-xs bg-bg-el border border-border rounded-md outline-none focus:border-purple"
          >
            <option value="">All status</option>
            <option value="CREATED">Waiting</option>
            <option value="STARTED">Running</option>
            <option value="FINISHED">Finished</option>
          </select>
        </div>
        <div className="flex flex-col gap-3">
          {tournaments.map((t) => (
            <Card key={t.id} className="!p-0">
              <div className="flex items-center px-4 py-3 gap-3 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <span className="text-sm font-semibold">{t.name}</span>
                    {statusBadge(t.status)}
                  </div>
                  <div className="text-xs text-muted">{t.game}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Users}
                    onClick={() => onNavigate('tournament-detail', t.id)}
                  >
                    Manage
                  </Button>
                  {t.status === 'CREATED' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Play}
                      onClick={() => api.tournaments.start(t.id).then(() => {
                        setTournaments((prev) => prev.map((x) => x.id === t.id ? { ...x, status: 'STARTED' } : x))
                      })}
                    >
                      Start
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => deleteTournament(t.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {tournaments.length === 0 && (
            <div className="text-center text-sm text-muted py-10">No tournaments yet. Create one!</div>
          )}
        </div>
      </div>
    </>
  )
}
