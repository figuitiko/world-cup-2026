import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    league: { findUnique: vi.fn() },
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

  it('returns error when invite code is invalid', async () => {
    ;(prisma.league.findUnique as any).mockResolvedValue(null)
    const { register } = await import('@/actions/auth')
    const fd = new FormData()
    fd.set('name', 'Frank')
    fd.set('email', 'f@f.com')
    fd.set('password', 'password123')
    fd.set('inviteCode', 'bad')
    const result = await register(fd)
    expect(result).toEqual({ error: 'Código de invitación inválido' })
  })

  it('returns error when email already registered', async () => {
    ;(prisma.league.findUnique as any).mockResolvedValue({ id: 'league1' })
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' })
    const { register } = await import('@/actions/auth')
    const fd = new FormData()
    fd.set('name', 'Frank')
    fd.set('email', 'f@f.com')
    fd.set('password', 'password123')
    fd.set('inviteCode', 'valid')
    const result = await register(fd)
    expect(result).toEqual({ error: 'Este email ya está registrado' })
  })

  it('returns error for invalid data', async () => {
    const { register } = await import('@/actions/auth')
    const fd = new FormData()
    fd.set('name', 'F')
    fd.set('email', 'notanemail')
    fd.set('password', 'short')
    fd.set('inviteCode', '')
    const result = await register(fd)
    expect(result).toEqual({ error: 'Datos inválidos' })
  })
})
