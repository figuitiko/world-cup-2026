import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import EditRoundForm from './form'

export default async function EditRoundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const round = await prisma.round.findUnique({ where: { id } })
  if (!round) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar fase</h1>
      <EditRoundForm round={round} />
    </div>
  )
}
