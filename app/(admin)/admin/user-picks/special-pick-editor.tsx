'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setSpecialPickForUser, clearSpecialPickForUser } from '@/actions/admin'
import { cn } from '@/lib/utils'

interface ChampionCandidate { id: string; name: string }
interface ScorerCandidate { id: string; name: string; country: string }

interface Props {
  userId: string
  currentChampion: string | null
  currentScorer: string | null
  championCandidates: ChampionCandidate[]
  scorerCandidates: ScorerCandidate[]
}

function CandidateGrid({
  candidates,
  current,
  variant,
  disabled,
  onSelect,
}: {
  candidates: { id: string; name: string; sub?: string }[]
  current: string | null
  variant: 'amber' | 'primary'
  disabled: boolean
  onSelect: (name: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {candidates.map(c => {
        const isSelected = c.name === current
        return (
          <button
            key={c.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(c.name)}
            aria-pressed={isSelected}
            className={cn(
              'px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all duration-150',
              variant === 'amber' && isSelected && 'bg-amber-100 border-amber-400 text-amber-800 shadow-sm',
              variant === 'primary' && isSelected && 'bg-primary/15 border-primary text-primary shadow-sm',
              !isSelected && !disabled && 'border-border hover:border-muted-foreground bg-background',
              disabled && 'opacity-50 cursor-not-allowed',
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

export function SpecialPickEditor({
  userId,
  currentChampion,
  currentScorer,
  championCandidates,
  scorerCandidates,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleSet(type: 'champion' | 'scorer', value: string) {
    startTransition(async () => {
      const result = await setSpecialPickForUser(userId, type, value)
      if (result?.error) {
        toast.error(result.error)
      } else {
        router.refresh()
      }
    })
  }

  async function handleClear(type: 'champion' | 'scorer') {
    startTransition(async () => {
      const result = await clearSpecialPickForUser(userId, type)
      if (result?.error) {
        toast.error(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="border rounded-lg p-4 space-y-5 bg-muted/30">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Picks especiales
      </p>

      {/* Champion */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">🏆 Campeón</span>
          {currentChampion && (
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">
              {currentChampion}
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleClear('champion')}
                className="hover:text-amber-600 disabled:opacity-50"
                aria-label="Quitar campeón"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
        <CandidateGrid
          candidates={championCandidates}
          current={currentChampion}
          variant="amber"
          disabled={isPending}
          onSelect={name => handleSet('champion', name)}
        />
      </div>

      {/* Scorer */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">⚽ Goleador</span>
          {currentScorer && (
            <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">
              {currentScorer}
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleClear('scorer')}
                className="hover:text-primary/70 disabled:opacity-50"
                aria-label="Quitar goleador"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
        <CandidateGrid
          candidates={scorerCandidates.map(s => ({ ...s, sub: s.country }))}
          current={currentScorer}
          variant="primary"
          disabled={isPending}
          onSelect={name => handleSet('scorer', name)}
        />
      </div>

      {isPending && (
        <p className="text-xs text-muted-foreground">Guardando...</p>
      )}
    </div>
  )
}
