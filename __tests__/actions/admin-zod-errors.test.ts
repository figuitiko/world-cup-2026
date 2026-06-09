import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    match: { create: vi.fn(), update: vi.fn() },
    tournamentResult: { updateMany: vi.fn() },
    championCandidate: { create: vi.fn(), delete: vi.fn() },
    topScorerCandidate: { create: vi.fn(), delete: vi.fn() },
  },
}))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

const mockedAuth = auth as Mock
const mockedFindUser = prisma.user.findUnique as Mock

describe('admin match validation errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockedFindUser.mockResolvedValue({ isAdmin: true })
  })

  it('returns the first Zod issue message when creating an invalid match', async () => {
    const { createMatch } = await import('@/actions/admin')

    const result = await createMatch({})

    expect(result).toEqual({ error: expect.any(String) })
    expect(result?.error).not.toBe('Cannot read properties of undefined')
  })

  it('returns the first Zod issue message when updating an invalid match', async () => {
    const { updateMatch } = await import('@/actions/admin')

    const result = await updateMatch('match1', {})

    expect(result).toEqual({ error: expect.any(String) })
    expect(result?.error).not.toBe('Cannot read properties of undefined')
  })
})
