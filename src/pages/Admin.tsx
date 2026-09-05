import { useState, useEffect } from 'react'
import { api, storage } from '../services/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Topbar } from '../components/layout/Topbar'
import type { User } from '../types'
import { Loader2 } from 'lucide-react'

const roleBadge = (role?: string) => {
  switch (role) {
    case 'ADMIN': return <Badge variant="finished">Admin</Badge>
    case 'ORGANIZER': return <Badge variant="running">Organizador</Badge>
    default: return <Badge variant="waiting">Player</Badge>
  }
}

export function Admin() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingId, setPendingId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    setError('')
    api.admin.listPlayers()
      .then(setUsers)
      .catch((err: any) => setError(err?.message || 'Erro ao carregar usuários'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const changeRole = async (id: number, role: string) => {
    setPendingId(id)
    try {
      await api.admin.setRole(id, role)
      load()
    } catch (err: any) {
      setError(err?.message || 'Erro ao mudar a role')
    } finally {
      setPendingId(null)
    }
  }

  const currentUser = storage.user
  const roles = ['PLAYER', 'ORGANIZER', 'ADMIN']

  return (
    <>
      <Topbar title="Admin" />
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="max-w-[720px]">
          <Card title={`Usuários (${users.length})`}>
            {error && <div className="text-xs text-red-500 mb-3">{error}</div>}
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted py-8">
                <Loader2 size={16} className="animate-spin" />
                Carregando...
              </div>
            ) : (
              <div className="flex flex-col gap-1 -mx-4 -mt-3">
                {users.length === 0 && (
                  <div className="text-sm text-muted text-center py-4">Nenhum usuário encontrado.</div>
                )}
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-2 border-b border-border last:border-b-0 gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-sm bg-purple/20 text-purple flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                        {u.nickname?.[0]?.toUpperCase() ?? '?'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{u.nickname}</span>
                          {roleBadge(u.role)}
                        </div>
                        <div className="text-[11px] text-muted truncate">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <select
                        value={u.role}
                        disabled={pendingId === u.id || currentUser?.id === u.id}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="h-8 px-2 text-xs bg-bg-surf border border-border-md rounded-sm outline-none focus:border-purple cursor-pointer disabled:opacity-50"
                        title={currentUser?.id === u.id ? 'Você não pode mudar sua própria role' : 'Mudar role'}
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r === 'PLAYER' ? 'Player' : r === 'ORGANIZER' ? 'Organizador' : 'Admin'}
                          </option>
                        ))}
                      </select>
                      {pendingId === u.id && <span className="text-[11px] text-muted">salvando...</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}