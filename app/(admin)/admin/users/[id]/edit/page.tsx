import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import UserForm from '../../user-form'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, isAdmin: true },
  })

  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar usuario</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cambiá datos básicos, rol admin o reseteá la contraseña.
        </p>
      </div>
      <UserForm mode="edit" user={user} />
    </div>
  )
}
