'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createUser, updateUser } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type EditableUser = {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

type UserFormProps =
  | { mode: 'create'; user?: never }
  | { mode: 'edit'; user: EditableUser }

export default function UserForm({ mode, user }: UserFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    isAdmin: user?.isAdmin ?? false,
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, checked, type } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      const result = mode === 'create' ? await createUser(form) : await updateUser(user.id, form)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(mode === 'create' ? 'Usuario creado' : 'Usuario actualizado')
      router.push('/admin/users')
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Datos del usuario' : 'Cuenta y permisos'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" value={form.name} onChange={onChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {mode === 'create' ? 'Contraseña' : 'Nueva contraseña'}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              minLength={mode === 'create' ? 8 : undefined}
              required={mode === 'create'}
              placeholder={mode === 'edit' ? 'Dejala vacía para no cambiarla' : undefined}
            />
          </div>

          <label className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-4 text-sm">
            <input
              name="isAdmin"
              type="checkbox"
              checked={form.isAdmin}
              onChange={onChange}
              className="mt-1 size-4 accent-primary"
            />
            <span>
              <span className="block font-medium">Puede administrar el torneo</span>
              <span className="text-muted-foreground">
                Activá esto solo para gente que de verdad tenga que cambiar partidos, resultados y
                usuarios.
              </span>
            </span>
          </label>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Guardando...'
                : mode === 'create'
                  ? 'Crear usuario'
                  : 'Guardar cambios'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
