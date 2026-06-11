import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    match: { findFirst: vi.fn() },
    specialPick: { findUnique: vi.fn(), upsert: vi.fn() },
    specialPickLock: { findUnique: vi.fn() },
  },
}))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

const mockedAuth = auth as Mock
const mockedFindFirstMatch = prisma.match.findFirst as Mock
const mockedFindSpecialPick = prisma.specialPick.findUnique as Mock
const mockedUpsertSpecialPick = prisma.specialPick.upsert as Mock
const mockedFindLock = prisma.specialPickLock.findUnique as Mock

const futureKickoff = new Date(Date.now() + 1000 * 60 * 60 * 24)
const pastKickoff = new Date(Date.now() - 1000)

describe('saveChampionPick', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'u1' } })
    mockedFindFirstMatch.mockResolvedValue({ kickoff: futureKickoff })
    mockedFindSpecialPick.mockResolvedValue(null)
    mockedFindLock.mockResolvedValue(null)
  })

  it('saves champion pick', async () => {
    mockedUpsertSpecialPick.mockResolvedValue({})
    const { saveChampionPick } = await import('@/actions/specialPicks')

    const result = await saveChampionPick('Argentina')

    expect(result).toBeUndefined()
    expect(mockedUpsertSpecialPick).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      update: { champions: ['Argentina'] },
      create: { userId: 'u1', champions: ['Argentina'], topScorers: [] },
    })
  })

  it('rejects empty champion', async () => {
    const { saveChampionPick } = await import('@/actions/specialPicks')

    const result = await saveChampionPick('')

    expect(result).toEqual({ error: 'Seleccioná un campeón' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('rejects when group phase already ended', async () => {
    mockedFindFirstMatch.mockResolvedValue({ kickoff: pastKickoff })
    const { saveChampionPick } = await import('@/actions/specialPicks')

    const result = await saveChampionPick('Argentina')

    expect(result).toEqual({ error: 'La fase de grupos ya terminó, no podés cambiar tu campeón' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })
})

describe('saveScorerPick', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'u1' } })
    mockedFindFirstMatch.mockResolvedValue({ kickoff: futureKickoff })
    mockedFindSpecialPick.mockResolvedValue(null)
    mockedFindLock.mockResolvedValue(null)
  })

  it('saves scorer pick', async () => {
    mockedUpsertSpecialPick.mockResolvedValue({})
    const { saveScorerPick } = await import('@/actions/specialPicks')

    const result = await saveScorerPick('Kylian Mbappé')

    expect(result).toBeUndefined()
    expect(mockedUpsertSpecialPick).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      update: { topScorers: ['Kylian Mbappé'] },
      create: { userId: 'u1', champions: [], topScorers: ['Kylian Mbappé'] },
    })
  })

  it('rejects empty scorer', async () => {
    const { saveScorerPick } = await import('@/actions/specialPicks')

    const result = await saveScorerPick('')

    expect(result).toEqual({ error: 'Seleccioná un goleador' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('rejects when tournament already started', async () => {
    mockedFindFirstMatch.mockResolvedValue({ kickoff: pastKickoff })
    const { saveScorerPick } = await import('@/actions/specialPicks')

    const result = await saveScorerPick('Kylian Mbappé')

    expect(result).toEqual({ error: 'El torneo ya comenzó, no podés cambiar tu goleador' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })
})
