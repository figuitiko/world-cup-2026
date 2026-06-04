import { describe, it, expect, vi, beforeEach } from 'vitest'

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

const futureKickoff = new Date(Date.now() + 1000 * 60 * 60 * 24)
const pastKickoff = new Date(Date.now() - 1000)

describe('saveSpecialPicks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as any).mockResolvedValue({ user: { id: 'u1' } })
    ;(prisma.match.findFirst as any).mockResolvedValue({ kickoff: futureKickoff })
  })

  it('saves when exactly 3 champions and 3 scorers', async () => {
    ;(prisma.specialPick.upsert as any).mockResolvedValue({})
    const { saveSpecialPicks } = await import('@/actions/specialPicks')
    const result = await saveSpecialPicks(
      ['Brasil', 'Argentina', 'Francia'],
      ['Mbappé', 'Vinicius', 'Salah']
    )
    expect(result).toBeUndefined()
    expect(prisma.specialPick.upsert).toHaveBeenCalled()
  })

  it('rejects when not exactly 3 champions', async () => {
    const { saveSpecialPicks } = await import('@/actions/specialPicks')
    const result = await saveSpecialPicks(['Brasil', 'Argentina'], ['Mbappé', 'Vinicius', 'Salah'])
    expect(result).toEqual({ error: 'Seleccioná exactamente 3 campeones y 3 goleadores' })
  })

  it('rejects when tournament already started', async () => {
    ;(prisma.match.findFirst as any).mockResolvedValue({ kickoff: pastKickoff })
    const { saveSpecialPicks } = await import('@/actions/specialPicks')
    const result = await saveSpecialPicks(
      ['Brasil', 'Argentina', 'Francia'],
      ['Mbappé', 'Vinicius', 'Salah']
    )
    expect(result).toEqual({ error: 'El torneo ya comenzó, no podés cambiar tus picks' })
  })
})
