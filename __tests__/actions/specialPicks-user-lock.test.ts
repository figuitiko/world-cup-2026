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

describe('user pick locks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'u1' } })
    mockedFindFirstMatch.mockResolvedValue({ kickoff: futureKickoff })
    mockedFindLock.mockResolvedValue(null)
  })

  it('rejects changing champion after user already saved it', async () => {
    mockedFindSpecialPick.mockResolvedValue({ champions: ['Argentina'], topScorers: [] })
    const { saveChampionPick } = await import('@/actions/specialPicks')

    const result = await saveChampionPick('España')

    expect(result).toEqual({ error: 'Tu pick de campeón ya quedó bloqueado' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('rejects changing scorer after user already saved it', async () => {
    mockedFindSpecialPick.mockResolvedValue({ champions: [], topScorers: ['Kylian Mbappé'] })
    const { saveScorerPick } = await import('@/actions/specialPicks')

    const result = await saveScorerPick('Erling Haaland')

    expect(result).toEqual({ error: 'Tu pick de goleador ya quedó bloqueado' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('allows saving scorer when only champion is already saved', async () => {
    mockedFindSpecialPick.mockResolvedValue({ champions: ['Argentina'], topScorers: [] })
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

  it('allows saving champion when only scorer is already saved', async () => {
    mockedFindSpecialPick.mockResolvedValue({ champions: [], topScorers: ['Kylian Mbappé'] })
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
