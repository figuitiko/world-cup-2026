import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserTimezoneDateTime } from '@/components/user-timezone-date-time'
import { LockMatchButton } from './lock-match-button'
import { SetResultButton } from './set-result-button'
import { Lock } from 'lucide-react'
import type { Match } from '@/generated/prisma/client'

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
              <div className="flex flex-col gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">
                      {match.homeTeam} vs {match.awayTeam}
                    </p>
                    {match.locked && (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive font-semibold shrink-0">
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
                    <div className="mt-1">
                      <Badge>
                        {match.result === 'HOME'
                          ? `Ganó ${match.homeTeam}`
                          : match.result === 'AWAY'
                            ? `Ganó ${match.awayTeam}`
                            : 'Empate'}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <SetResultButton matchId={match.id} result="HOME" label={match.homeTeam} isSelected={match.result === 'HOME'} hasExistingResult={!!match.result} />
                  <SetResultButton matchId={match.id} result="DRAW" label="Empate" isSelected={match.result === 'DRAW'} hasExistingResult={!!match.result} />
                  <SetResultButton matchId={match.id} result="AWAY" label={match.awayTeam} isSelected={match.result === 'AWAY'} hasExistingResult={!!match.result} />
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
