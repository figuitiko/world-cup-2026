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

describe('saveSpecialPicks user lock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'u1' } })
    mockedFindFirstMatch.mockResolvedValue({ kickoff: futureKickoff })
    mockedFindLock.mockResolvedValue(null)
  })

  it('rejects changing special picks after the user already saved both picks', async () => {
    mockedFindSpecialPick.mockResolvedValue({ champions: ['Argentina'], topScorers: ['Kylian Mbappé'] })
    const { saveSpecialPicks } = await import('@/actions/specialPicks')

    const result = await saveSpecialPicks(['España'], ['Erling Haaland'])

    expect(result).toEqual({ error: 'Tus picks especiales ya quedaron bloqueados' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })
})
