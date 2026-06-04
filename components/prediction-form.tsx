'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createOrUpdatePrediction } from '@/actions/predictions'

interface Props {
  matchId: string
  homeTeam: string
  awayTeam: string
  currentPick: string | null
}

export function PredictionForm({ matchId, homeTeam, awayTeam, currentPick }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const pick = fd.get('pick') as string
    if (!pick) return
    startTransition(async () => {
      const result = await createOrUpdatePrediction(matchId, pick)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('¡Pronóstico guardado!')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RadioGroup name="pick" defaultValue={currentPick ?? undefined}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="HOME" id="pick-home" />
          <Label htmlFor="pick-home" className="cursor-pointer text-base">
            Gana {homeTeam}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="DRAW" id="pick-draw" />
          <Label htmlFor="pick-draw" className="cursor-pointer text-base">
            Empate
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="AWAY" id="pick-away" />
          <Label htmlFor="pick-away" className="cursor-pointer text-base">
            Gana {awayTeam}
          </Label>
        </div>
      </RadioGroup>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar pronóstico'}
      </Button>
    </form>
  )
}
