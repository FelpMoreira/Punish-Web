import { useMemo } from 'react'
import type { Match, Player } from '../../types'
import { Badge } from '../ui/Badge'

interface Props {
  matches: Match[]
  players: Player[]
  onSubmitResult: (matchId: number, winnerId: number) => void
  onStartMatch: (matchId: number) => void
}

const CARD_W = 180
const CARD_H = 56
const V_GAP = 26
const H_GAP = 32

const SECTION_COLORS: Record<string, string> = {
  WINNERS: '#22d3ee',
  LOSERS: '#f59e0b',
  GRAND_FINAL: '#8b5cf6',
}

const SECTION_LABELS: Record<string, string> = {
  WINNERS: 'WINNERS BRACKET',
  LOSERS: 'LOSERS BRACKET',
  GRAND_FINAL: 'GRAND FINAL',
}

type ViewMatch = { m: Match; index: number }

interface Column {
  matches: ViewMatch[]
}

const buildColumns = (list: Match[]): Column[] => {
  const maxRound = list.length ? Math.max(...list.map((m) => m.round_number)) : 0
  const cols: Column[] = []
  for (let r = 1; r <= maxRound; r++) {
    const roundMatches = list
      .filter((m) => m.round_number === r)
      .sort((a, b) => (a.match_number ?? 0) - (b.match_number ?? 0))
    if (roundMatches.length) {
      cols.push({ matches: roundMatches.map((m, i) => ({ m, index: i })) })
    }
  }
  return cols
}

// posição vertical: cada match de uma rodada "span" cobre 2^(r) slots de folha
const columnHeight = (cols: Column[], colIdx: number): number => {
  const count = cols[colIdx].matches.length
  return count * CARD_H + (count - 1) * V_GAP
}

const totalWidth = (nCols: number): number => nCols * CARD_W + (nCols - 1) * H_GAP

