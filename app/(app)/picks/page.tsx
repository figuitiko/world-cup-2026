import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SpecialPicksForm } from '@/components/special-picks-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PicksPage() {
  const session = await auth()
  const userId = session!.user.id

  const [specialPick, firstMatch, championCandidates, scorerCandidates, specialPickLock] = await Promise.all([
    prisma.specialPick.findUnique({ where: { userId } }),
    prisma.match.findFirst({
      where: { round: 'GROUP' },
      orderBy: { kickoff: 'asc' },
    }),
    prisma.championCandidate.findMany({ orderBy: { name: 'asc' } }),
    prisma.topScorerCandidate.findMany({ orderBy: { name: 'asc' } }),
    prisma.specialPickLock.findUnique({ where: { id: 'global' } }),
  ])

  const locked = firstMatch ? firstMatch.kickoff <= new Date() : false

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-3xl">Picks Especiales</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bonus de +3 pts por campeón o goleador acertado
        </p>
      </div>

      {/* Rules cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-amber-50 border-amber-200 p-3 text-center">
          <div className="text-2xl mb-1">🏆</div>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Campeón</p>
          <p className="text-sm font-bold text-amber-700 mt-1">+3 puntos</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Si acertás el campeón</p>
        </div>
        <div className="rounded-xl border bg-primary/5 border-primary/20 p-3 text-center">
          <div className="text-2xl mb-1">⚽</div>
          <p className="text-xs font-bold text-primary uppercase tracking-wide">Goleador</p>
          <p className="text-sm font-bold text-primary mt-1">+3 puntos</p>
          <p className="text-[10px] text-primary/70 mt-0.5">Si acertás el goleador</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Tus picks</CardTitle>
        </CardHeader>
        <CardContent>
          <SpecialPicksForm
            initialChampions={specialPick?.champions ?? []}
            initialScorers={specialPick?.topScorers ?? []}
            championCandidates={championCandidates}
            scorerCandidates={scorerCandidates}
            locked={locked}
            championLocked={Boolean(specialPickLock?.championLockedAt)}
            topScorerLocked={Boolean(specialPickLock?.topScorerLockedAt)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
