import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

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
import { revalidatePath } from 'next/cache'

const mockedAuth = auth as Mock
const mockedFindMatch = prisma.match.findUnique as Mock
const mockedUpsertPrediction = prisma.prediction.upsert as Mock

const futureKickoff = new Date(Date.now() + 1000 * 60 * 60 * 24)
const pastKickoff = new Date(Date.now() - 1000 * 60 * 60)

describe('createOrUpdatePrediction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'user1' } })
  })

  it('saves prediction when match is not yet started', async () => {
    mockedFindMatch.mockResolvedValue({ id: 'm1', kickoff: futureKickoff })
    mockedUpsertPrediction.mockResolvedValue({})
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'HOME')
    expect(result).toBeUndefined()
    expect(prisma.prediction.upsert).toHaveBeenCalled()
  })

  it('revalidates only the matches list after inline pick save', async () => {
    mockedFindMatch.mockResolvedValue({ id: 'm1', kickoff: futureKickoff })
    mockedUpsertPrediction.mockResolvedValue({})
    const { createOrUpdatePrediction } = await import('@/actions/predictions')

    await createOrUpdatePrediction('m1', 'HOME')

    expect(revalidatePath).toHaveBeenCalledWith('/matches')
    expect(revalidatePath).not.toHaveBeenCalledWith('/matches/m1')
  })

  it('rejects prediction when match already started', async () => {
    mockedFindMatch.mockResolvedValue({ id: 'm1', kickoff: pastKickoff })
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'HOME')
    expect(result).toEqual({ error: 'Este partido ya comenzó' })
    expect(prisma.prediction.upsert).not.toHaveBeenCalled()
  })

  it('rejects when not authenticated', async () => {
    mockedAuth.mockResolvedValue(null)
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'HOME')
    expect(result).toEqual({ error: 'No autenticado' })
  })

  it('rejects invalid pick value', async () => {
    mockedFindMatch.mockResolvedValue({ id: 'm1', kickoff: futureKickoff })
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'INVALID')
    expect(result).toEqual({ error: 'Pronóstico inválido' })
  })
})
