import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {match.homeTeam} vs {match.awayTeam}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(match.kickoff).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                · {match.venue.split(',')[0]}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {!isLocked && (
                <Badge variant={prediction ? 'default' : 'outline'}>
                  {prediction
                    ? pickLabel(prediction.pick, match.homeTeam, match.awayTeam)
                    : 'Sin pronóstico'}
                </Badge>
              )}
              {isLocked && match.result && (
                <Badge variant={isCorrect ? 'default' : 'secondary'}>
                  {isCorrect ? '✓ ' : '✗ '}
                  {RESULT_LABEL[match.result]}
                </Badge>
              )}
              {isLocked && !match.result && (
                <Badge variant="outline">Resultado pendiente</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
