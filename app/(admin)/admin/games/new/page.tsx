import { prisma } from '@/lib/db'
import NewGameForm from './form'

export default async function NewGamePage() {
  const [teams, rounds] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
    prisma.round.findMany({ orderBy: { order: 'asc' } }).catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agregar partido</h1>
      <NewGameForm teams={teams} rounds={rounds} />
    </div>
  )
}
