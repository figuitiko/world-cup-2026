'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

async function isTopScorerDeadlineLocked() {
  const firstGroupMatch = await prisma.match.findFirst({
    where: { round: 'GROUP' },
    orderBy: { kickoff: 'asc' },
  })
  return Boolean(firstGroupMatch && firstGroupMatch.kickoff <= new Date())
}

async function isChampionDeadlineLocked() {
  const lastGroupMatch = await prisma.match.findFirst({
    where: { round: 'GROUP' },
    orderBy: { kickoff: 'desc' },
  })
  return Boolean(lastGroupMatch && lastGroupMatch.kickoff <= new Date())
}

export async function saveChampionPick(champion: string) {
  const session = await auth()
  if (!session) return { error: 'No autenticado' }

  const parsed = z.string().min(1).safeParse(champion)
  if (!parsed.success) return { error: 'Seleccioná un campeón' }

  if (await isChampionDeadlineLocked()) {
    return { error: 'La fase de grupos ya terminó, no podés cambiar tu campeón' }
  }

  const [existingPick, lock] = await Promise.all([
    prisma.specialPick.findUnique({ where: { userId: session.user.id } }),
    prisma.specialPickLock.findUnique({ where: { id: 'global' } }),
  ])

  if ((existingPick?.champions.filter(Boolean).length ?? 0) === 1) {
    return { error: 'Tu pick de campeón ya quedó bloqueado' }
  }

  if (lock?.championLockedAt) {
    return { error: 'El campeón fue bloqueado por el admin' }
  }

  await prisma.specialPick.upsert({
    where: { userId: session.user.id },
    update: { champions: [parsed.data] },
    create: { userId: session.user.id, champions: [parsed.data], topScorers: [] },
  })

  revalidatePath('/picks')
}

export async function saveScorerPick(scorer: string) {
  const session = await auth()
  if (!session) return { error: 'No autenticado' }

  const parsed = z.string().min(1).safeParse(scorer)
  if (!parsed.success) return { error: 'Seleccioná un goleador' }

  if (await isTopScorerDeadlineLocked()) {
    return { error: 'El torneo ya comenzó, no podés cambiar tu goleador' }
  }

  const [existingPick, lock] = await Promise.all([
    prisma.specialPick.findUnique({ where: { userId: session.user.id } }),
    prisma.specialPickLock.findUnique({ where: { id: 'global' } }),
  ])

  if ((existingPick?.topScorers.filter(Boolean).length ?? 0) === 1) {
    return { error: 'Tu pick de goleador ya quedó bloqueado' }
  }

  if (lock?.topScorerLockedAt) {
    return { error: 'El goleador fue bloqueado por el admin' }
  }

  await prisma.specialPick.upsert({
    where: { userId: session.user.id },
    update: { topScorers: [parsed.data] },
    create: { userId: session.user.id, champions: [], topScorers: [parsed.data] },
  })

  revalidatePath('/picks')
}
