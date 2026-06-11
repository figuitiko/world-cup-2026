'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const pickSchema = z.enum(['HOME', 'DRAW', 'AWAY'])

export async function createOrUpdatePrediction(matchId: string, pick: string) {
  const session = await auth()
  if (!session) return { error: 'No autenticado' }

  const parsed = pickSchema.safeParse(pick)
  if (!parsed.success) return { error: 'Pronóstico inválido' }

  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) return { error: 'Partido no encontrado' }
  if (match.locked) return { error: 'Este partido está bloqueado' }
  if (match.kickoff <= new Date()) return { error: 'Este partido ya comenzó' }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    update: { pick: parsed.data },
    create: { userId: session.user.id, matchId, pick: parsed.data },
  })

  revalidatePath('/matches')
}
