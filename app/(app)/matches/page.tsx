import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { MatchCard } from '@/components/match-card'
import type { Match, Prediction } from '@/generated/prisma/client'

const ROUND_LABELS: Record<string, string> = {
  GROUP: 'Fase de Grupos',
  R32: 'Ronda de 32',
  R16: 'Octavos de Final',
  QF: 'Cuartos de Final',
  SF: 'Semifinales',
  '3RD': 'Tercer Puesto',
  FINAL: 'Final',
}

const ROUND_ORDER = ['GROUP', 'R32', 'R16', 'QF', 'SF', '3RD', 'FINAL']

export default async function MatchesPage() {
  const session = await auth()
  const userId = session!.user.id

  const [matches, predictions] = await Promise.all([
    prisma.match.findMany({ orderBy: [{ kickoff: 'asc' }, { matchNumber: 'asc' }] }),
    prisma.prediction.findMany({ where: { userId } }),
  ])

  const predictionMap = new Map(predictions.map((p: Prediction) => [p.matchId, p]))

  const byRound = new Map<string, typeof matches>()
  for (const match of matches) {
    if (!byRound.has(match.round)) byRound.set(match.round, [])
    byRound.get(match.round)!.push(match)
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="text-5xl">📅</div>
        <h1 className="font-heading font-bold text-2xl">Sin partidos todavía</h1>
        <p className="text-sm text-muted-foreground">Volvé pronto, los fixtures se cargan antes del torneo.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <h1 className="font-heading font-bold text-3xl">Partidos</h1>

      {ROUND_ORDER.filter((r) => byRound.has(r)).map((round) => {
        const roundMatches = byRound.get(round)!

        if (round === 'GROUP') {
          const byGroup = new Map<string, typeof matches>()
          for (const m of roundMatches) {
            const g = m.group ?? '?'
            if (!byGroup.has(g)) byGroup.set(g, [])
            byGroup.get(g)!.push(m)
          }
          return (
            <section key={round}>
              <h2 className="font-heading font-bold text-xl uppercase tracking-wide mb-4 flex items-center gap-2.5">
                <span className="w-1 h-6 bg-primary rounded-full" />
                {ROUND_LABELS[round]}
              </h2>
              <div className="space-y-6">
                {Array.from(byGroup.entries())
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([group, gMatches]) => (
                    <div key={group}>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 pl-1">
                        Grupo {group}
                      </h3>
                      <div className="space-y-2">
                        {gMatches.map((m: Match) => (
                          <MatchCard
                            key={m.id}
                            match={m}
                            prediction={predictionMap.get(m.id) ?? null}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )
        }

        return (
          <section key={round}>
            <h2 className="font-heading font-bold text-xl uppercase tracking-wide mb-4 flex items-center gap-2.5">
              <span className="w-1 h-6 bg-primary rounded-full" />
              {ROUND_LABELS[round]}
            </h2>
            <div className="space-y-2">
              {roundMatches.map((m: Match) => (
                <MatchCard key={m.id} match={m} prediction={predictionMap.get(m.id) ?? null} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
