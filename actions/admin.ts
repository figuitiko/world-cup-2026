'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
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

export async function createMatch(data: unknown) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = matchInputSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

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
  if (!parsed.success) return { error: parsed.error.errors[0].message }

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
