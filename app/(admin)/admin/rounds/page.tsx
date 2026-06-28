import { prisma } from '@/lib/db'
import { deleteRound } from '@/actions/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Round } from '@/generated/prisma/client'

export default async function AdminRoundsPage() {
  const rounds = await prisma.round.findMany({ orderBy: { order: 'asc' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fases</h1>
        <Button asChild>
          <Link href="/admin/rounds/new">Agregar fase</Link>
        </Button>
      </div>

      {rounds.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No hay fases cargadas.</p>
      ) : (
        <div className="space-y-2">
          {rounds.map((round: Round) => {
            async function handleDelete() {
              'use server'
              await deleteRound(round.id)
            }
            return (
              <div key={round.id} className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                <div>
                  <span className="font-medium">{round.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground font-mono">{round.key}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/rounds/${round.id}/edit`}>Editar</Link>
                  </Button>
                  <form action={handleDelete}>
                    <Button type="submit" variant="destructive" size="sm">Eliminar</Button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
