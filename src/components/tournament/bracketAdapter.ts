import type { Match, Player } from '../../types'
import type { MatchType, ParticipantType } from '@g-loot/react-tournament-brackets'

export type BracketData =
  | { kind: 'single'; matches: MatchType[] }
  | { kind: 'double'; matches: { upper: MatchType[]; lower: MatchType[] } }

const stateFor = (m: Match): string => {
  if (m.fk_winner_id) return 'SCORE_DONE'
  if (m.status === 'IN_PROGRESS') return 'PLAYED'
  return ''
}

const toParticipant = (
  playerId: number | null,
  winnerId: number | null,
  index: number,
  matchId: number,
  players: Player[],
): ParticipantType => {
  if (!playerId) {
    return { id: `tbd-${matchId}-${index}` }
  }
  const player = players.find((p) => p.id === playerId)
  return {
    id: playerId,
    name: player?.nickname ?? `#${playerId}`,
    isWinner: winnerId === playerId,
    resultText: winnerId === playerId ? 'WON' : null,
    status: winnerId ? 'PLAYED' : null,
  }
}

const sortableName = (m: Match): string =>
  `M${String(m.match_number).padStart(2, '0')}`

const toLibMatch = (m: Match, players: Player[]): MatchType => ({
  id: m.id,
  name: sortableName(m),
  nextMatchId: m.fk_next_match_win_id,
  nextLooserMatchId: m.fk_next_match_lose_id ?? undefined,
  tournamentRoundText: String(m.round_number),
  startTime: '',
  state: stateFor(m),
  participants: [
    toParticipant(m.fk_player1_id, m.fk_winner_id, 0, m.id, players),
    toParticipant(m.fk_player2_id, m.fk_winner_id, 1, m.id, players),
  ],
  orig: m,
})

export function toBracketData(matches: Match[], players: Player[]): BracketData {
  const isDouble = matches.some(
    (m) => m.bracket_type === 'LOSERS' || m.bracket_type === 'GRAND_FINAL',
  )

  if (!isDouble) {
    return {
      kind: 'single',
      matches: matches.map((m) => toLibMatch(m, players)),
    }
  }

  const upper = matches
    .filter((m) => m.bracket_type === 'WINNERS')
    .map((m) => toLibMatch(m, players))
  const lower = matches
    .filter((m) => m.bracket_type === 'LOSERS' || m.bracket_type === 'GRAND_FINAL')
    .map((m) => toLibMatch(m, players))

  return { kind: 'double', matches: { upper, lower } }
}