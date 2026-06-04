import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    match: { update: vi.fn() },
    tournamentResult: { updateMany: vi.fn() },
  },
}))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

describe('enterMatchResult', () => {
  beforeEach(() => vi.clearAllMocks())

  it('saves result when user is admin', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: 'admin1' } })
    ;(prisma.user.findUnique as any).mockResolvedValue({ isAdmin: true })
    ;(prisma.match.update as any).mockResolvedValue({})
    const { enterMatchResult } = await import('@/actions/admin')
    const result = await enterMatchResult('m1', 'HOME')
    expect(result).toBeUndefined()
    expect(prisma.match.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { result: 'HOME' },
    })
  })

  it('rejects non-admin user', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: 'user1' } })
    ;(prisma.user.findUnique as any).mockResolvedValue({ isAdmin: false })
    const { enterMatchResult } = await import('@/actions/admin')
    const result = await enterMatchResult('m1', 'HOME')
    expect(result).toEqual({ error: 'Sin permisos' })
    expect(prisma.match.update).not.toHaveBeenCalled()
  })
})
