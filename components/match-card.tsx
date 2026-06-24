import { Badge } from '@/components/ui/badge'
import { PredictionForm } from '@/components/prediction-form'
import { UserTimezoneDateTime } from '@/components/user-timezone-date-time'
import { cn } from '@/lib/utils'
import type { Match, Prediction } from '@/generated/prisma/client'

function resultLabel(result: string, homeTeam: string, awayTeam: string): string {
  if (result === 'HOME') return `Ganó ${homeTeam}`
  if (result === 'AWAY') return `Ganó ${awayTeam}`
  return 'Empate'
}

function pickLabel(pick: string, homeTeam: string, awayTeam: string): string {
  if (pick === 'HOME') return `Gana ${homeTeam}`
  if (pick === 'AWAY') return `Gana ${awayTeam}`
  return 'Empate'
}

interface Props {
  match: Match
  prediction: Prediction | null
}

export function MatchCard({ match, prediction }: Props) {
  const isLocked = match.kickoff <= new Date()
  const isCorrect = prediction && match.result ? prediction.pick === match.result : null
  const isTBD = match.homeTeam === 'POR DEFINIR'

  return (
    <div
      className={cn(
        'rounded-xl border bg-card px-4 py-3 shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-primary/30',
        isLocked && 'opacity-90'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {match.group ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Grupo {match.group}
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {match.round}
            </span>
          )}
        </div>
        <UserTimezoneDateTime
          value={match.kickoff.toISOString()}
          className="text-xs text-muted-foreground tabular-nums"
        />
      </div>

      {/* Teams */}
      <div className="flex items-center gap-2 mb-2.5">
        <p
          className={cn(
            'flex-1 font-heading font-bold text-base leading-tight',
            isTBD && 'text-muted-foreground italic'
          )}
        >
          {match.homeTeam}
        </p>
        <span className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
          VS
        </span>
        <p
          className={cn(
            'flex-1 text-right font-heading font-bold text-base leading-tight',
            isTBD && 'text-muted-foreground italic'
          )}
        >
          {match.awayTeam}
        </p>
      </div>

      {/* Pick / Status */}
      <div className="flex justify-center">
        {!isLocked && !isTBD && (
          <PredictionForm
            matchId={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            currentPick={prediction?.pick ?? null}
            variant="compact"
          />
        )}
        {!isLocked && isTBD && (
          <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
            Equipos por confirmar
          </Badge>
        )}
        {isLocked && match.result && (
          <Badge
            variant="secondary"
            className={cn(
              'text-xs',
              isCorrect && 'bg-green-100 text-green-700 border-green-200',
              isCorrect === false && 'bg-red-100 text-red-700 border-red-200'
            )}
          >
            {isCorrect ? '✓' : '✗'} {resultLabel(match.result, match.homeTeam, match.awayTeam)}
          </Badge>
        )}
        {isLocked && !match.result && (
          <span className="space-y-1 text-center">
            {prediction && (
              <Badge variant="outline" className="text-xs">
                {pickLabel(prediction.pick, match.homeTeam, match.awayTeam)}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
              Resultado pendiente
            </Badge>
          </span>
        )}
      </div>
    </div>
  )
}
