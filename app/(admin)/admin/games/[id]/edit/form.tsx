'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateMatch } from '@/actions/admin'
import type { Match } from '@/generated/prisma/client'

function toDatetimeLocal(date: Date): string {
  return new Date(date).toISOString().slice(0, 16)
}

export default function EditGameForm({ match }: { match: Match }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    matchNumber: String(match.matchNumber),
    group: match.group ?? '',
    round: match.round,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    kickoff: toDatetimeLocal(match.kickoff),
    venue: match.venue,
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateMatch(match.id, form)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Partido actualizado')
        router.push('/admin/games')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del partido</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matchNumber">Número de partido</Label>
              <Input id="matchNumber" name="matchNumber" type="number" value={form.matchNumber} onChange={onChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Grupo (opcional)</Label>
              <Input id="group" name="group" value={form.group} onChange={onChange} placeholder="Ej: A" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="round">Fase</Label>
            <Input id="round" name="round" value={form.round} onChange={onChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeTeam">Local</Label>
              <Input id="homeTeam" name="homeTeam" value={form.homeTeam} onChange={onChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awayTeam">Visitante</Label>
              <Input id="awayTeam" name="awayTeam" value={form.awayTeam} onChange={onChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kickoff">Fecha y hora</Label>
            <Input id="kickoff" name="kickoff" type="datetime-local" value={form.kickoff} onChange={onChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Estadio</Label>
            <Input id="venue" name="venue" value={form.venue} onChange={onChange} required />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar cambios'}
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
