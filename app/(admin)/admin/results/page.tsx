import { prisma } from '@/lib/db'
import { enterMatchResult } from '@/actions/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Match } from '@/generated/prisma/client'

function ResultForm({
  matchId,
  result,
  currentResult,
  label,
}: {
  matchId: string
  result: string
  currentResult: string | null
  label: string
}) {
  async function submit() {
    'use server'
    await enterMatchResult(matchId, result)
  }

  return (
    <form action={submit}>
      <Button
        type="submit"
        variant={currentResult === result ? 'default' : 'outline'}
        size="sm"
      >
        {label}
      </Button>
    </form>
  )
}

export default async function AdminResultsPage() {
  const matches = await prisma.match.findMany({
    where: {
      kickoff: { lte: new Date() },
      homeTeam: { not: 'POR DEFINIR' },
    },
    orderBy: { kickoff: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cargar Resultados</h1>
      <div className="space-y-3">
        {matches.map((match: Match) => (
          <Card key={match.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(match.kickoff).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  {match.result && (
                    <Badge className="mt-1">
                      {match.result === 'HOME'
                        ? `Ganó ${match.homeTeam}`
                        : match.result === 'AWAY'
                          ? `Ganó ${match.awayTeam}`
                          : 'Empate'}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <ResultForm
                    matchId={match.id}
                    result="HOME"
                    currentResult={match.result}
                    label={match.homeTeam}
                  />
                  <ResultForm
                    matchId={match.id}
                    result="DRAW"
                    currentResult={match.result}
                    label="Empate"
                  />
                  <ResultForm
                    matchId={match.id}
                    result="AWAY"
                    currentResult={match.result}
                    label={match.awayTeam}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {matches.length === 0 && (
          <p className="text-muted-foreground">No hay partidos jugados aún.</p>
        )}
      </div>
    </div>
  )
}
