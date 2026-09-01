import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card } from '../components/ui/Card'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { Topbar } from '../components/layout/Topbar'
import type { Tournament } from '../types'
import { Trophy, Users } from 'lucide-react'
import { Button } from '../components/ui/Button'

interface Props {
  onNavigate: (page: string, id?: number) => void
}

export function Dashboard({ onNavigate }: Props) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [matchesPlayed, setMatchesPlayed] = useState(0)
  const [upcomingMatches, setUpcomingMatches] = useState(0)

  useEffect(() => {
    api.tournaments.list().then(setTournaments).catch(() => {})
    api.dashboard().then((d) => {
      setTotalPlayers(d.totalPlayers)
      setMatchesPlayed(d.matchesPlayed)
      setUpcomingMatches(d.upcomingMatches)
    }).catch(() => {})
  }, [])

  const statusBadge = (status: string) => {
    switch (status) {
      case 'STARTED': return <Badge variant="running">Running</Badge>
      case 'CREATED': return <Badge variant="waiting">Waiting</Badge>
      case 'FINISHED': return <Badge variant="finished">Finished</Badge>
      default: return <Badge variant="waiting">{status}</Badge>
    }
  }

  return (
    <>
      <Topbar
        title="Dashboard"
        actions={
          <>
            <span className="text-xs text-soft">Next call: Winners Final · 18:30</span>
            <Button size="sm" icon={Trophy} onClick={() => onNavigate('create')}>
              New tournament
            </Button>
          </>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex gap-px bg-border rounded-md overflow-hidden border border-border mb-5">
          {[
            { label: 'Active tournaments', value: tournaments.filter(t => t.status === 'STARTED').length, sub: `${tournaments.filter(t => t.status === 'STARTED').length} in finals · ${tournaments.filter(t => t.status === 'CREATED').length} open`, color: 'text-purple' },
            { label: 'Total players', value: totalPlayers, sub: `Across all tournaments`, color: 'text-green' },
            { label: 'Matches played', value: matchesPlayed, sub: 'Finished matches', color: '' },
            { label: 'Upcoming matches', value: upcomingMatches, sub: 'Ready to play', color: 'text-purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-bg-el flex-1 px-4 py-3.5">
              <div className="text-[11px] uppercase tracking-wider text-soft mb-1.5">{stat.label}</div>
              <div className={`text-[22px] font-semibold tabular-nums tracking-tight ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] text-muted mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-4 items-start">
          <div className="flex flex-col gap-4">
            <Card title="Active tournaments" action={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('tournament-list')}>
                View all →
              </Button>
            }>
              <div className="-mx-4 -mb-3">
                <Table
                  columns={[
                    { key: 'name', header: 'Tournament', render: (t: Tournament) => <span className="font-medium">{t.name}</span> },
                    { key: 'status', header: 'Status', render: (t: Tournament) => statusBadge(t.status) },
                    { key: 'game', header: 'Game', render: (t: Tournament) => <span className="text-muted text-xs">{t.game}</span> },
                    { key: 'actions', header: '', render: (t: Tournament) => (
                      <Button variant="ghost" size="sm" onClick={() => onNavigate('tournament-detail', t.id)}>
                        Open →
                      </Button>
                    )},
                  ]}
                  data={tournaments.slice(0, 4)}
                />
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card title="Quick actions">
              <div className="flex flex-col gap-1.5">
                <Button style={{ width: '100%', justifyContent: 'center' }} icon={Trophy} onClick={() => onNavigate('create')}>
                  Create tournament
                </Button>
                <Button variant="secondary" style={{ width: '100%', justifyContent: 'center' }} icon={Users} onClick={() => onNavigate('players')}>
                  Register player
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
