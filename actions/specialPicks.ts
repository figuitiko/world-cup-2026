'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const picksSchema = z.object({
  champions: z.array(z.string().min(1)).length(1),
  topScorers: z.array(z.string().min(1)).length(1),
})

export async function saveSpecialPicks(champions: string[], topScorers: string[]) {
  const session = await auth()
  if (!session) return { error: 'No autenticado' }

  const parsed = picksSchema.safeParse({ champions, topScorers })
  if (!parsed.success) {
    return { error: 'Seleccioná un campeón y un goleador' }
  }

  const firstMatch = await prisma.match.findFirst({
    where: { round: 'GROUP' },
    orderBy: { kickoff: 'asc' },
  })
  if (firstMatch && firstMatch.kickoff <= new Date()) {
    return { error: 'El torneo ya comenzó, no podés cambiar tus picks' }
  }

  const [existingPick, lock] = await Promise.all([
    prisma.specialPick.findUnique({ where: { userId: session.user.id } }),
    prisma.specialPickLock.findUnique({ where: { id: 'global' } }),
  ])

  const existingChampions = existingPick?.champions.filter(Boolean) ?? []
  const existingScorers = existingPick?.topScorers.filter(Boolean) ?? []
  const championLocked = Boolean(lock?.championLockedAt)
  const topScorerLocked = Boolean(lock?.topScorerLockedAt)

  if (championLocked) {
    if (existingChampions.length === 0 || existingChampions[0] !== parsed.data.champions[0]) {
      return { error: 'El campeón fue bloqueado por el admin' }
    }
  }

  if (topScorerLocked) {
    if (existingScorers.length === 0 || existingScorers[0] !== parsed.data.topScorers[0]) {
      return { error: 'El goleador fue bloqueado por el admin' }
    }
  }

  const nextChampions = championLocked ? existingChampions : parsed.data.champions
  const nextTopScorers = topScorerLocked ? existingScorers : parsed.data.topScorers

  await prisma.specialPick.upsert({
    where: { userId: session.user.id },
    update: { champions: nextChampions, topScorers: nextTopScorers },
    create: {
      userId: session.user.id,
      champions: nextChampions,
      topScorers: nextTopScorers,
    },
  })

  revalidatePath('/picks')
}
