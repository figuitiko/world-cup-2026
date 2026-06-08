import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    league: { findFirst: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}))

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed'),
}))

import { prisma } from '@/lib/db'

describe('register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error when email already registered', async () => {
    ;(prisma.league.findFirst as any).mockResolvedValue({ id: 'league1' })
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' })
    const { register } = await import('@/actions/auth')
    const fd = new FormData()
    fd.set('name', 'Frank')
    fd.set('email', 'f@f.com')
    fd.set('password', 'password123')
    const result = await register(fd)
    expect(result).toEqual({ error: 'Este email ya está registrado' })
  })

  it('returns error for invalid data', async () => {
    const { register } = await import('@/actions/auth')
    const fd = new FormData()
    fd.set('name', 'F')
    fd.set('email', 'notanemail')
    fd.set('password', 'short')
    const result = await register(fd)
    expect(result).toEqual({ error: 'Datos inválidos' })
  })

  it('creates user joined to Mundial 2026 league', async () => {
    ;(prisma.league.findFirst as any).mockResolvedValue({ id: 'league1' })
    ;(prisma.user.findUnique as any).mockResolvedValue(null)
    ;(prisma.user.create as any).mockResolvedValue({ id: 'user1' })
    const { register } = await import('@/actions/auth')
    const fd = new FormData()
    fd.set('name', 'Frank')
    fd.set('email', 'f@f.com')
    fd.set('password', 'password123')
    await register(fd)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ leagueId: 'league1' }),
    })
  })
})
