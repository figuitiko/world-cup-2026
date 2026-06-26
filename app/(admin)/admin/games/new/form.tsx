'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createMatch } from '@/actions/admin'
import type { Team } from '@/generated/prisma/client'

const INITIAL = { matchNumber: '', group: '', round: '', homeTeam: '', awayTeam: '', kickoff: '', venue: '' }

export default function NewGameForm({ teams }: { teams: Team[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState(INITIAL)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createMatch({
        ...form,
        kickoff: new Date(form.kickoff).toISOString(),
      })
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Partido creado')
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
            <Input id="round" name="round" value={form.round} onChange={onChange} placeholder="Ej: GROUP" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Local</Label>
              {teams.length > 0 ? (
                <Select
                  value={form.homeTeam}
                  onValueChange={(val) => setForm(prev => ({ ...prev, homeTeam: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar local" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {teams.filter(t => t.name !== form.awayTeam).map(t => (
                      <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="homeTeam" name="homeTeam" value={form.homeTeam} onChange={onChange} required />
              )}
            </div>
            <div className="space-y-2">
              <Label>Visitante</Label>
              {teams.length > 0 ? (
                <Select
                  value={form.awayTeam}
                  onValueChange={(val) => setForm(prev => ({ ...prev, awayTeam: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar visitante" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {teams.filter(t => t.name !== form.homeTeam).map(t => (
                      <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="awayTeam" name="awayTeam" value={form.awayTeam} onChange={onChange} required />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kickoff">
              Fecha y hora{' '}
              <span className="text-xs text-muted-foreground font-normal" suppressHydrationWarning>
                (tu zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone})
              </span>
            </Label>
            <Input id="kickoff" name="kickoff" type="datetime-local" value={form.kickoff} onChange={onChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Estadio</Label>
            <Input id="venue" name="venue" value={form.venue} onChange={onChange} required />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
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
