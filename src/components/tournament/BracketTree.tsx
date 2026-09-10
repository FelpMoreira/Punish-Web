import { useMemo } from 'react'
import {
  SingleEliminationBracket,
  DoubleEliminationBracket,
  createTheme,
} from '@g-loot/react-tournament-brackets'
import type { MatchComponentProps, MatchType } from '@g-loot/react-tournament-brackets'
import type { Match, Player } from '../../types'
import { toBracketData } from './bracketAdapter'
import { Badge } from '../ui/Badge'

interface Props {
  matches: Match[]
  players: Player[]
  onSubmitResult: (matchId: number, winnerId: number) => void
  onStartMatch: (matchId: number) => void
}

type LibMatch = MatchType & { orig: Match }

const CARD_W = 220
const CARD_H = 92

const SECTION_COLORS: Record<string, string> = {
  WINNERS: '#22d3ee',
  LOSERS: '#f59e0b',
  GRAND_FINAL: '#8b5cf6',
}

const bracketTheme = createTheme({
  fontFamily: 'Inter, system-ui, sans-serif',
  textColor: {
    main: '#e8e8ed',
    highlighted: '#8b5cf6',
    dark: '#8a8a9a',
    disabled: '#52525e',
  },
  roundHeaders: { background: '#161618' },
  matchBackground: { wonColor: '#8b5cf6', lostColor: '#1c1c1f' },
  border: { color: '#2a2a2e', highlightedColor: '#8b5cf6' },
  score: {
    text: { highlightedWonColor: '#22c55e', highlightedLostColor: '#ef4444' },
    background: { wonColor: '#161618', lostColor: '#161618' },
  },
  canvasBackground: '#0e0e0f',
  disabledColor: '#52525e',
  transitionTimingFunction: 'cubic-bezier(0,0.92,0.77,0.99)',
})

const options = {
  style: {
    width: CARD_W,
    boxHeight: CARD_H,
    canvasPadding: 14,
    spaceBetweenColumns: 56,
    spaceBetweenRows: 36,
    connectorColor: '#37373e',
    connectorColorHighlight: '#8b5cf6',
    roundHeader: {
      isShown: true,
      height: 26,
      marginBottom: 14,
      fontSize: 11,
      fontColor: '#8a8a9a',
      backgroundColor: '#161618',
    },
    roundSeparatorWidth: 14,
    lineInfo: { separation: -10, homeVisitorSpread: 0.5 },
    horizontalOffset: 10,
    wonBywalkOverText: 'WO',
    lostByNoShowText: 'NS',
  },
}

function PlayerRow({
  party,
  won,
  fallback,
  onPick,
}: {
  party: MatchComponentProps['topParty']
  won: boolean
  fallback: string
  onPick?: () => void
}) {
  const muted = typeof party.id === 'string' && party.id.startsWith('tbd-')
  const name = party.name || fallback
  return (
    <div
      onClick={onPick}
      className={`flex min-w-0 items-center gap-1.5 text-[12.5px] ${
        won
          ? 'font-semibold text-green'
          : muted
            ? 'italic text-muted'
            : 'text-text'
      } ${onPick ? 'cursor-pointer hover:bg-bg-surf' : ''}`}
    >
      <span
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ background: won ? '#22c55e' : '#52525e' }}
      />
      <span className="truncate">{name}</span>
    </div>
  )
}

export function BracketTree({ matches, players, onSubmitResult, onStartMatch }: Props) {
  const data = useMemo(() => toBracketData(matches, players), [matches, players])

  const MatchCard = useMemo(
    () =>
      function BracketMatchCard(props: MatchComponentProps) {
        const m = (props.match as LibMatch).orig
        const ready = Boolean(m.fk_player1_id && m.fk_player2_id)
        const canStart = ready && m.status !== 'IN_PROGRESS' && !m.fk_winner_id
        const picking = m.status === 'IN_PROGRESS' && ready && !m.fk_winner_id
        const mkPick = (partyId?: PropertyKey) =>
          partyId && picking
            ? () => onSubmitResult(m.id, Number(partyId))
            : undefined

        return (
          <div className="flex h-full w-full flex-col overflow-hidden rounded-md border border-border bg-bg-el shadow-lg shadow-black/30">
            <div
              className="h-1.5 w-full flex-shrink-0"
              style={{ background: SECTION_COLORS[m.bracket_type || 'WINNERS'] }}
            />
            <div className="flex flex-1 flex-col justify-center gap-1.5 px-3">
              <PlayerRow
                party={props.topParty}
                won={props.topWon}
                fallback={props.teamNameFallback}
                onPick={mkPick(props.topParty.id)}
              />
              <div className="border-t border-border/70" />
              <PlayerRow
                party={props.bottomParty}
                won={props.bottomWon}
                fallback={props.teamNameFallback}
                onPick={mkPick(props.bottomParty.id)}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-1.5">
              {m.fk_winner_id ? (
                <Badge variant="finished">Done</Badge>
              ) : m.status === 'IN_PROGRESS' ? (
                <Badge variant="live">Live</Badge>
              ) : (
                <Badge variant={ready ? 'waiting' : 'next'}>
                  {ready ? 'Ready' : 'Waiting'}
                </Badge>
              )}
              {canStart && (
                <button
                  onClick={() => onStartMatch(m.id)}
                  className="cursor-pointer text-[11px] text-purple hover:underline"
                >
                  Start
                </button>
              )}
            </div>
          </div>
        )
      },
    [onSubmitResult, onStartMatch],
  )

  if (!matches.length) {
    return (
      <div className="py-6 text-center text-sm text-muted">No matches yet.</div>
    )
  }

  const common = { matchComponent: MatchCard, theme: bracketTheme, options }

  return (
    <div className="-mx-4 overflow-x-auto pb-2">
      <div className="min-w-max px-4">
        {data.kind === 'single' ? (
          <SingleEliminationBracket matches={data.matches} {...common} />
        ) : (
          <DoubleEliminationBracket matches={data.matches} {...common} />
        )}
      </div>
    </div>
  )
}