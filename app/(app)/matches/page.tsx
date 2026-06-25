import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { MatchCard } from '@/components/match-card'
import { TodaySync } from '@/components/today-sync'
import Link from 'next/link'
import type { Match, Prediction } from '@/generated/prisma/client'

const ROUNDS = [
  { key: 'GROUP', label: 'Grupos' },
  { key: 'R32', label: '16vos' },
  { key: 'R16', label: 'Octavos' },
  { key: 'QF', label: 'Cuartos' },
  { key: 'SF', label: 'Semis' },
  { key: '3RD', label: '3er puesto' },
  { key: 'FINAL', label: 'Final' },
]

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string; group?: string; todayStart?: string; todayEnd?: string }>
}) {
  const session = await auth()
  const userId = session!.user.id
  const { round: rawRound, group: rawGroup, todayStart, todayEnd } = await searchParams

  const totalMatches = await prisma.match.count()

  if (totalMatches === 0) {
    return (
      <div className="rounded-3xl border bg-card px-6 py-14 text-center shadow-sm">
        <p className="font-heading text-2xl font-bold">Fixture en preparación</p>
        <p className="text-sm text-muted-foreground mt-2">
          Cuando carguemos los partidos vas a poder pronosticar desde acá. Volvé pronto, hermano.
        </p>
      </div>
    )
  }

  // Detect which rounds actually have matches
  const existingRounds = await prisma.match.findMany({
    select: { round: true },
    distinct: ['round'],
  })
  const existingRoundKeys = new Set(existingRounds.map((r: { round: string }) => r.round))

  const activeRound = rawRound && existingRoundKeys.has(rawRound) ? rawRound : 'GROUP'
  const activeGroup = activeRound === 'GROUP' ? (rawGroup ?? null) : null

  let startOfToday: Date
  let startOfTomorrow: Date
  if (todayStart && todayEnd) {
    startOfToday = new Date(todayStart)
    startOfTomorrow = new Date(todayEnd)
  } else {
    const now = new Date()
    startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  }

  const [matches, predictions, todayMatches] = await Promise.all([
    prisma.match.findMany({
      where: {
        round: activeRound,
        ...(activeRound === 'GROUP' && activeGroup ? { group: activeGroup } : {}),
      },
      orderBy: [{ kickoff: 'asc' }, { matchNumber: 'asc' }],
    }),
    prisma.prediction.findMany({ where: { userId } }),
    prisma.match.findMany({
      where: { kickoff: { gte: startOfToday, lt: startOfTomorrow } },
      orderBy: [{ kickoff: 'asc' }, { matchNumber: 'asc' }],
    }),
  ])

  const predictionMap = new Map(predictions.map((p: Prediction) => [p.matchId, p]))

  return (
    <div className="space-y-6">
      <TodaySync />
      <h1 className="font-heading font-bold text-3xl">Partidos</h1>

      {/* Round tabs */}
      <div className="flex flex-wrap gap-1.5">
        {ROUNDS.filter(r => existingRoundKeys.has(r.key)).map(r => (
          <Link
            key={r.key}
            href={`/matches?round=${r.key}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeRound === r.key
                ? 'bg-foreground text-background'
                : 'border hover:border-muted-foreground'
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Group sub-tabs */}
      {activeRound === 'GROUP' && (
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/matches?round=GROUP"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !activeGroup ? 'bg-primary text-primary-foreground' : 'border hover:border-muted-foreground'
            }`}
          >
            Todos
          </Link>
          {GROUPS.map(g => (
            <Link
              key={g}
              href={`/matches?round=GROUP&group=${g}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                activeGroup === g
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:border-muted-foreground'
              }`}
            >
              {g}
            </Link>
          ))}
        </div>
      )}

      {/* Today's matches */}
      {todayMatches.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-heading font-bold text-lg">Hoy</h2>
          {todayMatches.map((m: Match) => (
            <MatchCard key={m.id} match={m} prediction={predictionMap.get(m.id) ?? null} />
          ))}
        </div>
      )}

      {/* Separator */}
      {todayMatches.length > 0 && matches.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Todos los partidos</span>
          <div className="flex-1 border-t" />
        </div>
      )}

      {/* Match list */}
      <div className="space-y-2">
        {matches.map((m: Match) => (
          <MatchCard key={m.id} match={m} prediction={predictionMap.get(m.id) ?? null} />
        ))}
        {matches.length === 0 && (
          <p className="text-muted-foreground text-sm py-4">
            No hay partidos disponibles para esta fase.
          </p>
        )}
      </div>
    </div>
  )
}
