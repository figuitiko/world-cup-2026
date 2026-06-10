import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    topScorerCandidate: { findMany: vi.fn() },
    specialPick: { upsert: vi.fn() },
  },
}))

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('bcryptjs', () => ({ hash: vi.fn() }))

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const mockedAuth = auth as Mock
const mockedFindUniqueUser = prisma.user.findUnique as Mock
const mockedFindManyUsers = prisma.user.findMany as Mock
const mockedFindManyScorers = prisma.topScorerCandidate.findMany as Mock
const mockedUpsertSpecialPick = prisma.specialPick.upsert as Mock
const mockedRevalidatePath = revalidatePath as Mock

describe('autoAssignMissingTopScorers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    mockedAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockedFindUniqueUser.mockResolvedValue({ id: 'admin1', isAdmin: true })
    mockedFindManyScorers.mockResolvedValue([
      { id: 'mbappe', name: 'Kylian Mbappé', country: 'Francia' },
      { id: 'haaland', name: 'Erling Haaland', country: 'Noruega' },
    ])
  })

  it('assigns a random top scorer only to users missing that selection', async () => {
    mockedFindManyUsers.mockResolvedValue([
      { id: 'u1', specialPick: null },
      { id: 'u2', specialPick: { champions: ['Argentina'], topScorers: [] } },
      { id: 'u3', specialPick: { champions: ['Brasil'], topScorers: ['Kylian Mbappé'] } },
    ])
    mockedUpsertSpecialPick.mockResolvedValue({})
    const { autoAssignMissingTopScorers } = await import('@/actions/admin')

    const result = await autoAssignMissingTopScorers()

    expect(result).toEqual({ count: 2 })
    expect(mockedUpsertSpecialPick).toHaveBeenCalledTimes(2)
    expect(mockedUpsertSpecialPick).toHaveBeenNthCalledWith(1, {
      where: { userId: 'u1' },
      update: { topScorers: ['Erling Haaland'] },
      create: { userId: 'u1', champions: [], topScorers: ['Erling Haaland'] },
    })
    expect(mockedUpsertSpecialPick).toHaveBeenNthCalledWith(2, {
      where: { userId: 'u2' },
      update: { topScorers: ['Erling Haaland'] },
      create: { userId: 'u2', champions: ['Argentina'], topScorers: ['Erling Haaland'] },
    })
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/admin/user-picks')
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/leaderboard')
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/picks')
  })

  it('rejects non-admin users', async () => {
    mockedFindUniqueUser.mockResolvedValue({ id: 'u1', isAdmin: false })
    const { autoAssignMissingTopScorers } = await import('@/actions/admin')

    const result = await autoAssignMissingTopScorers()

    expect(result).toEqual({ error: 'Sin permisos' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })
})
