import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import EditGameForm from './form'

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [match, teams] = await Promise.all([
    prisma.match.findUnique({ where: { id } }),
    prisma.team.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!match) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar partido</h1>
      <EditGameForm match={match} teams={teams} />
    </div>
  )
}
