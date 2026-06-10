import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SpecialPicksForm } from '@/components/special-picks-form'
import { saveSpecialPicks } from '@/actions/specialPicks'

vi.mock('@/actions/specialPicks', () => ({
  saveSpecialPicks: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockedSaveSpecialPicks = vi.mocked(saveSpecialPicks)

const championCandidates = [
  { id: 'arg', name: 'Argentina' },
  { id: 'esp', name: 'España' },
]

const scorerCandidates = [
  { id: 'mbappe', name: 'Kylian Mbappé', country: 'Francia' },
  { id: 'haaland', name: 'Erling Haaland', country: 'Noruega' },
]

describe('SpecialPicksForm user locking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedSaveSpecialPicks.mockResolvedValue(undefined)
  })

  it('asks for confirmation before saving because special picks become locked', async () => {
    render(
      <SpecialPicksForm
        initialChampions={[]}
        initialScorers={[]}
        championCandidates={championCandidates}
        scorerCandidates={scorerCandidates}
        locked={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'España' }))
    fireEvent.click(screen.getByRole('button', { name: /Kylian Mbappé/i }))
    fireEvent.click(screen.getByRole('button', { name: /guardar picks especiales/i }))

    expect(mockedSaveSpecialPicks).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/quedan bloqueados/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /confirmar y bloquear/i }))

    await waitFor(() => {
      expect(mockedSaveSpecialPicks).toHaveBeenCalledWith(['España'], ['Kylian Mbappé'])
    })
  })

  it('shows existing special picks as locked instead of allowing edits', () => {
    render(
      <SpecialPicksForm
        initialChampions={['Argentina']}
        initialScorers={['Erling Haaland']}
        championCandidates={championCandidates}
        scorerCandidates={scorerCandidates}
        locked={false}
      />
    )

    expect(screen.getByText(/tus picks especiales ya quedaron bloqueados/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /guardar picks especiales/i })).not.toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText('Erling Haaland')).toBeInTheDocument()
  })
})
