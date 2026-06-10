import { prisma } from '@/lib/db'
import { setPickForUser, autoAssignMissingPicks } from '@/actions/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Match, Prediction } from '@/generated/prisma/client'


export default async function AdminUserPicksPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>
}) {
  const { userId } = await searchParams

  const users = await prisma.user.findMany({
    orderBy: [{ isAdmin: 'desc' }, { name: 'asc' }],
  })

  const selectedUser = userId ? users.find(u => u.id === userId) : null

  const matches: (Match & { predictions: Prediction[] })[] = userId
    ? await prisma.match.findMany({
        where: { homeTeam: { not: 'POR DEFINIR' } },
        orderBy: { kickoff: 'asc' },
        include: { predictions: { where: { userId } } },
      })
    : []

  return (
    <div className="space-y-6">
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
            href={`/admin/user-picks?userId=${u.id}`}
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

      {/* Picks for selected user */}
      {selectedUser && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">
            Picks de {selectedUser.name}
          </p>
          {matches.map(match => {
            const current = match.predictions[0]?.pick ?? null

            return (
              <div key={match.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(match.kickoff).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {current && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {current === 'HOME'
                        ? match.homeTeam
                        : current === 'AWAY'
                          ? match.awayTeam
                          : 'Empate'}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                  {(['HOME', 'DRAW', 'AWAY'] as const).map(pick => {
                    async function setPick() {
                      'use server'
                      await setPickForUser(selectedUser!.id, match.id, pick)
                    }
                    const label =
                      pick === 'HOME' ? match.homeTeam : pick === 'AWAY' ? match.awayTeam : 'Empate'
                    return (
                      <form key={pick} action={setPick}>
                        <Button
                          type="submit"
                          size="sm"
                          variant={current === pick ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {label}
                        </Button>
                      </form>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {matches.length === 0 && (
            <p className="text-muted-foreground text-sm">No hay partidos disponibles.</p>
          )}
        </div>
      )}

      {!selectedUser && (
        <p className="text-muted-foreground text-sm">Seleccioná un usuario para ver y editar sus picks.</p>
      )}
    </div>
  )
}
