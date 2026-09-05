import { useState, useEffect } from 'react'
import { api, storage } from '../services/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Table } from '../components/ui/Table'
import { Topbar } from '../components/layout/Topbar'
import type { Tournament, Player, Match, Ranking, TournamentInviteDetail, TournamentRequest } from '../types'
import { X, Trash2, GitBranch, UserPlus, Play, RefreshCw, Copy } from 'lucide-react'

interface Props {
  onNavigate: (page: string, id?: number | string) => void
  tournamentId: number
}

export function TournamentDetail({ onNavigate, tournamentId }: Props) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([])
  const [ranking, setRanking] = useState<Ranking[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteCode, setInviteCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [expiraEm, setExpiraEm] = useState('')
  const [usosMax, setUsosMax] = useState('')
  const [invites, setInvites] = useState<TournamentInviteDetail[]>([])
  const [copiedInviteId, setCopiedInviteId] = useState<number | null>(null)
  const [requests, setRequests] = useState<TournamentRequest[]>([])
  const [solicitado, setSolicitado] = useState(false)

  const inviteUrl = inviteCode ? `${window.location.origin}/#/invite/${inviteCode}` : ''

  const copyInvite = () => {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyInviteCode = (invite: TournamentInviteDetail) => {
    navigator.clipboard.writeText(`${window.location.origin}/#/invite/${invite.codigo}`)
    setCopiedInviteId(invite.id)
    setTimeout(() => setCopiedInviteId(null), 2000)
  }

  const revokeInvite = (inviteId: number) => {
    api.tournaments.revokeInvite(tournamentId, inviteId).then(load).catch(() => {})
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR')
  }

  const solicitar = () => {
    api.tournaments.solicitarPedido(tournamentId)
      .then(() => {
        setSolicitado(true)
      })
      .catch((err) => {
        setSolicitado(true)
        if (!/já enviado/.test(err?.message || '')) alert('Erro ao solicitar entrada: ' + err.message)
      })
  }

  const aceitar = (playerId: number) => {
    api.tournaments.aceitarPedido(tournamentId, playerId).then(load).catch(() => {})
  }

  const rejeitar = (playerId: number) => {
    api.tournaments.rejeitarPedido(tournamentId, playerId).then(load).catch(() => {})
  }

  const load = () => {
    api.tournaments.get(tournamentId).then(setTournament).catch(() => {})
    api.tournaments.players(tournamentId).then(setPlayers).catch(() => {})
    api.tournaments.matches(tournamentId).then(setMatches).catch(() => {})
    api.players.list().then(setAllPlayers).catch(() => {})
    api.tournaments.ranking(tournamentId).then(setRanking).catch(() => {})
    api.tournaments.listInvites(tournamentId).then(setInvites).catch(() => {})
    api.tournaments.listarPedidos(tournamentId).then(setRequests).catch(() => {})
    setSelectedToAdd([])
  }

  useEffect(() => { load() }, [tournamentId])

  const toggleAdd = (id: number) => {
    setSelectedToAdd((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const addSelected = () => {
    if (!selectedToAdd.length) return
    Promise.all(selectedToAdd.map((id) => api.tournaments.addPlayer(tournamentId, id)))
      .then(load).catch(() => {})
  }

  const removePlayer = (playerId: number) => {
    api.tournaments.removePlayer(tournamentId, playerId).then(load).catch(() => {})
  }

  const generate = () => {
    api.tournaments.generate(tournamentId).then(() => {
      load()
    }).catch((err) => {
      alert('Erro ao gerar bracket: ' + err.message)
      load()
    })
  }

  const openInviteModal = () => {
    setInviteCode('')
    setExpiraEm('')
    setUsosMax('')
    setShowInvite(true)
  }

  const submitInvite = () => {
    api.tournaments.invite(tournamentId, expiraEm || undefined, usosMax ? Number(usosMax) : undefined)
      .then((invite) => {
        setInviteCode(invite.codigo)
      })
      .catch((err) => {
        alert('Erro ao gerar convite: ' + err.message)
      })
  }

  const recalculate = () => {
    api.tournaments.recalculate(tournamentId).then(() => {
      return api.tournaments.generate(tournamentId)
    }).then(() => {
      load()
    }).catch((err) => {
      alert('Erro ao recalcular bracket: ' + err.message)
      load()
    })
  }

  const startMatch = (matchId: number) => {
    api.matches.start(matchId).then(load).catch(() => {})
  }

  const startRound = (round: number) => {
    api.matches.startRound(tournamentId, round).then(load).catch(() => {})
  }

  const firstReadyRound = matches
    .filter((m) => m.status === 'READY' && m.fk_player1_id && m.fk_player2_id && !m.fk_winner_id)
    .sort((a, b) => a.round_number - b.round_number)[0]?.round_number

  const submitResult = (matchId: number, winnerId: number) => {
    api.matches.result(matchId, { fk_winner_id: winnerId, score_player1: 0, score_player2: 0 }).then(load).catch(() => {})
  }

  const statusLabel = (m: Match) => {
    if (m.fk_winner_id) return <Badge variant="finished">Done</Badge>
    if (m.status === 'IN_PROGRESS') return <Badge variant="live">In Progress</Badge>
    if (m.fk_player1_id && m.fk_player2_id) return <Badge variant="waiting">Ready</Badge>
    if (m.fk_player1_id || m.fk_player2_id) return <Badge variant="waiting">Waiting</Badge>
    return <Badge variant="next">—</Badge>
  }

  const placementLabel = (p: number) => {
    if (p === 1) return '1st'
    if (p === 2) return '2nd'
    if (p === 3) return '3rd'
    return `${p}th`
  }

  const renderActions = (m: Match) => {
    if (m.fk_player1_id && m.fk_player2_id && !m.fk_winner_id) {
      if (m.status === 'IN_PROGRESS') {
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => submitResult(m.id, m.fk_player1_id!)}>
              P1
            </Button>
            <Button size="sm" variant="ghost" onClick={() => submitResult(m.id, m.fk_player2_id!)}>
              P2
            </Button>
          </div>
        )
      }
      return <Button size="sm" variant="ghost" onClick={() => startMatch(m.id)}>Start</Button>
    }
    if (m.fk_winner_id) {
      return (
        <span className="text-xs text-green font-medium">
          Winner: {players.find(p => p.id === m.fk_winner_id)?.nickname || `#${m.fk_winner_id}`}
        </span>
      )
    }
    return null
  }

  return (
    <>
      <Topbar
        breadcrumb={[
          { label: 'My Tournaments', page: 'tournament-list' },
          { label: tournament?.name || `#${tournamentId}` },
        ]}
        actions={
          <>
            {tournament?.status === 'CREATED' && (
              <Button size="sm" icon={GitBranch} onClick={generate}>
                Generate bracket
              </Button>
            )}
            {tournament?.status !== 'CREATED' && tournament?.status !== 'FINISHED' && (
              <Button size="sm" variant="ghost" icon={RefreshCw} onClick={recalculate}>
                Recalculate
              </Button>
            )}
            {tournament?.status === 'CREATED' && storage.user ? (
              <div className="hidden sm:block flex items-center gap-2">
                <Button size="sm" variant="ghost" icon={UserPlus} onClick={openInviteModal}>
                  Gerar convite
                </Button>
              </div>
            ) : undefined}
            <Button size="sm" variant="ghost" onClick={() => onNavigate('tournament-list')}>
              ← Back
            </Button>
          </>
        }
      />
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-bg max-w-md w-full rounded-lg p-6 shadow-xl border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Link de Convite</h3>
              <button
                onClick={() => setShowInvite(false)}
                className="text-muted hover:text-red cursor-pointer p-1"
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            {inviteUrl ? (
              <>
                <div className="flex items-center gap-2 rounded-lg p-2 border border-border-md" style={{ background: 'var(--bg-secondary)' }}>
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-transparent border-none focus:outline-none px-2 py-1.5 text-sm text-text truncate"
                  />
                  <Button size="sm" icon={Copy} onClick={copyInvite}>
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
                <p className="text-xs text-muted mt-3">
                  Envie este link para jogadores entrarem no torneio. O link pode ser usado enquanto o torneio estiver no status <strong>CREATED</strong>.
                </p>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => onNavigate('invite', inviteCode)}>
                    Testar abrindo o link →
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-soft font-semibold mb-1 block">
                    Expira em (opcional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={expiraEm}
                    onChange={(e) => setExpiraEm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-soft font-semibold mb-1 block">
                    Usos máximos (opcional)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Sem limite"
                    value={usosMax}
                    onChange={(e) => setUsosMax(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted">
                  Deixe em branco para convite sem expiração e sem limite de uso.
                </p>
                <div className="mt-1 flex justify-end">
                  <Button size="sm" icon={UserPlus} onClick={submitInvite}>
                    Gerar convite
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="flex flex-col gap-4">
            <Card
              title={`Matches (${matches.length})`}
              action={
                firstReadyRound !== undefined && tournament?.status !== 'FINISHED' ? (
                  <Button size="sm" icon={Play} onClick={() => startRound(firstReadyRound)}>
                    Start Round {firstReadyRound}
                  </Button>
                ) : undefined
              }
            >
              {matches.length > 0 ? (
                <div className="-mx-4 -mb-3">
                  <Table
                    columns={[
                      { key: 'round', header: 'Round', render: (m: Match) => <span className="text-xs">R{m.round_number}</span> },
                      { key: 'p1', header: 'Player 1', render: (m: Match) => m.fk_player1_id ? players.find(p => p.id === m.fk_player1_id)?.nickname || `#${m.fk_player1_id}` : <span className="text-muted italic text-xs">TBD</span> },
                      { key: 'vs', header: '', render: () => <span className="text-soft text-xs">vs</span> },
                      { key: 'p2', header: 'Player 2', render: (m: Match) => m.fk_player2_id ? players.find(p => p.id === m.fk_player2_id)?.nickname || `#${m.fk_player2_id}` : <span className="text-muted italic text-xs">TBD</span> },
                      { key: 'status', header: '', render: (m: Match) => statusLabel(m) },
                      { key: 'actions', header: '', render: renderActions },
                    ]}
                    data={matches.sort((a, b) => a.round_number - b.round_number || a.id - b.id)}
                  />
                </div>
              ) : (
                <div className="text-sm text-muted text-center py-6">
                  {tournament?.status === 'CREATED' ? 'Generate a bracket to see matches.' : 'No matches yet.'}
                </div>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card title={`Players (${players.length})`}>
              <div className="flex flex-col gap-1 -mx-4 -mt-3">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-1.5 border-b border-border last:border-b-0">
                    <span className="text-sm">{p.nickname}</span>
                    <button onClick={() => removePlayer(p.id)} className="text-muted hover:text-red cursor-pointer p-0.5">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {players.length === 0 && (
                  <div className="text-sm text-muted text-center py-4">No players added yet.</div>
                )}
              </div>
              {tournament?.status !== 'FINISHED' && (
                <div className="mt-2 pt-3 border-t border-border">
                  <div className="text-[11px] uppercase tracking-wider text-soft font-semibold mb-2">
                    Add players
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto -mx-4 px-4">
                    {allPlayers
                      .filter((p) => !players.find((tp) => tp.id === p.id))
                      .map((p) => (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 px-1 py-1 rounded-sm hover:bg-bg-hover cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedToAdd.includes(p.id)}
                            onChange={() => toggleAdd(p.id)}
                            className="accent-purple"
                          />
                          {p.nickname}
                        </label>
                      ))}
                    {allPlayers.filter((p) => !players.find((tp) => tp.id === p.id)).length === 0 && (
                      <div className="text-xs text-muted py-2">All players are already in this tournament.</div>
                    )}
                  </div>
                  {selectedToAdd.length > 0 && (
                    <Button size="sm" icon={UserPlus} onClick={addSelected} className="mt-2 w-full justify-center">
                      Add selected ({selectedToAdd.length})
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {tournament && storage.user && tournament.fk_owner !== storage.user.id && tournament.status === 'CREATED' && (
              <Card title="Inscrição">
                {players.some((p) => p.id === storage.user!.id) ? (
                  <div className="text-sm text-muted text-center py-1">Você já está neste torneio.</div>
                ) : solicitado ? (
                  <div className="text-sm text-muted text-center py-1">Pedido enviado! Aguardando aprovação.</div>
                ) : (
                  <Button size="sm" icon={UserPlus} onClick={solicitar} className="w-full justify-center">
                    Pedir pra entrar
                  </Button>
                )}
              </Card>
            )}

            {tournament && storage.user && tournament.fk_owner === storage.user.id && requests.length > 0 && (
              <Card title={`Pedidos de entrada (${requests.length})`}>
                <div className="flex flex-col gap-1 -mx-4 -mt-3">
                  {requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between px-4 py-1.5 border-b border-border last:border-b-0">
                      <span className="text-sm">
                        {allPlayers.find((p) => p.id === req.fk_player_id)?.nickname || `#${req.fk_player_id}`}
                      </span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="secondary" onClick={() => aceitar(req.fk_player_id)}>
                          Aceitar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => rejeitar(req.fk_player_id)}>
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tournament && storage.user && tournament.fk_owner === storage.user.id && (
              <Card title={`Convites (${invites.length})`}>
                <div className="flex flex-col gap-1 -mx-4 -mt-3">
                  {invites.length === 0 && (
                    <div className="text-sm text-muted text-center py-4">Nenhum convite gerado ainda.</div>
                  )}
                  {invites.map((invite) => (
                    <div key={invite.id} className="px-4 py-2 border-b border-border last:border-b-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyInviteCode(invite)}
                          className="flex items-center gap-1 text-xs font-mono text-purple hover:underline cursor-pointer truncate"
                          title="Copiar link de convite"
                        >
                          <Copy size={12} />
                          {invite.codigo.slice(0, 8)}…
                        </button>
                        <span className="text-xs text-muted flex-1 text-right">
                          {invite.usos}/{invite.usosMax ?? '∞'} usos
                        </span>
                        <button onClick={() => revokeInvite(invite.id)} className="text-muted hover:text-red cursor-pointer p-0.5" title="Revogar convite">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {copiedInviteId === invite.id && (
                        <div className="text-[11px] text-green mt-1">Link copiado!</div>
                      )}
                      <div className="text-[11px] text-muted mt-0.5">
                        Expira {invite.expiraEm ? formatDate(invite.expiraEm) : 'sem data'}
                      </div>
                      {invite.usosDetalhados.length > 0 && (
                        <div className="mt-1.5 flex flex-col gap-0.5 border-t border-border pt-1.5">
                          {invite.usosDetalhados.map((uso) => (
                            <div key={uso.playerId + uso.usadoEm} className="flex items-center justify-between text-[11px] text-muted">
                              <span>{uso.nickname}</span>
                              <span>{formatDate(uso.usadoEm)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tournament?.fk_winner_id && (
              <Card title="Champion">
                <div className="flex items-center gap-2">
                  <Badge variant="finished">🏆</Badge>
                  <span className="text-sm font-semibold">
                    {players.find(p => p.id === tournament.fk_winner_id)?.nickname || `#${tournament.fk_winner_id}`}
                  </span>
                </div>
              </Card>
            )}

            {ranking.length > 0 && (
              <Card title="Ranking">
                <div className="flex flex-col gap-1 -mx-4 -mt-3">
                  {ranking.map((r) => (
                    <div key={r.player_id} className="flex items-center justify-between px-4 py-1.5 border-b border-border last:border-b-0">
                      <span className="text-xs font-medium text-muted w-8">{placementLabel(r.placement)}</span>
                      <span className="text-sm flex-1">{r.nickname}</span>
                      {r.placement <= 3 && (
                        <span className="text-xs">{r.placement === 1 ? '🥇' : r.placement === 2 ? '🥈' : '🥉'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
