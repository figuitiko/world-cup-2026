import { prisma } from '@/lib/db'
import { enterMatchResult } from '@/actions/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserTimezoneDateTime } from '@/components/user-timezone-date-time'
import { LockMatchButton } from './lock-match-button'
import { Lock } from 'lucide-react'
import type { Match } from '@/generated/prisma/client'

function ResultForm({
  matchId,
  result,
  currentResult,
  label,
  disabled,
}: {
  matchId: string
  result: string
  currentResult: string | null
  label: string
  disabled: boolean
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
        disabled={disabled}
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
          <Card key={match.id} className={match.locked ? 'opacity-70' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {match.homeTeam} vs {match.awayTeam}
                    </p>
                    {match.locked && (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive font-semibold">
                        <Lock size={12} />
                        Bloqueado
                      </span>
                    )}
                  </div>
                  <UserTimezoneDateTime
                    value={match.kickoff.toISOString()}
                    showTime={false}
                    className="text-xs text-muted-foreground"
                  />
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
                <div className="flex gap-2 flex-wrap items-start">
                  <ResultForm
                    matchId={match.id}
                    result="HOME"
                    currentResult={match.result}
                    label={match.homeTeam}
                    disabled={match.locked}
                  />
                  <ResultForm
                    matchId={match.id}
                    result="DRAW"
                    currentResult={match.result}
                    label="Empate"
                    disabled={match.locked}
                  />
                  <ResultForm
                    matchId={match.id}
                    result="AWAY"
                    currentResult={match.result}
                    label={match.awayTeam}
                    disabled={match.locked}
                  />
                  {!match.locked && (
                    <LockMatchButton
                      matchId={match.id}
                      matchLabel={`${match.homeTeam} vs ${match.awayTeam}`}
                    />
                  )}
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
