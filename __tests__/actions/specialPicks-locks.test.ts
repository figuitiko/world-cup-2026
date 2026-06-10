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

describe('saveSpecialPicks locks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'u1' } })
    mockedFindFirstMatch.mockResolvedValue({ kickoff: futureKickoff })
    mockedFindSpecialPick.mockResolvedValue({ champions: ['Argentina'], topScorers: [] })
    mockedFindLock.mockResolvedValue(null)
  })

  it('rejects changing champion after admin champion lock', async () => {
    mockedFindLock.mockResolvedValue({ championLockedAt: new Date(), topScorerLockedAt: null })
    const { saveSpecialPicks } = await import('@/actions/specialPicks')

    const result = await saveSpecialPicks(['Brasil'], ['Mbappé'])

    expect(result).toEqual({ error: 'El campeón fue bloqueado por el admin' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('rejects changing top scorer after admin top scorer lock', async () => {
    mockedFindLock.mockResolvedValue({ championLockedAt: null, topScorerLockedAt: new Date() })
    mockedFindSpecialPick.mockResolvedValue({ champions: [], topScorers: ['Mbappé'] })
    const { saveSpecialPicks } = await import('@/actions/specialPicks')

    const result = await saveSpecialPicks(['Argentina'], ['Haaland'])

    expect(result).toEqual({ error: 'El goleador fue bloqueado por el admin' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('allows changing unlocked scorer while preserving locked champion', async () => {
    mockedFindLock.mockResolvedValue({ championLockedAt: new Date(), topScorerLockedAt: null })
    mockedUpsertSpecialPick.mockResolvedValue({})
    const { saveSpecialPicks } = await import('@/actions/specialPicks')

    const result = await saveSpecialPicks(['Argentina'], ['Haaland'])

    expect(result).toBeUndefined()
    expect(mockedUpsertSpecialPick).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      update: { champions: ['Argentina'], topScorers: ['Haaland'] },
      create: { userId: 'u1', champions: ['Argentina'], topScorers: ['Haaland'] },
    })
  })
})
