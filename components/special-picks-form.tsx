'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveSpecialPicks } from '@/actions/specialPicks'

interface Props {
  initialChampions: string[]
  initialScorers: string[]
  locked: boolean
}

export function SpecialPicksForm({ initialChampions, initialScorers, locked }: Props) {
  const [champions, setChampions] = useState<string[]>(
    initialChampions.length === 3 ? initialChampions : ['', '', '']
  )
  const [scorers, setScorers] = useState<string[]>(
    initialScorers.length === 3 ? initialScorers : ['', '', '']
  )
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await saveSpecialPicks(champions, scorers)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('¡Picks especiales guardados!')
      }
    })
  }

  if (locked) {
    return (
      <p className="text-muted-foreground text-sm">
        El torneo comenzó. No podés modificar tus picks especiales.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-medium">Campeones (elegí 3)</h3>
        {champions.map((c, i) => (
          <div key={i}>
            <Label htmlFor={`champion-${i}`}>Opción {i + 1}</Label>
            <Input
              id={`champion-${i}`}
              value={c}
              onChange={(e) => {
                const next = [...champions]
                next[i] = e.target.value
                setChampions(next)
              }}
              placeholder="Ej: Argentina"
              required
            />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="font-medium">Goleadores (elegí 3)</h3>
        {scorers.map((s, i) => (
          <div key={i}>
            <Label htmlFor={`scorer-${i}`}>Opción {i + 1}</Label>
            <Input
              id={`scorer-${i}`}
              value={s}
              onChange={(e) => {
                const next = [...scorers]
                next[i] = e.target.value
                setScorers(next)
              }}
              placeholder="Ej: Mbappé"
              required
            />
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar picks especiales'}
      </Button>
    </form>
  )
}
