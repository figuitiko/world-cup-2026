import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { LeaderboardTable } from '@/components/leaderboard-table'
import {
  computeMatchPoints,
  computeChampionBonus,
  computeScorerBonus,
} from '@/lib/scoring'
import type { Match, Prediction, SpecialPick, TournamentResult } from '@/generated/prisma/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface LeaderboardEntry {
  userId: string
  name: string
  matchPoints: number
  championBonus: number
  scorerBonus: number
  total: number
}

interface UserWithIncludes {
  id: string
  name: string
  predictions: (Prediction & { match: Match })[]
  specialPick: SpecialPick | null
}

export default async function LeaderboardPage() {
  const session = await auth()

  const [users, tournamentResult] = await Promise.all([
    prisma.user.findMany({
      where: { isAdmin: false },
      include: {
        predictions: { include: { match: true } },
        specialPick: true,
      },
    }),
    prisma.tournamentResult.findFirst(),
  ])

  const typedUsers = users as unknown as UserWithIncludes[]
  const typedResult = tournamentResult as unknown as TournamentResult | null

  const entries: LeaderboardEntry[] = typedUsers
    .map((user: UserWithIncludes) => {
      const matchPoints = computeMatchPoints(user.predictions)
      const championBonus = computeChampionBonus(user.specialPick, typedResult)
      const scorerBonus = computeScorerBonus(user.specialPick, typedResult)
      return {
        userId: user.id,
        name: user.name,
        matchPoints,
        championBonus,
        scorerBonus,
        total: matchPoints + championBonus + scorerBonus,
      }
    })
    .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.total - a.total)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Tabla de Posiciones</h1>
          <p className="text-sm text-muted-foreground mt-1">Clasificación general del torneo</p>
        </div>
        {!session && (
          <Button asChild size="sm" className="shrink-0 mt-1">
            <Link href="/login">Jugar</Link>
          </Button>
        )}
      </div>

      <LeaderboardTable entries={entries} currentUserId={session?.user.id} />
    </div>
  )
}
