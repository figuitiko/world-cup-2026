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
  variant?: 'default' | 'compact'
}

export function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  currentPick,
  variant = 'default',
}: Props) {
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

  const isCompact = variant === 'compact'
  const options = [
    { value: 'HOME', label: isCompact ? `Gana ${homeTeam}` : homeTeam, sublabel: 'Local' },
    { value: 'DRAW', label: 'Empate', sublabel: '—' },
    { value: 'AWAY', label: isCompact ? `Gana ${awayTeam}` : awayTeam, sublabel: 'Visitante' },
  ]

  if (isCompact) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap justify-center gap-1.5">
          {options.map((opt) => {
            const isSelected = selected === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => save(opt.value)}
                disabled={isPending}
                aria-pressed={isSelected}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-bold transition-all',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {isPending && (
          <p className="text-center text-[11px] text-muted-foreground animate-pulse">
            Guardando...
          </p>
        )}
      </div>
    )
  }

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
              aria-pressed={isSelected}
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
