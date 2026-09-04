import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { api } from '../services/api'

interface Props {
  onNavigate: (page: string, id?: number | string) => void
  codigo: string
}

export function Invite({ onNavigate, codigo }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const join = async () => {
    setLoading(true)
    setError('')
    try {
      await api.tournaments.joinInvite(codigo)
      alert('Você entrou no torneio!')
      onNavigate('tournament-list')
    } catch (err: any) {
      setError(err?.message?.replace(/^.*?"error "/, '').replace(/".*$/, '') || 'Não foi possível entrar no torneio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-7 h-7 bg-purple rounded-sm flex items-center justify-center text-[11px] font-bold text-white">PT</div>
          <span className="text-sm font-semibold tracking-wider uppercase">Punish</span>
        </div>
        <div className="bg-bg-el border border-border rounded-md p-5 text-center">
          <div className="text-sm font-semibold mb-2">Convite de torneio</div>
          <p className="text-xs text-muted mb-5">
            Você foi convidado para entrar em um torneio. Toque em entrar para se juntar.
          </p>
          {error && <div className="text-xs text-red-500 mb-3">{error}</div>}
          <Button onClick={join} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Entrando...' : 'Entrar no torneio'}
          </Button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="mt-4 text-xs text-muted hover:text-text cursor-pointer"
          >
            Cancelar e voltar
          </button>
        </div>
      </div>
    </div>
  )
}