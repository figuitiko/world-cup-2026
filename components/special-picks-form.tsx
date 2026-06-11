'use client'

import { useState, useTransition } from 'react'
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
import { saveChampionPick, saveScorerPick } from '@/actions/specialPicks'
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

function LockedPickBadge({ value, variant }: { value: string; variant: 'amber' | 'primary' }) {
  return (
    <span className={cn(
      'text-sm px-3 py-1 rounded-full font-semibold inline-block',
      variant === 'amber' && 'bg-amber-50 border border-amber-200 text-amber-800',
      variant === 'primary' && 'bg-primary/10 border border-primary/20 text-primary',
    )}>
      {value}
    </span>
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
  const [champion, setChampion] = useState<string>(initialChampions.filter(Boolean)[0] ?? '')
  const [scorer, setScorer] = useState<string>(initialScorers.filter(Boolean)[0] ?? '')
  const [savedChampion, setSavedChampion] = useState(false)
  const [savedScorer, setSavedScorer] = useState(false)
  const [confirmType, setConfirmType] = useState<'champion' | 'scorer' | null>(null)
  const [isPending, startTransition] = useTransition()

  const championIsSaved = savedChampion || initialChampions.filter(Boolean).length === 1
  const scorerIsSaved = savedScorer || initialScorers.filter(Boolean).length === 1

  const championReadOnly = locked || championIsSaved || championLocked
  const scorerReadOnly = locked || scorerIsSaved || topScorerLocked

  function getLockedReason(adminLocked: boolean, userSaved: boolean) {
    if (locked) return 'El torneo ya comenzó. No podés modificar tus picks.'
    if (adminLocked) return 'El admin bloqueó este pick.'
    if (userSaved) return 'Este pick quedó bloqueado.'
    return ''
  }

  function confirmSave() {
    startTransition(async () => {
      let result: { error: string } | undefined

      if (confirmType === 'champion') {
        result = await saveChampionPick(champion)
        if (!result?.error) setSavedChampion(true)
      } else if (confirmType === 'scorer') {
        result = await saveScorerPick(scorer)
        if (!result?.error) setSavedScorer(true)
      }

      if (result?.error) {
        toast.error(result.error)
      } else {
        setConfirmType(null)
        toast.success('¡Pick guardado!')
      }
    })
  }

  return (
    <>
      <div className="space-y-8">
        {/* Champion section */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg">🏆 Campeón</h3>
          {championReadOnly ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {getLockedReason(championLocked, championIsSaved)}
              </p>
              {champion && <LockedPickBadge value={champion} variant="amber" />}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Elegí la selección campeona. Tocá para seleccionar, volvé a tocar para quitar.
              </p>
              <CandidateGrid
                candidates={championCandidates}
                selected={champion ? [champion] : []}
                max={1}
                onChange={v => setChampion(v[0] ?? '')}
                variant="amber"
              />
              <Button
                type="button"
                className="w-full h-11 font-bold"
                disabled={!champion || isPending}
                onClick={() => setConfirmType('champion')}
              >
                Guardar campeón
              </Button>
            </>
          )}
        </div>

        {/* Scorer section */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg">⚽ Goleador</h3>
          {scorerReadOnly ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {getLockedReason(topScorerLocked, scorerIsSaved)}
              </p>
              {scorer && <LockedPickBadge value={scorer} variant="primary" />}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Elegí el goleador del torneo. Tocá para seleccionar, volvé a tocar para quitar.
              </p>
              <CandidateGrid
                candidates={scorerCandidates.map(s => ({ ...s, sub: s.country }))}
                selected={scorer ? [scorer] : []}
                max={1}
                onChange={v => setScorer(v[0] ?? '')}
                variant="primary"
              />
              <Button
                type="button"
                className="w-full h-11 font-bold"
                disabled={!scorer || isPending}
                onClick={() => setConfirmType('scorer')}
              >
                Guardar goleador
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={confirmType !== null} onOpenChange={open => !open && setConfirmType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmá tu pick</DialogTitle>
            <DialogDescription>
              Una vez que confirmes, este pick queda bloqueado. No vas a poder cambiarlo después.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Selección definitiva</p>
            {confirmType === 'champion' && (
              <p className="mt-1">Campeón: <span className="font-semibold">{champion}</span></p>
            )}
            {confirmType === 'scorer' && (
              <p className="mt-1">Goleador: <span className="font-semibold">{scorer}</span></p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Revisar
              </Button>
            </DialogClose>
            <Button type="button" onClick={confirmSave} disabled={isPending}>
              {isPending ? 'Guardando...' : 'Confirmar y bloquear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
