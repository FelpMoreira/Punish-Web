import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Lock, Trash2, X } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import type { Player } from '../types'

interface Props {
  tournamentId: number
  onBack: () => void
}

const SENHA_KEY = 'manipulacao_senha'

export function Manipulacao({ tournamentId, onBack }: Props) {
  const [unlocked, setUnlocked] = useState(() => !!sessionStorage.getItem(SENHA_KEY))
  const [senha, setSenha] = useState(() => sessionStorage.getItem(SENHA_KEY) ?? '')
  const [players, setPlayers] = useState<Player[]>([])
  const [selecionados, setSelecionados] = useState<number[]>([])
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!unlocked) return
    api.tournaments.players(tournamentId).then(setPlayers).catch(() => setPlayers([]))
    api.tournaments.getManipulacao(tournamentId).then((m) => {
      if (m) setSelecionados([m.fk_rival_a_id, m.fk_rival_b_id])
    }).catch(() => {})
  }, [unlocked, tournamentId])

  const unlock = () => {
    if (!senha.trim()) return
    sessionStorage.setItem(SENHA_KEY, senha.trim())
    setSenha(senha.trim())
    setUnlocked(true)
  }

  const toggle = (id: number) => {
    setStatus(null)
    setErro(null)
    setSelecionados((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const salvar = async () => {
    if (selecionados.length !== 2) {
      setErro('Selecione exatamente 2 jogadores.')
      return
    }
    setLoading(true)
    setErro(null)
    setStatus(null)
    try {
      await api.tournaments.setManipulacao(tournamentId, selecionados[0], selecionados[1], senha.trim())
      setStatus('Dupla salva. Agora gere o chaveamento na tela do torneio.')
    } catch {
      setErro('Falha ao salvar. Verifique a senha e se o torneio ainda está aberto.')
    } finally {
      setLoading(false)
    }
  }

  const limpar = async () => {
    setLoading(true)
    setErro(null)
    setStatus(null)
    try {
      await api.tournaments.clearManipulacao(tournamentId, senha.trim())
      setSelecionados([])
      setStatus('Manipulação limpa.')
    } catch {
      setErro('Falha ao limpar. Verifique a senha.')
    } finally {
      setLoading(false)
    }
  }

  if (!unlocked) {
    return (
      <div className="h-dvh overflow-y-auto flex items-center justify-center px-5">
        <div className="w-full max-w-[340px]">
          <div className="flex flex-col items-center mb-5">
            <div className="w-9 h-9 rounded-md bg-bg-el border border-border flex items-center justify-center mb-3">
              <Lock size={15} className="text-muted" />
            </div>
            <div className="text-sm font-semibold text-center">Acesso restrito</div>
            <div className="text-xs text-muted text-center mt-1">Informe a senha para continuar.</div>
          </div>
          <div className="flex flex-col gap-2.5">
            <Input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') unlock() }}
            />
            <Button icon={Lock} style={{ width: '100%', justifyContent: 'center' }} onClick={unlock} disabled={!senha.trim()}>
              Desbloquear
            </Button>
            <button onClick={onBack} className="text-xs text-muted hover:text-text transition-colors cursor-pointer mt-1">
              Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filtrados = players.filter((p) =>
    busca.trim() ? p.nickname.toLowerCase().includes(busca.trim().toLowerCase()) : true
  )

  return (
    <div className="h-dvh overflow-y-auto">
      <div className="max-w-[520px] mx-auto px-4 py-5">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-md bg-bg-el border border-border flex items-center justify-center text-muted hover:text-text transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="text-sm font-semibold">Manipulação</div>
            <div className="text-[11px] text-muted">Defina a dupla que cai junto na 1ª fase</div>
          </div>
        </div>

        <div className="bg-bg-el border border-border rounded-md p-3 mb-3">
          <div className="text-xs font-semibold mb-2">Duo obrigatório</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-9 rounded-md border border-border bg-bg flex items-center px-2.5 text-xs">
              {selecionados.length > 0 ? (players.find((p) => p.id === selecionados[0])?.nickname ?? '—') : <span className="text-muted">jogador 1</span>}
            </div>
            <span className="text-xs text-muted">vs</span>
            <div className="flex-1 h-9 rounded-md border border-border bg-bg flex items-center px-2.5 text-xs">
              {selecionados.length > 1 ? (players.find((p) => p.id === selecionados[1])?.nickname ?? '—') : <span className="text-muted">jogador 2</span>}
            </div>
          </div>
          <div className="text-[11px] text-muted mt-2">
            Esses dois jogadores se enfrentam na primeira rodada. A ordem dentro do chaveamento é definida pelo sorteio.
          </div>
        </div>

        <Input placeholder="Buscar jogador..." value={busca} onChange={(e) => setBusca(e.target.value)} />

        <div className="mt-2 border border-border rounded-md overflow-hidden max-h-[45dvh] overflow-y-auto">
          {filtrados.length === 0 ? (
            <div className="text-xs text-muted py-6 text-center">Nenhum jogador encontrado.</div>
          ) : filtrados.map((p) => {
            const idx = selecionados.indexOf(p.id)
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left border-b border-border last:border-b-0 transition-colors cursor-pointer ${
                  idx >= 0 ? 'bg-purple/10' : 'hover:bg-bg-hover'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-sm border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    idx === 0 ? 'border-purple bg-purple text-white'
                      : idx === 1 ? 'border-cyan bg-cyan text-white'
                      : 'border-border text-muted'
                  }`}
                >
                  {idx >= 0 ? idx + 1 : ''}
                </span>
                <span className="text-sm flex-1 truncate">{p.nickname}</span>
                {idx >= 0 && <X size={13} className="text-muted shrink-0" />}
              </button>
            )
          })}
        </div>

        {erro && <div className="text-xs text-red mt-3">{erro}</div>}
        {status && (
          <div className="text-xs text-green mt-3 flex items-center gap-1.5">
            <Check size={12} /> {status}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4">
          <Button
            icon={Check}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={salvar}
            disabled={loading || selecionados.length !== 2}
          >
            {loading ? 'Salvando...' : 'Salvar dupla'}
          </Button>
          <Button
            variant="secondary"
            icon={Trash2}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={limpar}
            disabled={loading || selecionados.length === 0}
          >
            Limpar manipulação
          </Button>
        </div>
      </div>
    </div>
  )
}