export function BracketTree({ matches, players, onSubmitResult, onStartMatch }: Props) {
  const sections = useMemo(() => {
    const keys = ['WINNERS', 'LOSERS', 'GRAND_FINAL']
    const out: Record<string, Match[]> = { WINNERS: [], LOSERS: [], GRAND_FINAL: [] }
    for (const k of keys) out[k] = matches.filter((m) => (m.bracket_type || 'WINNERS') === k)
    return out
  }, [matches])

  const hasMatches = matches.length > 0

  if (!hasMatches) {
    return (
      <div className="text-sm text-muted text-center py-6">No matches yet.</div>
    )
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-12 min-w-max">
        {(['WINNERS', 'LOSERS', 'GRAND_FINAL'] as const).map((sectionKey) => {
          const sectionMatches = sections[sectionKey]
          if (!sectionMatches.length) return null

          const cols = buildColumns(sectionMatches)
          const color = SECTION_COLORS[sectionKey]
          const label = SECTION_LABELS[sectionKey]
          const height = Math.max(...cols.map((_, i) => {
            let h = 0
            for (let j = 0; j < cols.length; j++) h += columnHeight(cols, j)
            return columnHeight(cols, i) * 2 ** i + 48
          }), columnHeight(cols, 0) + 48)

          const width = totalWidth(cols.length)

          const posY = (colIdx: number, index: number, count: number): number => {
            // match em round r cobre 2^r slots de folha, centralizado
            const span = 2 ** colIdx
            const slotH = CARD_H + V_GAP
            const center = (count - 1) * slotH * (span / 2)
            return 48 + center + (index * span + (span - 1) / 2) * slotH - CARD_H / 2
          }

          const pos = (vm: ViewMatch, colIdx: number): number =>
            posY(colIdx, vm.index, cols[colIdx].matches.length)

          return (
            <div key={sectionKey} className="flex flex-col flex-shrink-0 gap-3">
              <div
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border w-fit"
                style={{ color, borderColor: `${color}40`, background: `${color}14` }}
              >
                {label}
              </div>

              <div className="relative" style={{ width, height }}>
                {/* conectores dos vencedores */}
                {cols.slice(0, -1).flatMap((col, colIdx) =>
                  col.matches.flatMap((vm) => {
                    if (!vm.m.fk_next_match_win_id) return []
                    const fromX = (colIdx + 1) * CARD_W + colIdx * H_GAP
                    const fromY = pos(vm, colIdx) + CARD_H / 2
                    const parentCol = colIdx + 1
                    const parentVm = cols[parentCol]?.matches.find((p) => p.m.id === vm.m.fk_next_match_win_id)
                    if (!parentVm) return []
                    const toX = parentCol * CARD_W + (parentCol - 1) * H_GAP
                    const toY = pos(parentVm, parentCol) + CARD_H / 2

                    return [
                      <line key={`h-${colIdx}-${vm.index}`} x1={fromX} y1={fromY} x2={toX} y2={fromY} stroke={color} strokeOpacity="0.4" strokeWidth={1} />,
                      <line key={`v-${colIdx}-${vm.index}`} x1={toX} y1={fromY} x2={toX} y2={toY} stroke={color} strokeOpacity="0.4" strokeWidth={1} />,
                    ]
                  })
                )}

                {/* cabeçalhos das colunas */}
                {cols.map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="absolute top-0 text-[10px] uppercase tracking-wider text-soft font-semibold text-center"
                    style={{ left: colIdx * (CARD_W + H_GAP), width: CARD_W }}
                  >
                    {sectionKey === 'GRAND_FINAL' && cols.length === 1 ? 'Final' : `Round ${colIdx + 1}`}
                  </div>
                ))}

                {/* cards */}
                {cols.flatMap((col, colIdx) =>
                  col.matches.map((vm) => (
                    <div
                      key={vm.m.id}
                      className="absolute"
                      style={{ left: colIdx * (CARD_W + H_GAP), top: pos(vm, colIdx), width: CARD_W }}
                    >
                      <MatchCard
                        m={vm.m}
                        playerName={(id) =>
                          id ? players.find((p) => p.id === id)?.nickname || `#${id}` : 'TBD'
                        }
                        onSubmitResult={onSubmitResult}
                        onStartMatch={onStartMatch}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MatchCard({ m, playerName, onSubmitResult, onStartMatch }: {
  m: Match
  playerName: (id: number | null) => string
  onSubmitResult: (id: number, winnerId: number) => void
  onStartMatch: (id: number) => void
}) {
  const ready = Boolean(m.fk_player1_id && m.fk_player2_id)
  const canStart = ready && m.status !== 'IN_PROGRESS' && !m.fk_winner_id
  const picking = m.status === 'IN_PROGRESS' && ready && !m.fk_winner_id
  const topColor = m.fk_winner_id
    ? '#22c55e'
    : m.status === 'IN_PROGRESS'
      ? '#ef4444'
      : SECTION_COLORS[m.bracket_type || 'WINNERS']

  const statusLabel = m.fk_winner_id
    ? <Badge variant="finished">Done</Badge>
    : m.status === 'IN_PROGRESS'
      ? <Badge variant="live">Live</Badge>
      : <Badge variant={ready ? 'waiting' : 'next'}>{ready ? 'Ready' : 'Waiting'}</Badge>

  return (
    <div className={`border border-border rounded-sm bg-bg-el overflow-hidden ${picking ? '' : ''}`}>
      <div className="h-1.5 w-full" style={{ background: topColor }} />
      <div className="px-2.5 py-2 flex flex-col gap-1.5">
        <PlayerRow
          label={playerName(m.fk_player1_id)}
          muted={!m.fk_player1_id}
          winner={m.fk_winner_id === m.fk_player1_id}
          onPick={picking ? () => onSubmitResult(m.id, m.fk_player1_id!) : undefined}
        />
        <div className="border-t border-border/70" />
        <PlayerRow
          label={playerName(m.fk_player2_id)}
          muted={!m.fk_player2_id}
          winner={m.fk_winner_id === m.fk_player2_id}
          onPick={picking ? () => onSubmitResult(m.id, m.fk_player2_id!) : undefined}
        />
      </div>
      <div className="flex items-center justify-between px-2.5 pb-2">
        {statusLabel}
        {canStart && (
          <button
            onClick={() => onStartMatch(m.id)}
            className="text-[11px] text-purple hover:underline cursor-pointer"
          >
            Start
          </button>
        )}
      </div>
    </div>
  )
}

function PlayerRow({ label, muted, winner, onPick }: {
  label: string
  muted: boolean
  winner: boolean
  onPick?: () => void
}) {
  const classes = [
    'flex items-center gap-1.5 min-w-0',
    winner ? 'text-green font-semibold' : '',
    onPick ? 'cursor-pointer hover:bg-bg-surf rounded-sm px-0.5 -mx-0.5' : '',
    onPick ? 'text-text' : muted ? 'text-muted italic' : 'text-text',
  ].filter(Boolean).join(' ')

  return (
    <div className={`text-xs truncate ${classes}`} onClick={onPick} title={onPick ? `Marcar ${label} como vencedor` : label}>
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: winner ? '#22c55e' : '#52525e' }}
      />
      <span className="truncate">{label}</span>
    </div>
  )
}