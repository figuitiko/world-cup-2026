'use server'

import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { signIn, signOut } from '@/auth'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  inviteCode: z.string().min(1),
})

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    inviteCode: formData.get('inviteCode'),
  })
  if (!parsed.success) return { error: 'Datos inválidos' }

  const league = await prisma.league.findUnique({
    where: { inviteCode: parsed.data.inviteCode },
  })
  if (!league) return { error: 'Código de invitación inválido' }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (existing) return { error: 'Este email ya está registrado' }

  const hashed = await hash(parsed.data.password, 12)
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      leagueId: league.id,
    },
  })

  await signIn('credentials', {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: '/matches',
  })
}

export async function logout() {
  await signOut({ redirectTo: '/login' })
}
