import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { PredictionForm } from '@/components/prediction-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {match.homeTeam} vs {match.awayTeam}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(match.kickoff).toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-sm text-muted-foreground">{match.venue}</p>
          {match.group && <Badge variant="outline">Grupo {match.group}</Badge>}
        </CardHeader>
        <CardContent>
          {isTBD && (
            <p className="text-muted-foreground">
              Equipos por confirmar. Disponible cuando avance el torneo.
            </p>
          )}
          {!isTBD && isLocked && match.result && (
            <div className="space-y-2">
              <p className="font-medium">
                Resultado: {resultLabel(match.result, match.homeTeam, match.awayTeam)}
              </p>
              {prediction ? (
                <p className={prediction.pick === match.result ? 'text-green-600' : 'text-red-500'}>
                  Tu pronóstico: {pickLabel(prediction.pick, match.homeTeam, match.awayTeam)}{' '}
                  {prediction.pick === match.result ? '✓ (+1 punto)' : '✗'}
                </p>
              ) : (
                <p className="text-muted-foreground">No pronosticaste este partido.</p>
              )}
            </div>
          )}
          {!isTBD && isLocked && !match.result && (
            <p className="text-muted-foreground">Resultado pendiente.</p>
          )}
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
