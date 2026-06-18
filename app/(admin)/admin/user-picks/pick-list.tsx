'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setPickForUser } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserTimezoneDateTime } from '@/components/user-timezone-date-time'

type Pick = 'HOME' | 'DRAW' | 'AWAY'

interface MatchRow {
  id: string
  homeTeam: string
  awayTeam: string
  kickoff: Date
  currentPick: Pick | null
}

interface Props {
  matches: MatchRow[]
  userId: string
}

export function MatchPickList({ matches, userId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handlePick(matchId: string, pick: Pick) {
    startTransition(async () => {
      await setPickForUser(userId, matchId, pick)
      router.refresh()
    })
  }

  if (matches.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">No hay partidos disponibles para esta fase.</p>
  }

  const now = new Date()

  return (
    <div className="space-y-2">
      {matches.map(match => {
        const isPast = new Date(match.kickoff) <= now
        return (
          <div
            key={match.id}
            id={`m-${match.id}`}
            className={`flex items-start justify-between gap-4 p-4 border rounded-lg scroll-mt-16 ${isPast ? 'opacity-50' : ''}`}
          >
            <div>
              <p className="font-medium text-sm">
                {match.homeTeam} vs {match.awayTeam}
              </p>
              <UserTimezoneDateTime
                value={new Date(match.kickoff).toISOString()}
                className="text-xs text-muted-foreground"
              />
              {isPast && (
                <span className="text-xs text-muted-foreground italic">Partido iniciado</span>
              )}
              {match.currentPick && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {match.currentPick === 'HOME'
                    ? match.homeTeam
                    : match.currentPick === 'AWAY'
                      ? match.awayTeam
                      : 'Empate'}
                </Badge>
              )}
            </div>

            <div className="flex gap-1 shrink-0 flex-wrap justify-end">
              {(['HOME', 'DRAW', 'AWAY'] as const).map(pick => {
                const label =
                  pick === 'HOME' ? match.homeTeam : pick === 'AWAY' ? match.awayTeam : 'Empate'
                return (
                  <Button
                    key={pick}
                    size="sm"
                    variant={match.currentPick === pick ? 'default' : 'outline'}
                    className="text-xs"
                    disabled={isPending || isPast}
                    onClick={() => handlePick(match.id, pick)}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
