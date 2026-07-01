import Link from 'next/link'
import { auth } from '@/auth'
import { deleteUser } from '@/actions/admin'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DeleteButton } from '@/components/delete-button'
import { UsersRound } from 'lucide-react'

export default async function AdminUsersPage() {
  const session = await auth()
  const currentUserId = session?.user.id
  const users = await prisma.user.findMany({
    orderBy: [{ isAdmin: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { predictions: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Administrar usuarios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Creá cuentas, cambiá roles y sacá usuarios que ya no participan.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">Nuevo usuario</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId

          async function handleDelete() {
            'use server'
            await deleteUser(user.id)
          }

          return (
            <Card key={user.id} className={isCurrentUser ? 'border-primary/50' : undefined}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
                    {isCurrentUser && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Tu usuario
                      </Badge>
                    )}
                  </div>
                  <p className="break-all text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {user._count.predictions} pronósticos · creado el{' '}
                    {new Date(user.createdAt).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/users/${user.id}/edit`}>Editar</Link>
                  </Button>
                  <DeleteButton
                    action={handleDelete}
                    title="¿Eliminar usuario?"
                    description={`${user.name} · ${user.email}`}
                    disabled={isCurrentUser}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}

        {users.length === 0 && (
          <div className="rounded-3xl border border-dashed bg-card px-6 py-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UsersRound size={24} strokeWidth={1.8} />
            </div>
            <div className="mx-auto mt-4 max-w-sm space-y-2">
              <h2 className="font-heading text-xl font-bold">Todavía no hay usuarios</h2>
              <p className="text-sm text-muted-foreground">
                Creá la primera cuenta manual para empezar a administrar el torneo.
              </p>
            </div>
            <Button asChild className="mt-5">
              <Link href="/admin/users/new">Crear usuario</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
