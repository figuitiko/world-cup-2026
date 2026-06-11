'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const resultSchema = z.enum(['HOME', 'DRAW', 'AWAY'])

const matchInputSchema = z.object({
  matchNumber: z.coerce.number().int().positive(),
  group: z.string().optional(),
  round: z.string().min(1, 'Fase requerida'),
  homeTeam: z.string().min(1, 'Local requerido'),
  awayTeam: z.string().min(1, 'Visitante requerido'),
  kickoff: z.string().min(1, 'Fecha requerida'),
  venue: z.string().min(1, 'Estadio requerido'),
})

const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido'),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(8, 'La contraseña necesita al menos 8 caracteres'),
  isAdmin: z.boolean(),
})

const updateUserSchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido'),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().optional(),
  isAdmin: z.boolean(),
})

async function assertAdmin() {
  const session = await auth()
  if (!session) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.isAdmin ? user : null
}

export async function createUser(data: unknown) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = createUserSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const password = await hash(parsed.data.password, 12)

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password,
        isAdmin: parsed.data.isAdmin,
      },
    })
  } catch {
    return { error: 'Este email ya está registrado' }
  }

  revalidatePath('/admin/users')
  revalidatePath('/leaderboard')
}

export async function updateUser(id: string, data: unknown) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = updateUserSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  if (admin.id === id && !parsed.data.isAdmin) {
    return { error: 'No podés quitarte tus propios permisos de admin' }
  }

  const updateData: {
    name: string
    email: string
    isAdmin: boolean
    password?: string
  } = {
    name: parsed.data.name,
    email: parsed.data.email,
    isAdmin: parsed.data.isAdmin,
  }

  const newPassword = parsed.data.password?.trim()
  if (newPassword) {
    if (newPassword.length < 8) {
      return { error: 'La contraseña necesita al menos 8 caracteres' }
    }
    updateData.password = await hash(newPassword, 12)
  }

  try {
    await prisma.user.update({
      where: { id },
      data: updateData,
    })
  } catch {
    return { error: 'No pudimos actualizar el usuario' }
  }

  revalidatePath('/admin/users')
  revalidatePath('/leaderboard')
}

export async function deleteUser(id: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  if (admin.id === id) {
    return { error: 'No podés eliminar tu propio usuario' }
  }

  try {
    await prisma.user.delete({ where: { id } })
  } catch {
    return { error: 'No pudimos eliminar el usuario' }
  }

  revalidatePath('/admin/users')
  revalidatePath('/leaderboard')
}

export async function enterMatchResult(matchId: string, result: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = resultSchema.safeParse(result)
  if (!parsed.success) return { error: 'Resultado inválido' }

  await prisma.match.update({
    where: { id: matchId },
    data: { result: parsed.data },
  })

  revalidatePath('/admin/results')
  revalidatePath('/matches')
  revalidatePath('/leaderboard')
}

export async function setTournamentResult(champion: string, topScorer: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  if (!champion.trim() || !topScorer.trim()) {
    return { error: 'Completá campeón y goleador' }
  }

  await prisma.tournamentResult.updateMany({
    data: { champion: champion.trim(), topScorer: topScorer.trim() },
  })

  revalidatePath('/admin/tournament')
  revalidatePath('/leaderboard')
}

export async function createMatch(data: unknown) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = matchInputSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { matchNumber, group, round, homeTeam, awayTeam, kickoff, venue } = parsed.data

  try {
    await prisma.match.create({
      data: { matchNumber, group: group || null, round, homeTeam, awayTeam, kickoff: new Date(kickoff), venue },
    })
  } catch {
    return { error: 'El número de partido ya existe' }
  }

  revalidatePath('/admin/games')
  revalidatePath('/matches')
}

export async function updateMatch(id: string, data: unknown) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = matchInputSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { matchNumber, group, round, homeTeam, awayTeam, kickoff, venue } = parsed.data

  try {
    await prisma.match.update({
      where: { id },
      data: { matchNumber, group: group || null, round, homeTeam, awayTeam, kickoff: new Date(kickoff), venue },
    })
  } catch {
    return { error: 'El número de partido ya existe' }
  }

  revalidatePath('/admin/games')
  revalidatePath('/matches')
}

export async function addChampionCandidate(name: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }
  if (!name.trim()) return { error: 'Nombre requerido' }
  try {
    await prisma.championCandidate.create({ data: { name: name.trim() } })
  } catch {
    return { error: 'Ya existe esa selección' }
  }
  revalidatePath('/admin/candidates')
  revalidatePath('/picks')
}

export async function deleteChampionCandidate(id: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }
  await prisma.championCandidate.delete({ where: { id } })
  revalidatePath('/admin/candidates')
  revalidatePath('/picks')
}

export async function addTopScorerCandidate(name: string, country: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }
  if (!name.trim() || !country.trim()) return { error: 'Nombre y país requeridos' }
  try {
    await prisma.topScorerCandidate.create({ data: { name: name.trim(), country: country.trim() } })
  } catch {
    return { error: 'Ya existe ese jugador' }
  }
  revalidatePath('/admin/candidates')
  revalidatePath('/picks')
}

export async function deleteTopScorerCandidate(id: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }
  await prisma.topScorerCandidate.delete({ where: { id } })
  revalidatePath('/admin/candidates')
  revalidatePath('/picks')
}

export async function lockMatch(id: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  await prisma.match.update({ where: { id }, data: { locked: true } })

  revalidatePath('/admin/results')
  revalidatePath('/admin/user-picks')
  revalidatePath('/matches')
}

