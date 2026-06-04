import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    match: { findUnique: vi.fn() },
    prediction: { upsert: vi.fn() },
  },
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

const futureKickoff = new Date(Date.now() + 1000 * 60 * 60 * 24)
const pastKickoff = new Date(Date.now() - 1000 * 60 * 60)

describe('createOrUpdatePrediction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as any).mockResolvedValue({ user: { id: 'user1' } })
  })

  it('saves prediction when match is not yet started', async () => {
    ;(prisma.match.findUnique as any).mockResolvedValue({ id: 'm1', kickoff: futureKickoff })
    ;(prisma.prediction.upsert as any).mockResolvedValue({})
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'HOME')
    expect(result).toBeUndefined()
    expect(prisma.prediction.upsert).toHaveBeenCalled()
  })

  it('rejects prediction when match already started', async () => {
    ;(prisma.match.findUnique as any).mockResolvedValue({ id: 'm1', kickoff: pastKickoff })
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'HOME')
    expect(result).toEqual({ error: 'Este partido ya comenzó' })
    expect(prisma.prediction.upsert).not.toHaveBeenCalled()
  })

  it('rejects when not authenticated', async () => {
    ;(auth as any).mockResolvedValue(null)
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'HOME')
    expect(result).toEqual({ error: 'No autenticado' })
  })

  it('rejects invalid pick value', async () => {
    ;(prisma.match.findUnique as any).mockResolvedValue({ id: 'm1', kickoff: futureKickoff })
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'INVALID')
    expect(result).toEqual({ error: 'Pronóstico inválido' })
  })
})
