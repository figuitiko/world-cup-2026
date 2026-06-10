import { prisma } from '@/lib/db'
import { autoAssignMissingPicks } from '@/actions/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MatchPickList } from './pick-list'
import type { Match, Prediction } from '@/generated/prisma/client'

const ROUNDS = [
  { key: 'GROUP', label: 'Grupos' },
  { key: 'R32', label: '32avos' },
  { key: 'R16', label: 'Octavos' },
  { key: 'QF', label: 'Cuartos' },
  { key: 'SF', label: 'Semis' },
  { key: '3RD', label: '3er puesto' },
  { key: 'FINAL', label: 'Final' },
]

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function buildUrl(params: Record<string, string | undefined>) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) p.set(k, v)
  }
  return `/admin/user-picks?${p.toString()}`
}

export default async function AdminUserPicksPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; round?: string; group?: string }>
}) {
  const { userId, round: rawRound, group: rawGroup } = await searchParams
  const activeRound = rawRound ?? 'GROUP'
  const activeGroup = activeRound === 'GROUP' ? (rawGroup ?? null) : null

  const users = await prisma.user.findMany({
    orderBy: [{ isAdmin: 'desc' }, { name: 'asc' }],
  })
  const selectedUser = userId ? users.find(u => u.id === userId) : null

  const shouldFetchMatches =
    userId && (activeRound !== 'GROUP' || activeGroup !== null)

  const matches: (Match & { predictions: Prediction[] })[] = shouldFetchMatches
    ? await prisma.match.findMany({
        where: {
          homeTeam: { not: 'POR DEFINIR' },
          round: activeRound,
          ...(activeRound === 'GROUP' && activeGroup ? { group: activeGroup } : {}),
        },
        orderBy: { kickoff: 'asc' },
        include: { predictions: { where: { userId } } },
      })
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Picks de usuarios</h1>
        <form
          action={async () => {
            'use server'
            await autoAssignMissingPicks()
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            Asignar picks faltantes (−5 min)
          </Button>
        </form>
      </div>

      {/* User selector */}
      <div className="flex flex-wrap gap-2">
        {users.map(u => (
          <Link
            key={u.id}
            href={buildUrl({ userId: u.id, round: activeRound, group: activeGroup ?? undefined })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              u.id === userId
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:border-muted-foreground'
            }`}
          >
            <span>{u.name}</span>
            {u.isAdmin && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  u.id === userId
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-secondary/10 text-secondary'
                }`}
              >
                Admin
              </span>
            )}
          </Link>
        ))}
      </div>

      {selectedUser && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            Picks de <span className="text-foreground">{selectedUser.name}</span>
          </p>

          {/* Round tabs */}
          <div className="flex flex-wrap gap-1.5">
            {ROUNDS.map(r => (
              <Link
                key={r.key}
                href={buildUrl({ userId, round: r.key })}
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

          {/* Group sub-tabs (only for GROUP round) */}
          {activeRound === 'GROUP' && (
            <div className="flex flex-wrap gap-1.5">
              {GROUPS.map(g => (
                <Link
                  key={g}
                  href={buildUrl({ userId, round: 'GROUP', group: g })}
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

          {/* Prompt to pick a group */}
          {activeRound === 'GROUP' && !activeGroup && (
            <p className="text-sm text-muted-foreground py-4">
              Seleccioná un grupo para ver los partidos.
            </p>
          )}

          {/* Match list */}
          {shouldFetchMatches && (
            <MatchPickList
              userId={userId!}
              matches={matches.map((m: Match & { predictions: Prediction[] }) => ({
                id: m.id,
                homeTeam: m.homeTeam,
                awayTeam: m.awayTeam,
                kickoff: m.kickoff,
                currentPick: (m.predictions[0]?.pick ?? null) as 'HOME' | 'DRAW' | 'AWAY' | null,
              }))}
            />
          )}
        </div>
      )}

      {!selectedUser && (
        <p className="text-muted-foreground text-sm">
          Seleccioná un usuario para ver y editar sus picks.
        </p>
      )}
    </div>
  )
}
