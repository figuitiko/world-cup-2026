import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import EditTeamForm from './form'

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const team = await prisma.team.findUnique({ where: { id } })
  if (!team) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar equipo</h1>
      <EditTeamForm team={team} />
    </div>
  )
}
