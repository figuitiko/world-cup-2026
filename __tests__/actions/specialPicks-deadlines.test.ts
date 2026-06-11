import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    match: { findFirst: vi.fn() },
    specialPick: { findUnique: vi.fn(), upsert: vi.fn() },
    specialPickLock: { findUnique: vi.fn() },
  },
}))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const mockedAuth = auth as Mock
const mockedFindMatch = prisma.match.findFirst as Mock
const mockedFindSpecialPick = prisma.specialPick.findUnique as Mock
const mockedFindLock = prisma.specialPickLock.findUnique as Mock
const mockedUpsertSpecialPick = prisma.specialPick.upsert as Mock

const pastKickoff = new Date(Date.now() - 1000)
const futureKickoff = new Date(Date.now() + 1000 * 60 * 60 * 24)

function mockGroupWindow(firstKickoff: Date, lastKickoff: Date) {
  mockedFindMatch.mockImplementation(({ orderBy }: { orderBy: { kickoff: 'asc' | 'desc' } }) => {
    return Promise.resolve({ kickoff: orderBy.kickoff === 'asc' ? firstKickoff : lastKickoff })
  })
}

describe('special pick deadline rules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'u1' } })
    mockedFindSpecialPick.mockResolvedValue(null)
    mockedFindLock.mockResolvedValue(null)
  })

  it('allows saving champion after the first group match while the last group match is still in the future', async () => {
    mockGroupWindow(pastKickoff, futureKickoff)
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

  it('rejects saving champion after the last group match', async () => {
    mockGroupWindow(pastKickoff, pastKickoff)
    const { saveChampionPick } = await import('@/actions/specialPicks')

    const result = await saveChampionPick('Argentina')

    expect(result).toEqual({ error: 'La fase de grupos ya terminó, no podés cambiar tu campeón' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('still rejects saving top scorer after the first group match', async () => {
    mockGroupWindow(pastKickoff, futureKickoff)
    const { saveScorerPick } = await import('@/actions/specialPicks')

    const result = await saveScorerPick('Kylian Mbappé')

    expect(result).toEqual({ error: 'El torneo ya comenzó, no podés cambiar tu goleador' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })
})
