'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { saveSpecialPicks } from '@/actions/specialPicks'
import { cn } from '@/lib/utils'

interface ChampionCandidate { id: string; name: string }
interface ScorerCandidate { id: string; name: string; country: string }

interface Props {
  initialChampions: string[]
  initialScorers: string[]
  championCandidates: ChampionCandidate[]
  scorerCandidates: ScorerCandidate[]
  locked: boolean
}

function ProgressDots({ filled, max = 3 }: { filled: number; max?: number }) {
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
      <span className="text-xs text-muted-foreground tabular-nums">{filled}/{max}</span>
    </div>
  )
}

function CandidateGrid({
  candidates,
  selected,
  max,
  onChange,
  variant,
}: {
  candidates: { id: string; name: string; sub?: string }[]
  selected: string[]
  max: number
  onChange: (v: string[]) => void
  variant: 'amber' | 'primary'
}) {
  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name))
    } else if (selected.length < max) {
      onChange([...selected, name])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {candidates.map(c => {
        const isSelected = selected.includes(c.name)
        const isFull = selected.length >= max && !isSelected
        return (
          <button
            key={c.id}
            type="button"
            disabled={isFull}
            onClick={() => toggle(c.name)}
            className={cn(
              'px-3 py-2 rounded-xl border text-sm font-semibold transition-all duration-150',
              variant === 'amber' && isSelected && 'bg-amber-100 border-amber-400 text-amber-800 shadow-sm',
              variant === 'primary' && isSelected && 'bg-primary/15 border-primary text-primary shadow-sm',
              !isSelected && !isFull && 'border-border hover:border-muted-foreground bg-background',
              isFull && 'opacity-30 cursor-not-allowed border-border',
            )}
          >
            {c.name}
            {c.sub && <span className="ml-1.5 text-xs opacity-60 font-normal">{c.sub}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function SpecialPicksForm({
  initialChampions,
  initialScorers,
  championCandidates,
  scorerCandidates,
  locked,
}: Props) {
  const [champions, setChampions] = useState<string[]>(initialChampions.slice(0, 3))
  const [scorers, setScorers] = useState<string[]>(initialScorers.slice(0, 3))
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (champions.length !== 1 || scorers.length !== 1) {
      toast.error('Seleccioná un campeón y un goleador')
      return
    }
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
                  <span key={i} className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full font-semibold">
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
                  <span key={i} className="bg-primary/10 border border-primary/20 text-primary text-sm px-3 py-1 rounded-full font-semibold">
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
        <h3 className="font-heading font-bold text-lg">🏆 Campeón</h3>
        <p className="text-xs text-muted-foreground">
          Elegí la selección campeona. Tocá para seleccionar, volvé a tocar para quitar.
        </p>
        <CandidateGrid
          candidates={championCandidates}
          selected={champions}
          max={1}
          onChange={setChampions}
          variant="amber"
        />
      </div>

      {/* Scorers */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-lg">⚽ Goleador</h3>
        <p className="text-xs text-muted-foreground">
          Elegí el goleador del torneo. Tocá para seleccionar, volvé a tocar para quitar.
        </p>
        <CandidateGrid
          candidates={scorerCandidates.map(s => ({ ...s, sub: s.country }))}
          selected={scorers}
          max={1}
          onChange={setScorers}
          variant="primary"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-bold"
        disabled={isPending || champions.length !== 1 || scorers.length !== 1}
      >
        {isPending ? 'Guardando...' : 'Guardar picks especiales'}
      </Button>
    </form>
  )
}
