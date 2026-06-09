import { prisma } from '@/lib/db'
import { deleteMatch } from '@/actions/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Match } from '@/generated/prisma/client'

export default async function AdminGamesPage() {
  const matches = await prisma.match.findMany({ orderBy: [{ kickoff: 'asc' }] })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Partidos</h1>
        <Button asChild>
          <Link href="/admin/games/new">Agregar partido</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {matches.map((match: Match) => {
          async function handleDelete() {
            'use server'
            await deleteMatch(match.id)
          }

          return (
            <div key={match.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">#{match.matchNumber}</span>
                  <span className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </span>
                  {match.result && (
                    <Badge variant="secondary">
                      {match.result === 'HOME'
                        ? match.homeTeam
                        : match.result === 'AWAY'
                          ? match.awayTeam
                          : 'Empate'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {match.round}
                  {match.group ? ` — Grupo ${match.group}` : ''} ·{' '}
                  {new Date(match.kickoff).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {match.venue}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/games/${match.id}/edit`}>Editar</Link>
                </Button>
                <form action={handleDelete}>
                  <Button type="submit" variant="destructive" size="sm">
                    Eliminar
                  </Button>
                </form>
              </div>
            </div>
          )
        })}
        {matches.length === 0 && (
          <p className="text-muted-foreground">No hay partidos cargados.</p>
        )}
      </div>
    </div>
  )
}
