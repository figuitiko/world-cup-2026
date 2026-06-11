import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SpecialPicksForm } from '@/components/special-picks-form'
import { saveChampionPick, saveScorerPick } from '@/actions/specialPicks'

vi.mock('@/actions/specialPicks', () => ({
  saveChampionPick: vi.fn(),
  saveScorerPick: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockedSaveChampionPick = vi.mocked(saveChampionPick)
const mockedSaveScorerPick = vi.mocked(saveScorerPick)

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
    mockedSaveChampionPick.mockResolvedValue(undefined)
    mockedSaveScorerPick.mockResolvedValue(undefined)
  })

  it('asks for confirmation before saving champion', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: /guardar campeón/i }))

    expect(mockedSaveChampionPick).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/queda bloqueado/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /confirmar y bloquear/i }))

    await waitFor(() => {
      expect(mockedSaveChampionPick).toHaveBeenCalledWith('España')
    })
  })

  it('asks for confirmation before saving scorer', async () => {
    render(
      <SpecialPicksForm
        initialChampions={[]}
        initialScorers={[]}
        championCandidates={championCandidates}
        scorerCandidates={scorerCandidates}
        locked={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Kylian Mbappé/i }))
    fireEvent.click(screen.getByRole('button', { name: /guardar goleador/i }))

    expect(mockedSaveScorerPick).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /confirmar y bloquear/i }))

    await waitFor(() => {
      expect(mockedSaveScorerPick).toHaveBeenCalledWith('Kylian Mbappé')
    })
  })

  it('shows champion as locked and scorer as editable when only champion is set', () => {
    render(
      <SpecialPicksForm
        initialChampions={['Argentina']}
        initialScorers={[]}
        championCandidates={championCandidates}
        scorerCandidates={scorerCandidates}
        locked={false}
      />
    )

    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /guardar campeón/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guardar goleador/i })).toBeInTheDocument()
  })

  it('shows scorer as locked and champion as editable when only scorer is set', () => {
    render(
      <SpecialPicksForm
        initialChampions={[]}
        initialScorers={['Erling Haaland']}
        championCandidates={championCandidates}
        scorerCandidates={scorerCandidates}
        locked={false}
      />
    )

    expect(screen.getByText('Erling Haaland')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /guardar goleador/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guardar campeón/i })).toBeInTheDocument()
  })

  it('hides all save buttons when both picks are already set', () => {
    render(
      <SpecialPicksForm
        initialChampions={['Argentina']}
        initialScorers={['Erling Haaland']}
        championCandidates={championCandidates}
        scorerCandidates={scorerCandidates}
        locked={false}
      />
    )

    expect(screen.getByText('Argentina')).toBeInTheDocument()
    expect(screen.getByText('Erling Haaland')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /guardar campeón/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /guardar goleador/i })).not.toBeInTheDocument()
  })
})
