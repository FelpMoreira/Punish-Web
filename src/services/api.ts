const API_BASE = 'http://localhost:7000'

export const storage = {
  get token() {
    return localStorage.getItem('token')
  },
  set token(v: string | null) {
    if (v) localStorage.setItem('token', v)
    else localStorage.removeItem('token')
  },
  get user(): import('../types').User | null {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  set user(v: import('../types').User | null) {
    if (v) localStorage.setItem('user', JSON.stringify(v))
    else localStorage.removeItem('user')
  },
}

function decodeToken(token: string): { sub: string; role?: string } | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(normalized)
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function loadCurrentUser(): Promise<import('../types').User> {
  const token = storage.token
  if (!token) throw new Error('Não autenticado')
  const claims = decodeToken(token)
  if (!claims?.sub) throw new Error('Token inválido')
  const user = await request<import('../types').User>(`/players/${claims.sub}`)
  storage.user = user
  return user
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = storage.token
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  auth: {
    register: (nickname: string, email: string, password: string) =>
      request<import('../types').User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nickname, email, password }),
      }),
    login: (email: string, password: string) =>
      request<import('../types').AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }).then(async (res) => {
        storage.token = res.token
        try {
          storage.user = await loadCurrentUser()
        } catch {
          // não quebra o login se o perfil falhar
        }
        return res
      }),
    me: () => loadCurrentUser(),
    logout: () => {
      storage.token = null
      storage.user = null
    },
  },
  tournaments: {
    list: (filters?: { name?: string; game?: string; status?: string }) => {
      const params = new URLSearchParams()
      if (filters?.name) params.set('name', filters.name)
      if (filters?.game) params.set('game', filters.game)
      if (filters?.status) params.set('status', filters.status)
      const qs = params.toString()
      return request<import('../types').Tournament[]>(`/tournaments${qs ? '?' + qs : ''}`)
    },
    get: (id: number) => request<import('../types').Tournament>(`/tournaments/${id}`),
    create: (name: string, game: string) =>
      request<import('../types').Tournament>('/tournaments', {
        method: 'POST',
        body: JSON.stringify({ name, game }),
      }),
    update: (id: number, name: string, game: string) =>
      request<import('../types').Tournament>(`/tournaments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, game }),
      }),
    delete: (id: number) =>
      request<void>(`/tournaments/${id}`, { method: 'DELETE' }),
    start: (id: number) =>
      request<void>(`/tournaments/${id}/start`, { method: 'POST' }),
    finish: (id: number) =>
      request<void>(`/tournaments/${id}/finish`, { method: 'POST' }),
    generate: (id: number) =>
      request<import('../types').Match[]>(`/tournaments/${id}/generate`, { method: 'POST' }),
    players: (id: number) =>
      request<import('../types').Player[]>(`/tournaments/${id}/players`),
    addPlayer: (tournamentId: number, playerId: number) =>
      request<void>(`/tournaments/${tournamentId}/players`, {
        method: 'POST',
        body: JSON.stringify({ playerId }),
      }),
    removePlayer: (tournamentId: number, playerId: number) =>
      request<void>(`/tournaments/${tournamentId}/players/${playerId}`, { method: 'DELETE' }),
    matches: (id: number) =>
      request<import('../types').Match[]>(`/tournaments/${id}/matches`),
    ranking: (id: number) =>
      request<import('../types').Ranking[]>(`/tournaments/${id}/ranking`),
    recalculate: (id: number) =>
      request<void>(`/tournaments/${id}/recalculate`, { method: 'POST' }),
    invite: (tournamentId: number, expiraEm?: string, usosMax?: number) =>
      request<import('../types').TournamentInvite>(`/tournaments/${tournamentId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ expiraEm, usosMax }),
      }),
    listInvites: (tournamentId: number) =>
      request<import('../types').TournamentInvite[]>(`/tournaments/${tournamentId}/invite`),
    joinInvite: (codigo: string) =>
      request<void>(`/invites/${codigo}/join`, { method: 'POST' }),
    getInvite: (codigo: string) =>
      request<import('../types').InviteInfo>(`/invites/${codigo}`),
  },
  players: {
    list: (nickname?: string) => {
      const qs = nickname ? `?nickname=${encodeURIComponent(nickname)}` : ''
      return request<import('../types').Player[]>(`/players${qs}`)
    },
    get: (id: number) => request<import('../types').Player>(`/players/${id}`),
    stats: (id: number) => request<import('../types').PlayerStats>(`/players/${id}/stats`),
    create: (nickname: string) =>
      request<import('../types').Player>('/players', {
        method: 'POST',
        body: JSON.stringify({ nickname }),
      }),
    delete: (id: number) =>
      request<void>(`/players/${id}`, { method: 'DELETE' }),
  },
  dashboard: () => request<{ totalPlayers: number; matchesPlayed: number; upcomingMatches: number }>('/dashboard'),

  matches: {
    get: (id: number) => request<import('../types').Match>(`/matches/${id}`),
    start: (id: number) =>
      request<import('../types').Match>(`/matches/${id}/start`, {
        method: 'PATCH',
      }),
    startRound: (tournamentId: number, round: number) =>
      request<import('../types').Match[]>(`/tournaments/${tournamentId}/matches/start-round`, {
        method: 'PATCH',
        body: JSON.stringify({ round }),
      }),
    result: (id: number, data: import('../types').ResultadoRequest) =>
      request<import('../types').Match>(`/matches/${id}/result`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
}
