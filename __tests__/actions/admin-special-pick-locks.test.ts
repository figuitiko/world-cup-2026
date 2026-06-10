import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: vi.fn(), findMany: vi.fn() },
    championCandidate: { findMany: vi.fn() },
    topScorerCandidate: { findMany: vi.fn() },
    specialPick: { upsert: vi.fn() },
    specialPickLock: { upsert: vi.fn() },
  },
}))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('bcryptjs', () => ({ hash: vi.fn() }))

import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const mockedAuth = auth as Mock
const mockedFindUniqueUser = prisma.user.findUnique as Mock
const mockedFindManyUsers = prisma.user.findMany as Mock
const mockedFindChampions = prisma.championCandidate.findMany as Mock
const mockedFindScorers = prisma.topScorerCandidate.findMany as Mock
const mockedLockUpsert = prisma.specialPickLock.upsert as Mock

describe('admin special pick locks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockedFindUniqueUser.mockResolvedValue({ id: 'admin1', isAdmin: true })
    mockedFindManyUsers.mockResolvedValue([])
  })

  it('locks champion picks after admin champion assignment is clicked', async () => {
    mockedFindChampions.mockResolvedValue([{ id: 'arg', name: 'Argentina' }])
    const { autoAssignMissingChampions } = await import('@/actions/admin')

    await autoAssignMissingChampions()

    expect(mockedLockUpsert).toHaveBeenCalledWith({
      where: { id: 'global' },
      update: { championLockedAt: expect.any(Date) },
      create: { id: 'global', championLockedAt: expect.any(Date) },
    })
  })

  it('locks top scorer picks after admin top scorer assignment is clicked', async () => {
    mockedFindScorers.mockResolvedValue([{ id: 'mbappe', name: 'Mbappé', country: 'Francia' }])
    const { autoAssignMissingTopScorers } = await import('@/actions/admin')

    await autoAssignMissingTopScorers()

    expect(mockedLockUpsert).toHaveBeenCalledWith({
      where: { id: 'global' },
      update: { topScorerLockedAt: expect.any(Date) },
      create: { id: 'global', topScorerLockedAt: expect.any(Date) },
    })
  })
})
