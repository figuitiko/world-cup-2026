import { prisma } from '@/lib/db'
import { deleteTeam } from '@/actions/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/delete-button'
import { Shield } from 'lucide-react'
import type { Team } from '@/generated/prisma/client'

export default async function AdminTeamsPage() {
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipos</h1>
        <Button asChild>
          <Link href="/admin/teams/new">Agregar equipo</Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card px-6 py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield size={24} strokeWidth={1.8} />
          </div>
          <div className="mx-auto mt-4 max-w-sm space-y-2">
            <h2 className="font-heading text-xl font-bold">Todavía no hay equipos</h2>
            <p className="text-sm text-muted-foreground">
              Cargá los equipos del torneo para usarlos en los partidos.
            </p>
          </div>
          <Button asChild className="mt-5">
            <Link href="/admin/teams/new">Agregar primer equipo</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {teams.map((team: Team) => {
            async function handleDelete() {
              'use server'
              await deleteTeam(team.id)
            }
            return (
              <div
                key={team.id}
                className="flex items-center justify-between gap-4 p-4 border rounded-lg"
              >
                <span className="font-medium">{team.name}</span>
                <div className="flex gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/teams/${team.id}/edit`}>Editar</Link>
                  </Button>
                  <DeleteButton
                    action={handleDelete}
                    title="¿Eliminar equipo?"
                    description={team.name}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
