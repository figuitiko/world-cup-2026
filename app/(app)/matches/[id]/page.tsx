import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { PredictionForm } from '@/components/prediction-form'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { BackButton } from '@/components/back-button'

const ROUND_LABELS: Record<string, string> = {
  GROUP: 'Fase de Grupos',
  R32: 'Ronda de 32',
  R16: 'Octavos de Final',
  QF: 'Cuartos de Final',
  SF: 'Semifinales',
  '3RD': 'Tercer Puesto',
  FINAL: 'Final',
}

function resultLabel(result: string, home: string, away: string): string {
  if (result === 'HOME') return `Ganó ${home}`
  if (result === 'AWAY') return `Ganó ${away}`
  return 'Empate'
}

function pickLabel(pick: string, home: string, away: string): string {
  if (pick === 'HOME') return `Gana ${home}`
  if (pick === 'AWAY') return `Gana ${away}`
  return 'Empate'
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user.id

  const [match, prediction] = await Promise.all([
    prisma.match.findUnique({ where: { id } }),
    prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId: id } },
    }),
  ])

  if (!match) notFound()

  const isLocked = match.kickoff <= new Date()
  const isTBD = match.homeTeam === 'POR DEFINIR'
  const isCorrect = prediction && match.result ? prediction.pick === match.result : null

  const kickoff = new Date(match.kickoff)

  return (
    <div className="space-y-4">
      <BackButton label="Partidos" />
      <Card className="overflow-hidden">
        {/* Stage badge */}
        <div className="bg-primary/5 border-b px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {match.group ? `Grupo ${match.group}` : ROUND_LABELS[match.round] ?? match.round}
          </span>
          {isLocked && !match.result && (
            <Badge variant="outline" className="text-[10px] border-dashed text-muted-foreground">
              Resultado pendiente
            </Badge>
          )}
          {isLocked && match.result && (
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px]',
                isCorrect && 'bg-green-100 text-green-700',
                isCorrect === false && 'bg-red-100 text-red-700'
              )}
            >
              {isCorrect ? '✓ Acertaste' : '✗ Fallaste'}
            </Badge>
          )}
        </div>

        <CardHeader className="pb-4 pt-5">
          {/* Teams */}
          <div className="flex items-center gap-4 justify-center">
            <p
              className={cn(
                'flex-1 text-right font-heading font-bold text-xl leading-tight',
                isTBD && 'text-muted-foreground italic'
              )}
            >
              {match.homeTeam}
            </p>
            <div className="shrink-0 text-center">
              <div className="bg-muted rounded-lg px-3 py-1.5 font-bold text-sm text-muted-foreground">
                VS
              </div>
              <div className="text-xs text-muted-foreground mt-1 tabular-nums">
                {kickoff.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <p
              className={cn(
                'flex-1 font-heading font-bold text-xl leading-tight',
                isTBD && 'text-muted-foreground italic'
              )}
            >
              {match.awayTeam}
            </p>
          </div>

          {/* Meta */}
          <div className="text-center space-y-0.5 mt-3">
            <p className="text-xs text-muted-foreground">
              {kickoff.toLocaleDateString('es-AR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <p className="text-xs text-muted-foreground">{match.venue}</p>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Result */}
          {isLocked && match.result && (
            <div
              className={cn(
                'rounded-xl p-4 mb-4 text-center',
                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              )}
            >
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">
                Resultado
              </p>
              <p className="font-heading font-bold text-lg">
                {resultLabel(match.result, match.homeTeam, match.awayTeam)}
              </p>
              {prediction && (
                <p
                  className={cn(
                    'text-sm mt-2 font-medium',
                    isCorrect ? 'text-green-700' : 'text-red-600'
                  )}
                >
                  Tu pronóstico: {pickLabel(prediction.pick, match.homeTeam, match.awayTeam)}
                  {isCorrect ? ' — ¡Acertaste! (+1 punto)' : ' — No acertaste'}
                </p>
              )}
              {!prediction && (
                <p className="text-sm text-muted-foreground mt-2">No pronosticaste este partido.</p>
              )}
            </div>
          )}

          {/* Locked no result */}
          {isLocked && !match.result && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Esperando resultado oficial...
            </p>
          )}

          {/* TBD */}
          {isTBD && !isLocked && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Equipos por confirmar. Disponible cuando avance el torneo.
            </p>
          )}

          {/* Prediction form */}
          {!isTBD && !isLocked && (
            <PredictionForm
              matchId={match.id}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              currentPick={prediction?.pick ?? null}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
