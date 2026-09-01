import { useState } from 'react'
import { api } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Topbar } from '../components/layout/Topbar'
import { Trophy } from 'lucide-react'

interface Props {
  onNavigate: (page: string, id?: number) => void
}

export function Create({ onNavigate }: Props) {
  const [name, setName] = useState('')
  const [game, setGame] = useState('')
  const [loading, setLoading] = useState(false)

  const create = async () => {
    if (!name.trim() || !game.trim()) return
    setLoading(true)
    try {
      const t = await api.tournaments.create(name.trim(), game.trim())
      onNavigate('tournament-detail', t.id)
    } catch {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar
        breadcrumb={[
          { label: 'My Tournaments', page: 'tournament-list' },
          { label: 'Create Tournament' },
        ]}
      />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-[420px]">
          <Card title="Create Tournament">
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-soft font-semibold mb-1 block">Tournament Name</label>
                <Input placeholder="e.g. Punish Masters" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-soft font-semibold mb-1 block">Game</label>
                <Input placeholder="e.g. Street Fighter 6" value={game} onChange={(e) => setGame(e.target.value)} />
              </div>
              <Button
                icon={Trophy}
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading || !name.trim() || !game.trim()}
                onClick={create}
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
