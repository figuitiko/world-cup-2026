import { prisma } from '@/lib/db'
import TournamentForm from './form'

export default async function AdminTournamentPage() {
  const [champions, topScorers, current] = await Promise.all([
    prisma.championCandidate.findMany({ orderBy: { name: 'asc' } }),
    prisma.topScorerCandidate.findMany({ orderBy: { name: 'asc' } }),
    prisma.tournamentResult.findFirst(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Resultado Final del Torneo</h1>
      <TournamentForm
        champions={champions}
        topScorers={topScorers}
        current={current}
      />
    </div>
  )
}
