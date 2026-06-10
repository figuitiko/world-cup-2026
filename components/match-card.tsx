import { Badge } from '@/components/ui/badge'
import { PredictionForm } from '@/components/prediction-form'
import { cn } from '@/lib/utils'
import type { Match, Prediction } from '@/generated/prisma/client'

const RESULT_LABEL: Record<string, string> = {
  HOME: 'Local',
  DRAW: 'Empate',
  AWAY: 'Visitante',
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

  const kickoff = new Date(match.kickoff)
  const dateStr = kickoff.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  const timeStr = kickoff.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

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
        <span className="text-xs text-muted-foreground tabular-nums">
          {dateStr} · {timeStr}
        </span>
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
            {isCorrect ? '✓' : '✗'} {RESULT_LABEL[match.result]}
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
