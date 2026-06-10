'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  championLocked?: boolean
  topScorerLocked?: boolean
}

function CandidateGrid({
  candidates,
  selected,
  max,
  onChange,
  variant,
  disabled = false,
}: {
  candidates: { id: string; name: string; sub?: string }[]
  selected: string[]
  max: number
  onChange: (v: string[]) => void
  variant: 'amber' | 'primary'
  disabled?: boolean
}) {
  function toggle(name: string) {
    if (disabled) return
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
        const isDisabled = disabled || isFull
        return (
          <button
            key={c.id}
            type="button"
            disabled={isDisabled}
            onClick={() => toggle(c.name)}
            aria-pressed={isSelected}
            className={cn(
              'px-3 py-2 rounded-xl border text-sm font-semibold transition-all duration-150',
              variant === 'amber' && isSelected && 'bg-amber-100 border-amber-400 text-amber-800 shadow-sm',
              variant === 'primary' && isSelected && 'bg-primary/15 border-primary text-primary shadow-sm',
              !isSelected && !isDisabled && 'border-border hover:border-muted-foreground bg-background',
              isDisabled && !isSelected && 'opacity-30 cursor-not-allowed border-border',
              disabled && isSelected && 'cursor-not-allowed opacity-70',
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
  championLocked = false,
  topScorerLocked = false,
}: Props) {
  const [champions, setChampions] = useState<string[]>(initialChampions.slice(0, 3))
  const [scorers, setScorers] = useState<string[]>(initialScorers.slice(0, 3))
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [savedAndLocked, setSavedAndLocked] = useState(false)
  const [isPending, startTransition] = useTransition()

  const hasUserLockedPicks = savedAndLocked || (
    initialChampions.filter(Boolean).length === 1 && initialScorers.filter(Boolean).length === 1
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (champions.length !== 1 || scorers.length !== 1) {
      toast.error('Seleccioná un campeón y un goleador')
      return
    }
    setConfirmOpen(true)
  }

  function confirmSubmit() {
    startTransition(async () => {
      const result = await saveSpecialPicks(champions, scorers)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setConfirmOpen(false)
        setSavedAndLocked(true)
        toast.success('¡Picks especiales guardados!')
      }
    })
  }

  if (locked || hasUserLockedPicks) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="text-4xl">🔒</div>
        <p className="font-heading font-bold text-lg">
          {locked ? 'El torneo ya comenzó' : 'Tus picks especiales ya quedaron bloqueados'}
        </p>
        <p className="text-sm text-muted-foreground">
          {locked
            ? 'No podés modificar tus picks especiales.'
            : 'Esta selección es definitiva para mantener el juego justo para todos.'}
        </p>

        {(champions.some(Boolean) || scorers.some(Boolean)) && (
          <div className="mt-6 space-y-5 text-left max-w-xs mx-auto">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Tus campeones
              </p>
              <div className="flex flex-wrap gap-2">
                {champions.filter(Boolean).map((c, i) => (
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
                {scorers.filter(Boolean).map((s, i) => (
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
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Champions */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg">🏆 Campeón</h3>
          <p className="text-xs text-muted-foreground">
            {championLocked
              ? 'El admin ya bloqueó este pick. No se puede cambiar.'
              : 'Elegí la selección campeona. Tocá para seleccionar, volvé a tocar para quitar.'}
          </p>
          <CandidateGrid
            candidates={championCandidates}
            selected={champions}
            max={1}
            onChange={setChampions}
            variant="amber"
            disabled={championLocked}
          />
        </div>

        {/* Scorers */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg">⚽ Goleador</h3>
          <p className="text-xs text-muted-foreground">
            {topScorerLocked
              ? 'El admin ya bloqueó este pick. No se puede cambiar.'
              : 'Elegí el goleador del torneo. Tocá para seleccionar, volvé a tocar para quitar.'}
          </p>
          <CandidateGrid
            candidates={scorerCandidates.map(s => ({ ...s, sub: s.country }))}
            selected={scorers}
            max={1}
            onChange={setScorers}
            variant="primary"
            disabled={topScorerLocked}
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmá tus picks especiales</DialogTitle>
            <DialogDescription>
              Cuando confirmes, tu campeón y goleador quedan bloqueados. No vas a poder cambiarlos después.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Selección definitiva</p>
            <p className="mt-1">
              Campeón: <span className="font-semibold">{champions[0]}</span>
            </p>
            <p>
              Goleador: <span className="font-semibold">{scorers[0]}</span>
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Revisar
              </Button>
            </DialogClose>
            <Button type="button" onClick={confirmSubmit} disabled={isPending}>
              {isPending ? 'Guardando...' : 'Confirmar y bloquear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
