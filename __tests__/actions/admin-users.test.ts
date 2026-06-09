import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('bcryptjs', () => ({ hash: vi.fn().mockResolvedValue('hashed-password') }))

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'

const mockedAuth = auth as Mock
const mockedFindUser = prisma.user.findUnique as Mock
const mockedCreateUser = prisma.user.create as Mock
const mockedUpdateUser = prisma.user.update as Mock
const mockedDeleteUser = prisma.user.delete as Mock
const mockedHash = hash as Mock

describe('admin user CRUD actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockedFindUser.mockResolvedValue({ id: 'admin1', isAdmin: true })
  })

  it('creates a user with a hashed password when requester is admin', async () => {
    mockedCreateUser.mockResolvedValue({ id: 'user1' })
    const { createUser } = await import('@/actions/admin')

    const result = await createUser({
      name: ' Frank ',
      email: 'FRANK@example.com ',
      password: 'password123',
      isAdmin: false,
    })

    expect(result).toBeUndefined()
    expect(mockedHash).toHaveBeenCalledWith('password123', 12)
    expect(mockedCreateUser).toHaveBeenCalledWith({
      data: {
        name: 'Frank',
        email: 'frank@example.com',
        password: 'hashed-password',
        isAdmin: false,
      },
    })
  })

  it('updates user details without changing password when password is blank', async () => {
    mockedUpdateUser.mockResolvedValue({ id: 'user1' })
    const { updateUser } = await import('@/actions/admin')

    const result = await updateUser('user1', {
      name: 'User One',
      email: 'user@example.com',
      password: '',
      isAdmin: true,
    })

    expect(result).toBeUndefined()
    expect(mockedHash).not.toHaveBeenCalled()
    expect(mockedUpdateUser).toHaveBeenCalledWith({
      where: { id: 'user1' },
      data: {
        name: 'User One',
        email: 'user@example.com',
        isAdmin: true,
      },
    })
  })

  it('prevents an admin from deleting their own user', async () => {
    const { deleteUser } = await import('@/actions/admin')

    const result = await deleteUser('admin1')

    expect(result).toEqual({ error: 'No podés eliminar tu propio usuario' })
    expect(mockedDeleteUser).not.toHaveBeenCalled()
  })

  it('prevents an admin from removing their own admin role', async () => {
    const { updateUser } = await import('@/actions/admin')

    const result = await updateUser('admin1', {
      name: 'Admin',
      email: 'admin@example.com',
      password: '',
      isAdmin: false,
    })

    expect(result).toEqual({ error: 'No podés quitarte tus propios permisos de admin' })
    expect(mockedUpdateUser).not.toHaveBeenCalled()
  })

  it('rejects user CRUD when requester is not admin', async () => {
    mockedFindUser.mockResolvedValue({ id: 'user1', isAdmin: false })
    const { createUser } = await import('@/actions/admin')

    const result = await createUser({
      name: 'Frank',
      email: 'frank@example.com',
      password: 'password123',
      isAdmin: false,
    })

    expect(result).toEqual({ error: 'Sin permisos' })
    expect(mockedCreateUser).not.toHaveBeenCalled()
  })
})
