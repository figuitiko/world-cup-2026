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
const mockedFindFirstMatch = prisma.match.findFirst as Mock
const mockedFindSpecialPick = prisma.specialPick.findUnique as Mock
const mockedFindLock = prisma.specialPickLock.findUnique as Mock
const mockedUpsertSpecialPick = prisma.specialPick.upsert as Mock

const futureKickoff = new Date(Date.now() + 1000 * 60 * 60 * 24)

describe('admin locks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'u1' } })
    mockedFindFirstMatch.mockResolvedValue({ kickoff: futureKickoff })
    mockedFindSpecialPick.mockResolvedValue({ champions: [], topScorers: [] })
    mockedFindLock.mockResolvedValue(null)
  })

  it('rejects champion pick after admin champion lock', async () => {
    mockedFindLock.mockResolvedValue({ championLockedAt: new Date(), topScorerLockedAt: null })
    const { saveChampionPick } = await import('@/actions/specialPicks')

    const result = await saveChampionPick('Brasil')

    expect(result).toEqual({ error: 'El campeón fue bloqueado por el admin' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('rejects scorer pick after admin scorer lock', async () => {
    mockedFindLock.mockResolvedValue({ championLockedAt: null, topScorerLockedAt: new Date() })
    const { saveScorerPick } = await import('@/actions/specialPicks')

    const result = await saveScorerPick('Haaland')

    expect(result).toEqual({ error: 'El goleador fue bloqueado por el admin' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('allows saving scorer while champion is admin-locked', async () => {
    mockedFindLock.mockResolvedValue({ championLockedAt: new Date(), topScorerLockedAt: null })
    mockedUpsertSpecialPick.mockResolvedValue({})
    const { saveScorerPick } = await import('@/actions/specialPicks')

    const result = await saveScorerPick('Haaland')

    expect(result).toBeUndefined()
    expect(mockedUpsertSpecialPick).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      update: { topScorers: ['Haaland'] },
      create: { userId: 'u1', champions: [], topScorers: ['Haaland'] },
    })
  })

  it('allows saving champion while scorer is admin-locked', async () => {
    mockedFindLock.mockResolvedValue({ championLockedAt: null, topScorerLockedAt: new Date() })
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
})
