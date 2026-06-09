'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { setTournamentResult } from '@/actions/admin'

export default function AdminTournamentPage() {
  const [champion, setChampion] = useState('')
  const [topScorer, setTopScorer] = useState('')
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Resultado Final del Torneo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Cargar campeón y goleador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="champion">Selección campeona</Label>
              <Input
                id="champion"
                value={champion}
                onChange={(e) => setChampion(e.target.value)}
                placeholder="Ej: Argentina"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topScorer">Goleador del torneo</Label>
              <Input
                id="topScorer"
                value={topScorer}
                onChange={(e) => setTopScorer(e.target.value)}
                placeholder="Ej: Mbappé"
                required
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar resultado final'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
