'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { setTournamentResult } from '@/actions/admin'
import type { ChampionCandidate, TopScorerCandidate, TournamentResult } from '@/generated/prisma/client'

interface Props {
  champions: ChampionCandidate[]
  topScorers: TopScorerCandidate[]
  current: TournamentResult | null
}

export default function TournamentForm({ champions, topScorers, current }: Props) {
  const [champion, setChampion] = useState(current?.champion ?? '')
  const [topScorer, setTopScorer] = useState(current?.topScorer ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await setTournamentResult(champion, topScorer)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('¡Resultado del torneo guardado!')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar campeón y goleador</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Selección campeona</Label>
            <Select value={champion} onValueChange={setChampion}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar campeón" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {champions.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Goleador del torneo</Label>
            <Select value={topScorer} onValueChange={setTopScorer}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar goleador" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {topScorers.map(s => (
                  <SelectItem key={s.id} value={s.name}>{s.name} ({s.country})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar resultado final'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
