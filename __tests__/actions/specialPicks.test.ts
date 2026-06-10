import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    match: { findFirst: vi.fn() },
    specialPick: { upsert: vi.fn() },
  },
}))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

const mockedAuth = auth as Mock
const mockedFindFirstMatch = prisma.match.findFirst as Mock
const mockedUpsertSpecialPick = prisma.specialPick.upsert as Mock

const futureKickoff = new Date(Date.now() + 1000 * 60 * 60 * 24)
const pastKickoff = new Date(Date.now() - 1000)

describe('saveSpecialPicks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'u1' } })
    mockedFindFirstMatch.mockResolvedValue({ kickoff: futureKickoff })
  })

  it('saves when exactly one champion and one scorer are selected', async () => {
    mockedUpsertSpecialPick.mockResolvedValue({})
    const { saveSpecialPicks } = await import('@/actions/specialPicks')

    const result = await saveSpecialPicks(['Argentina'], ['Kylian Mbappé'])

    expect(result).toBeUndefined()
    expect(mockedUpsertSpecialPick).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      update: { champions: ['Argentina'], topScorers: ['Kylian Mbappé'] },
      create: {
        userId: 'u1',
        champions: ['Argentina'],
        topScorers: ['Kylian Mbappé'],
      },
    })
  })

  it('rejects when champion or scorer is missing', async () => {
    const { saveSpecialPicks } = await import('@/actions/specialPicks')

    const result = await saveSpecialPicks(['Argentina'], [])

    expect(result).toEqual({ error: 'Seleccioná un campeón y un goleador' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })

  it('rejects when tournament already started', async () => {
    mockedFindFirstMatch.mockResolvedValue({ kickoff: pastKickoff })
    const { saveSpecialPicks } = await import('@/actions/specialPicks')

    const result = await saveSpecialPicks(['Argentina'], ['Kylian Mbappé'])

    expect(result).toEqual({ error: 'El torneo ya comenzó, no podés cambiar tus picks' })
    expect(mockedUpsertSpecialPick).not.toHaveBeenCalled()
  })
})
