import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SpecialPicksForm } from '@/components/special-picks-form'

vi.mock('@/actions/specialPicks', () => ({
  saveChampionPick: vi.fn(),
  saveScorerPick: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('SpecialPicksForm random top scorer', () => {
  it('does not expose random top scorer assignment to regular users', () => {
    render(
      <SpecialPicksForm
        initialChampions={['Argentina']}
        initialScorers={[]}
        championCandidates={[{ id: 'arg', name: 'Argentina' }]}
        scorerCandidates={[{ id: 'mbappe', name: 'Kylian Mbappé', country: 'Francia' }]}
        locked={false}
      />
    )

    expect(
      screen.queryByRole('button', { name: /asignar goleador al azar/i })
    ).not.toBeInTheDocument()
  })
})
