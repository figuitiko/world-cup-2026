import { prisma } from '@/lib/db'
import {
  addChampionCandidate,
  deleteChampionCandidate,
  addTopScorerCandidate,
  deleteTopScorerCandidate,
} from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeleteButton } from '@/components/delete-button'
import { Trophy, UserRound } from 'lucide-react'

export default async function AdminCandidatesPage() {
  const [champions, scorers] = await Promise.all([
    prisma.championCandidate.findMany({ orderBy: { name: 'asc' } }),
    prisma.topScorerCandidate.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Candidatos</h1>

      {/* Champion teams */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Selecciones campeonas ({champions.length})</h2>
        <div className="flex flex-wrap gap-2">
          {champions.map(c => {
            async function remove() {
              'use server'
              await deleteChampionCandidate(c.id)
            }
            return (
              <DeleteButton key={c.id} action={remove} title="¿Eliminar candidato?" description={c.name}>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                >
                  {c.name}
                  <span className="text-xs opacity-50">✕</span>
                </button>
              </DeleteButton>
            )
          })}
          {champions.length === 0 && (
            <div className="flex w-full items-start gap-3 rounded-2xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
              <Trophy className="mt-0.5 size-5 text-primary" strokeWidth={1.8} />
              <p>
                Agregá candidatos a campeón para que los jugadores elijan con menos errores de
                tipeo.
              </p>
            </div>
          )}
        </div>
        <form
          action={async (fd: FormData) => {
            'use server'
            await addChampionCandidate(fd.get('name') as string)
          }}
          className="flex gap-2 max-w-sm"
        >
          <Input name="name" placeholder="Ej: Colombia" required />
          <Button type="submit" variant="outline">Agregar</Button>
        </form>
      </section>

      {/* Top scorer players */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Goleadores candidatos ({scorers.length})</h2>
        <div className="flex flex-wrap gap-2">
          {scorers.map(s => {
            async function remove() {
              'use server'
              await deleteTopScorerCandidate(s.id)
            }
            return (
              <DeleteButton key={s.id} action={remove} title="¿Eliminar candidato?" description={`${s.name} · ${s.country}`}>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                >
                  {s.name}
                  <span className="text-xs text-muted-foreground">{s.country}</span>
                  <span className="text-xs opacity-50">✕</span>
                </button>
              </DeleteButton>
            )
          })}
          {scorers.length === 0 && (
            <div className="flex w-full items-start gap-3 rounded-2xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
              <UserRound className="mt-0.5 size-5 text-secondary" strokeWidth={1.8} />
              <p>
                Agregá candidatos a goleador para que el bonus se calcule contra opciones
                consistentes.
              </p>
            </div>
          )}
        </div>
        <form
          action={async (fd: FormData) => {
            'use server'
            await addTopScorerCandidate(fd.get('name') as string, fd.get('country') as string)
          }}
          className="flex gap-2 max-w-sm"
        >
          <Input name="name" placeholder="Nombre" required className="flex-1" />
          <Input name="country" placeholder="País" required className="w-32" />
          <Button type="submit" variant="outline">Agregar</Button>
        </form>
      </section>
    </div>
  )
}
