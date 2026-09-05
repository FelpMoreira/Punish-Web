export interface Tournament {
  id: number
  name: string
  game: string
  fk_owner: number | null
  fk_winner_id: number | null
  status: string
  criado_em: string
}

export interface TournamentInvite {
  id: number
  fk_tournament_id: number
  codigo: string
  criado_em: string
  expira_em: string | null
  usos_max: number
  usos: number
}

export interface TournamentInviteUsage {
  playerId: number
  nickname: string
  usadoEm: string
}

export interface TournamentInviteDetail {
  id: number
  codigo: string
  criadoEm: string
  expiraEm: string | null
  usosMax: number | null
  usos: number
  usosDetalhados: TournamentInviteUsage[]
}

export interface InviteInfo {
  codigo: string
  usos_max: number | null
  usos: number
  expira_em: string | null
  tournamentId: number
  tournamentName: string
  tournamentStatus: string
}

export interface Player {
  id: number
  nickname: string
}

export interface Match {
  id: number
  fk_tournament_id: number
  fk_player1_id: number | null
  fk_player2_id: number | null
  fk_winner_id: number | null
  score_player1: number | null
  score_player2: number | null
  bracket_type: string
  round_number: number
  match_number: number
  fk_next_match_win_id: number | null
  fk_next_match_lose_id: number | null
  status: string
}

export interface ResultadoRequest {
  fk_winner_id: number
  score_player1: number
  score_player2: number
}

export interface Ranking {
  player_id: number
  nickname: string
  placement: number
}

export interface PlayerStats {
  totalTournaments: number
  totalWins: number
  totalLosses: number
  winRate: number
}

export interface AuthResponse {
  token: string
  refreshToken: string
  email: string
}

export interface User extends Player {
  email: string
  role: string
}
