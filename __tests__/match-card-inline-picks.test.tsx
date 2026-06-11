import { render, screen } from '@testing-library/react'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { MatchCard } from '@/components/match-card'
import type { Match, Prediction } from '@/generated/prisma/client'

vi.mock('@/actions/predictions', () => ({
  createOrUpdatePrediction: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const futureMatch: Match = {
  id: 'match1',
  matchNumber: 1,
  group: 'A',
  round: 'GROUP',
  homeTeam: 'México',
  awayTeam: 'Sudáfrica',
  kickoff: new Date(Date.now() + 1000 * 60 * 60),
  venue: 'Estadio Azteca',
  result: null,
  locked: false,
}

const prediction: Prediction = {
  id: 'prediction1',
  userId: 'user1',
  matchId: 'match1',
  pick: 'HOME',
  createdAt: new Date(),
}

describe('MatchCard inline picks', () => {
  it('renders pick controls directly on the match card instead of linking to a detail page', () => {
    render(<MatchCard match={futureMatch} prediction={prediction} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gana México' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Empate' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gana Sudáfrica' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gana México' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('removes the unused match detail route', () => {
    const detailPagePath = join(process.cwd(), 'app/(app)/matches/[id]/page.tsx')

    expect(existsSync(detailPagePath)).toBe(false)
  })
})
