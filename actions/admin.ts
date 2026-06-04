'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const resultSchema = z.enum(['HOME', 'DRAW', 'AWAY'])

async function assertAdmin() {
  const session = await auth()
  if (!session) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.isAdmin ? user : null
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
