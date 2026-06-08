'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createOrUpdatePrediction } from '@/actions/predictions'

interface Props {
  matchId: string
  homeTeam: string
  awayTeam: string
  currentPick: string | null
}

export function PredictionForm({ matchId, homeTeam, awayTeam, currentPick }: Props) {
  const [selected, setSelected] = useState<string | null>(currentPick)
  const [isPending, startTransition] = useTransition()

  function save(pick: string) {
    if (pick === selected || isPending) return
    setSelected(pick)
    startTransition(async () => {
      const result = await createOrUpdatePrediction(matchId, pick)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('¡Pronóstico guardado!')
      }
    })
  }

  const options = [
    { value: 'HOME', label: homeTeam, sublabel: 'Local' },
    { value: 'DRAW', label: 'Empate', sublabel: '—' },
    { value: 'AWAY', label: awayTeam, sublabel: 'Visitante' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground text-center">
        ¿Cuál es tu pronóstico?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => save(opt.value)}
              disabled={isPending}
              className={cn(
                'flex flex-col items-center gap-1 py-5 px-2 rounded-xl border-2 font-medium text-center',
                'transition-all duration-150 cursor-pointer select-none',
                'hover:scale-[1.03] active:scale-[0.97]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
              )}
            >
              <span
                className={cn(
                  'text-[10px] uppercase tracking-wider font-semibold',
                  isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}
              >
                {opt.sublabel}
              </span>
              <span className="text-sm leading-snug font-bold">{opt.label}</span>
              {isSelected && <span className="text-primary-foreground/80 text-xs mt-0.5">✓</span>}
            </button>
          )
        })}
      </div>
      {isPending && (
        <p className="text-xs text-muted-foreground text-center animate-pulse">Guardando...</p>
      )}
    </div>
  )
}
