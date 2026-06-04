import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SpecialPicksForm } from '@/components/special-picks-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PicksPage() {
  const session = await auth()
  const userId = session!.user.id

  const [specialPick, firstMatch] = await Promise.all([
    prisma.specialPick.findUnique({ where: { userId } }),
    prisma.match.findFirst({
      where: { round: 'GROUP' },
      orderBy: { kickoff: 'asc' },
    }),
  ])

  const locked = firstMatch ? firstMatch.kickoff <= new Date() : false

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Picks Especiales</h1>
      <p className="text-muted-foreground text-sm">
        Elegí 3 posibles campeones y 3 posibles goleadores. Si acertás alguno, sumás 3 puntos bonus.
        Podés cambiarlos hasta el inicio del torneo.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Tus picks</CardTitle>
        </CardHeader>
        <CardContent>
          <SpecialPicksForm
            initialChampions={specialPick?.champions ?? []}
            initialScorers={specialPick?.topScorers ?? []}
            locked={locked}
          />
        </CardContent>
      </Card>
    </div>
  )
}
