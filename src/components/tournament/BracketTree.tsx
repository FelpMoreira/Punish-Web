import { useMemo } from 'react'
import type { Match, Player } from '../../types'
import { Badge } from '../ui/Badge'

interface Props {
  matches: Match[]
  players: Player[]
  onSubmitResult: (matchId: number, winnerId: number) => void
  onStartMatch: (matchId: number) => void
}

const CARD_W = 200
const CARD_H = 66
const V_GAP = 44
const H_GAP = 60
const HEADER_H = 56
const PAD = 12

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

const slotH = CARD_H + V_GAP

// match na coluna `colIdx` index `index` cobre 2^colIdx slots de folha,
// centralizado entre seus dois filhos da coluna anterior
const posY = (colIdx: number, index: number): number => {
  const span = 2 ** colIdx
  return HEADER_H + PAD + (index * span + (span - 1) / 2) * slotH
}

const sectionHeight = (leafCount: number): number =>
  HEADER_H + PAD * 2 + leafCount * slotH

const columnLeft = (colIdx: number): number => colIdx * (CARD_W + H_GAP)

const columnRight = (colIdx: number): number =>
  (colIdx + 1) * CARD_W + colIdx * H_GAP

const totalWidth = (nCols: number): number => nCols * CARD_W + (nCols - 1) * H_GAP

export function BracketTree({ matches, players, onSubmitResult, onStartMatch }: Props) {
  const sections = useMemo(() => {
    const keys = ['WINNERS', 'LOSERS', 'GRAND_FINAL']
    const out: Record<string, Match[]> = { WINNERS: [], LOSERS: [], GRAND_FINAL: [] }
    for (const k of keys) out[k] = matches.filter((m) => (m.bracket_type || 'WINNERS') === k)
    return out
  }, [matches])

  if (!matches.length) {
    return (
      <div className="text-sm text-muted text-center py-6">No matches yet.</div>
    )
  }

  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex gap-14 min-w-max">
        {(['WINNERS', 'LOSERS', 'GRAND_FINAL'] as const).map((sectionKey) => {
          const sectionMatches = sections[sectionKey]
          if (!sectionMatches.length) return null

          const cols = buildColumns(sectionMatches)
          const color = SECTION_COLORS[sectionKey]
          const label = SECTION_LABELS[sectionKey]
          const leafCount = cols[0].matches.length
          const height = sectionHeight(leafCount)
          const width = totalWidth(cols.length)

          const pos = (vm: ViewMatch, colIdx: number): number =>
            posY(colIdx, vm.index)

          return (
            <div key={sectionKey} className="flex flex-col flex-shrink-0 gap-3">
              <div
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md border w-fit"
                style={{ color, borderColor: `${color}40`, background: `${color}14` }}
              >
                {label}
              </div>

              <div className="relative" style={{ width, height }}>
                {/* conectores: do match pro próximo (win/lose path) */}
                {cols.slice(0, -1).flatMap((col, colIdx) =>
                  col.matches.flatMap((vm) => {
                    const parentCol = colIdx + 1
                    const flows: { next: number | null; keySuffix: string }[] = [
                      { next: vm.m.fk_next_match_win_id, keySuffix: 'w' },
                      { next: vm.m.fk_next_match_lose_id, keySuffix: 'l' },
                    ]
                    return flows.flatMap(({ next, keySuffix }) => {
                      if (!next) return []
                      const parentVm = cols[parentCol]?.matches.find((p) => p.m.id === next)
                      if (!parentVm) return []

                      const fromX = columnRight(colIdx)
                      const fromY = pos(vm, colIdx) + CARD_H / 2
                      const toX = columnLeft(parentCol)
                      const toY = pos(parentVm, parentCol) + CARD_H / 2

                      const lineColor = keySuffix === 'l' ? '#f59e0b' : color
                      const dash = keySuffix === 'l' ? '5 4' : undefined

                      return [
                        <line key={`h-${colIdx}-${vm.index}-${keySuffix}`} x1={fromX} y1={fromY} x2={toX} y2={fromY} stroke={lineColor} strokeOpacity="0.55" strokeWidth={1.5} strokeDasharray={dash} />,
                        <line key={`v-${colIdx}-${vm.index}-${keySuffix}`} x1={toX} y1={fromY} x2={toX} y2={toY} stroke={lineColor} strokeOpacity="0.55" strokeWidth={1.5} strokeDasharray={dash} />,
                      ]
                    })
                  })
                )}

                {/* cabeçalhos das colunas */}
                {cols.map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="absolute text-[10px] uppercase tracking-wider text-soft font-semibold text-center"
                    style={{ left: columnLeft(colIdx), width: CARD_W, top: PAD }}
                  >
                    {sectionKey === 'GRAND_FINAL' && cols.length === 1
                      ? 'Final'
                      : colIdx === cols.length - 1
                        ? 'Final'
                        : `Round ${colIdx + 1}`}
                  </div>
                ))}

                {/* cards */}
                {cols.flatMap((col, colIdx) =>
                  col.matches.map((vm) => (
                    <div
                      key={vm.m.id}
                      className="absolute"
                      style={{ left: columnLeft(colIdx), top: pos(vm, colIdx), width: CARD_W }}
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
    <div className={`border border-border rounded-md bg-bg-el shadow-lg shadow-black/30 overflow-hidden ${picking ? 'ring-1 ring-purple/40' : ''}`}>
      <div className="h-1.5 w-full" style={{ background: topColor }} />
      <div className="px-3 py-2.5 flex flex-col gap-2">
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
      <div className="flex items-center justify-between px-3 pb-2">
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
    onPick ? 'cursor-pointer hover:bg-bg-surf rounded-sm px-1 -mx-1' : '',
    onPick ? 'text-text' : muted ? 'text-muted italic' : 'text-text',
  ].filter(Boolean).join(' ')

  return (
    <div className={`text-[13px] truncate ${classes}`} onClick={onPick} title={onPick ? `Marcar ${label} como vencedor` : label}>
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: winner ? '#22c55e' : '#52525e' }}
      />
      <span className="truncate">{label}</span>
    </div>
  )
}