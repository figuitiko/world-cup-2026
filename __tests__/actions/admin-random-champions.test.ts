import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    championCandidate: { findMany: vi.fn() },
    specialPick: { upsert: vi.fn() },
    specialPickLock: { upsert: vi.fn() },
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
const mockedFindManyChampions = prisma.championCandidate.findMany as Mock
const mockedUpsertSpecialPick = prisma.specialPick.upsert as Mock
const mockedRevalidatePath = revalidatePath as Mock

describe('autoAssignMissingChampions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    mockedAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockedFindUniqueUser.mockResolvedValue({ id: 'admin1', isAdmin: true })
    mockedFindManyChampions.mockResolvedValue([
      { id: 'arg', name: 'Argentina' },
      { id: 'bra', name: 'Brasil' },
    ])
  })

  it('assigns a random champion only to users missing that selection', async () => {
    mockedFindManyUsers.mockResolvedValue([
      { id: 'u1', specialPick: null },
      { id: 'u2', specialPick: { champions: [], topScorers: ['Kylian Mbappé'] } },
      { id: 'u3', specialPick: { champions: ['Argentina'], topScorers: [] } },
    ])
    mockedUpsertSpecialPick.mockResolvedValue({})
    const { autoAssignMissingChampions } = await import('@/actions/admin')

    const result = await autoAssignMissingChampions()

    expect(result).toEqual({ count: 2 })
    expect(mockedUpsertSpecialPick).toHaveBeenCalledTimes(2)
    expect(mockedUpsertSpecialPick).toHaveBeenNthCalledWith(1, {
      where: { userId: 'u1' },
      update: { champions: ['Brasil'] },
      create: { userId: 'u1', champions: ['Brasil'], topScorers: [] },
    })
    expect(mockedUpsertSpecialPick).toHaveBeenNthCalledWith(2, {
      where: { userId: 'u2' },
      update: { champions: ['Brasil'] },
      create: { userId: 'u2', champions: ['Brasil'], topScorers: ['Kylian Mbappé'] },
    })
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/admin/user-picks')
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/leaderboard')
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/picks')
  })

  it('rejects non-admin users', async () => {
    mockedFindUniqueUser.mockResolvedValue({ id: 'u1', isAdmin: false })
    const { autoAssignMissingChampions } = await import('@/actions/admin')

    const result = await autoAssignMissingChampions()

    expect(result).toEqual({ error: 'Sin permisos' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })
})
