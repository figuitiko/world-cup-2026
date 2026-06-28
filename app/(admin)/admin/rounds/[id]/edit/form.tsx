'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateRound } from '@/actions/admin'
import type { Round } from '@/generated/prisma/client'

export default function EditRoundForm({ round }: { round: Round }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    key: round.key,
    label: round.label,
    order: String(round.order),
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateRound(round.id, form)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Fase actualizada')
        router.push('/admin/rounds')
      }
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Datos de la fase</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">Clave</Label>
              <Input id="key" name="key" value={form.key} onChange={onChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input id="order" name="order" type="number" value={form.order} onChange={onChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="label">Etiqueta</Label>
            <Input id="label" name="label" value={form.label} onChange={onChange} required />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar cambios'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
