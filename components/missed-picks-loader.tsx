'use client'

import { useEffect, useState } from 'react'
import { getMissedMatchesToday } from '@/actions/predictions'
import { MissedPicksModal } from './missed-picks-modal'

interface MissedMatch {
  id: string
  homeTeam: string
  awayTeam: string
  kickoff: Date
}

export function MissedPicksLoader() {
  const [matches, setMatches] = useState<MissedMatch[] | null>(null)

  useEffect(() => {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    getMissedMatchesToday(startOfDay, endOfDay).then(setMatches)
  }, [])

  if (!matches || matches.length === 0) return null
  return <MissedPicksModal matches={matches} />
}
