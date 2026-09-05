import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table } from '../components/ui/Table'
import { Input } from '../components/ui/Input'
import { Topbar } from '../components/layout/Topbar'
import type { Player, PlayerStats } from '../types'
import { PencilLine, Check, X, Plus, Trash2, Search, BarChart3 } from 'lucide-react'

export function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [search, setSearch] = useState('')
  const [newNick, setNewNick] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [statsId, setStatsId] = useState<number | null>(null)
  const [stats, setStats] = useState<PlayerStats | null>(null)

  const load = () => api.players.list(search || undefined).then(setPlayers).catch(() => {})
  useEffect(() => { load() }, [search])

  const showStats = (id: number) => {
    setStatsId(id)
    api.players.stats(id).then(setStats).catch(() => {})
  }

  const create = () => {
    if (!newNick.trim()) return
    api.players.create(newNick.trim()).then(() => {
      setNewNick('')
      load()
    }).catch(() => {})
  }

  return (
    <>
      <Topbar title="Players" />
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="max-w-[600px]">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search by nickname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-bg-el border border-border rounded-md outline-none focus:border-purple"
            />
          </div>
          <Card title={`All Players (${players.length})`}>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="New player nickname..."
                value={newNick}
                onChange={(e) => setNewNick(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && create()}
              />
              <Button size="sm" icon={Plus} onClick={create}>Add</Button>
            </div>
            <div className="-mx-4 -mb-3">
              <Table
                columns={[
                  { key: 'id', header: '#', render: (p: Player) => <span className="text-xs text-soft">#{p.id}</span> },
                  { key: 'nickname', header: 'Nickname', render: (p: Player) => (
                    editingId === p.id ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { setEditingId(null); load() }
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                      />
                    ) : (
                      <span className="text-sm">{p.nickname}</span>
                    )
                  )},
                  { key: 'actions', header: '', render: (p: Player) => (
                    <div className="flex gap-1 justify-end">
                      {editingId === p.id ? (
                        <>
                          <Button size="sm" variant="ghost" icon={Check} onClick={() => { setEditingId(null); load() }} />
                          <Button size="sm" variant="ghost" icon={X} onClick={() => setEditingId(null)} />
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" icon={BarChart3} onClick={() => showStats(p.id)} />
                          <Button size="sm" variant="ghost" icon={PencilLine} onClick={() => { setEditingId(p.id); setEditValue(p.nickname) }} />
                          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => { api.players.delete(p.id).then(load) }} />
                        </>
                      )}
                    </div>
                  )},
                ]}
                data={players}
              />
            </div>
            {statsId !== null && stats && (
              <div className="mt-3 p-3 rounded-md bg-bg-hover border border-border text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs uppercase tracking-wider text-soft">
                    {players.find(p => p.id === statsId)?.nickname} — Stats
                  </span>
                  <button onClick={() => { setStatsId(null); setStats(null) }} className="text-muted hover:text-red cursor-pointer text-xs">✕</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold">{stats.totalTournaments}</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">Torneios</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green">{stats.totalWins}</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">Vitórias</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red">{stats.totalLosses}</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">Derrotas</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{stats.winRate}%</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">Win Rate</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