export async function setPickForUser(userId: string, matchId: string, pick: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = resultSchema.safeParse(pick)
  if (!parsed.success) return { error: 'Pick inválido' }

  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (match?.locked) return { error: 'Este partido está bloqueado' }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    update: { pick: parsed.data },
    create: { userId, matchId, pick: parsed.data },
  })

  revalidatePath('/admin/user-picks')
  revalidatePath('/leaderboard')
}

export async function autoAssignMissingPicks() {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const cutoff = new Date(Date.now() + 5 * 60 * 1000)

  const [matches, users] = await Promise.all([
    prisma.match.findMany({
      where: { kickoff: { lte: cutoff }, homeTeam: { not: 'POR DEFINIR' } },
    }),
    prisma.user.findMany({
      where: { isAdmin: false },
      include: { predictions: { select: { matchId: true } } },
    }),
  ])

  const options = ['HOME', 'DRAW', 'AWAY'] as const
  let count = 0

  for (const user of users) {
    const picked = new Set(user.predictions.map(p => p.matchId))
    for (const match of matches) {
      if (!picked.has(match.id)) {
        const pick = options[Math.floor(Math.random() * 3)]
        await prisma.prediction.create({ data: { userId: user.id, matchId: match.id, pick } })
        count++
      }
    }
  }

  if (matches.length > 0) {
    await prisma.match.updateMany({
      where: { id: { in: matches.map(m => m.id) } },
      data: { locked: true },
    })
  }

  revalidatePath('/matches')
  revalidatePath('/admin/results')
  revalidatePath('/admin/user-picks')
  revalidatePath('/leaderboard')
  return { count }
}

export async function autoAssignMissingTopScorers() {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const [candidates, users] = await Promise.all([
    prisma.topScorerCandidate.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      include: { specialPick: true },
    }),
  ])

  if (candidates.length === 0) {
    return { error: 'No hay goleadores candidatos cargados' }
  }

  const lockedAt = new Date()
  let count = 0

  for (const user of users) {
    const currentScorers = user.specialPick?.topScorers.filter(Boolean) ?? []
    if (currentScorers.length > 0) continue

    const randomIndex = Math.floor(Math.random() * candidates.length)
    const scorer = candidates[randomIndex].name
    const champions = user.specialPick?.champions.filter(Boolean) ?? []

    await prisma.specialPick.upsert({
      where: { userId: user.id },
      update: { topScorers: [scorer] },
      create: { userId: user.id, champions, topScorers: [scorer] },
    })
    count++
  }

  await prisma.specialPickLock.upsert({
    where: { id: 'global' },
    update: { topScorerLockedAt: lockedAt },
    create: { id: 'global', topScorerLockedAt: lockedAt },
  })

  revalidatePath('/admin/user-picks')
  revalidatePath('/leaderboard')
  revalidatePath('/picks')
  return { count }
}

export async function autoAssignMissingChampions() {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const [candidates, users] = await Promise.all([
    prisma.championCandidate.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      include: { specialPick: true },
    }),
  ])

  if (candidates.length === 0) {
    return { error: 'No hay selecciones candidatas cargadas' }
  }

  const lockedAt = new Date()
  let count = 0

  for (const user of users) {
    const currentChampions = user.specialPick?.champions.filter(Boolean) ?? []
    if (currentChampions.length > 0) continue

    const randomIndex = Math.floor(Math.random() * candidates.length)
    const champion = candidates[randomIndex].name
    const topScorers = user.specialPick?.topScorers.filter(Boolean) ?? []

    await prisma.specialPick.upsert({
      where: { userId: user.id },
      update: { champions: [champion] },
      create: { userId: user.id, champions: [champion], topScorers },
    })
    count++
  }

  await prisma.specialPickLock.upsert({
    where: { id: 'global' },
    update: { championLockedAt: lockedAt },
    create: { id: 'global', championLockedAt: lockedAt },
  })

  revalidatePath('/admin/user-picks')
  revalidatePath('/leaderboard')
  revalidatePath('/picks')
  return { count }
}

export async function setSpecialPickForUser(
  userId: string,
  type: 'champion' | 'scorer',
  value: string,
) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }
  if (!value.trim()) return { error: 'Valor requerido' }

  if (type === 'champion') {
    await prisma.specialPick.upsert({
      where: { userId },
      update: { champions: [value.trim()] },
      create: { userId, champions: [value.trim()], topScorers: [] },
    })
  } else {
    await prisma.specialPick.upsert({
      where: { userId },
      update: { topScorers: [value.trim()] },
      create: { userId, champions: [], topScorers: [value.trim()] },
    })
  }

  revalidatePath('/admin/user-picks')
  revalidatePath('/leaderboard')
  revalidatePath('/picks')
}

export async function clearSpecialPickForUser(userId: string, type: 'champion' | 'scorer') {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  if (type === 'champion') {
    await prisma.specialPick.upsert({
      where: { userId },
      update: { champions: [] },
      create: { userId, champions: [], topScorers: [] },
    })
  } else {
    await prisma.specialPick.upsert({
      where: { userId },
      update: { topScorers: [] },
      create: { userId, champions: [], topScorers: [] },
    })
  }

  revalidatePath('/admin/user-picks')
  revalidatePath('/leaderboard')
  revalidatePath('/picks')
}

export async function deleteMatch(id: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  try {
    await prisma.match.delete({ where: { id } })
  } catch {
    return { error: 'No se puede eliminar (puede tener predicciones asociadas)' }
  }

  revalidatePath('/admin/games')
  revalidatePath('/matches')
}
