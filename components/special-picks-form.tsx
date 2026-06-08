'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveSpecialPicks } from '@/actions/specialPicks'
import { cn } from '@/lib/utils'

interface Props {
  initialChampions: string[]
  initialScorers: string[]
  locked: boolean
}

function ProgressDots({ values, max = 3 }: { values: string[]; max?: number }) {
  const filled = values.filter(Boolean).length
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-200',
              i < filled ? 'bg-primary scale-110' : 'bg-border'
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {filled}/{max}
      </span>
    </div>
  )
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
      <div className="text-center py-8 space-y-3">
        <div className="text-4xl">🔒</div>
        <p className="font-heading font-bold text-lg">El torneo ya comenzó</p>
        <p className="text-sm text-muted-foreground">No podés modificar tus picks especiales.</p>

        {(initialChampions.some(Boolean) || initialScorers.some(Boolean)) && (
          <div className="mt-6 space-y-5 text-left max-w-xs mx-auto">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Tus campeones
              </p>
              <div className="flex flex-wrap gap-2">
                {initialChampions.filter(Boolean).map((c, i) => (
                  <span
                    key={i}
                    className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full font-semibold"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Tus goleadores
              </p>
              <div className="flex flex-wrap gap-2">
                {initialScorers.filter(Boolean).map((s, i) => (
                  <span
                    key={i}
                    className="bg-primary/10 border border-primary/20 text-primary text-sm px-3 py-1 rounded-full font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Champions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            🏆 Campeones
          </h3>
          <ProgressDots values={champions} />
        </div>
        <p className="text-xs text-muted-foreground">
          Elegí 3 posibles campeones del torneo. Si acertás alguno, sumás +3 puntos.
        </p>
        <div className="space-y-3">
          {champions.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <Input
                value={c}
                onChange={(e) => {
                  const next = [...champions]
                  next[i] = e.target.value
                  setChampions(next)
                }}
                placeholder={`Campeón ${i + 1} — ej: Argentina`}
                required
                className="h-11"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scorers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            ⚽ Goleadores
          </h3>
          <ProgressDots values={scorers} />
        </div>
        <p className="text-xs text-muted-foreground">
          Elegí 3 posibles goleadores del torneo. Si acertás alguno, sumás +3 puntos.
        </p>
        <div className="space-y-3">
          {scorers.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <Input
                value={s}
                onChange={(e) => {
                  const next = [...scorers]
                  next[i] = e.target.value
                  setScorers(next)
                }}
                placeholder={`Goleador ${i + 1} — ej: Mbappé`}
                required
                className="h-11"
              />
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar picks especiales'}
      </Button>
    </form>
  )
}
