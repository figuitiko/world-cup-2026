'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const picksSchema = z.object({
  champions: z.array(z.string().min(1)).length(3),
  topScorers: z.array(z.string().min(1)).length(3),
})

export async function saveSpecialPicks(champions: string[], topScorers: string[]) {
  const session = await auth()
  if (!session) return { error: 'No autenticado' }

  const parsed = picksSchema.safeParse({ champions, topScorers })
  if (!parsed.success) {
    return { error: 'Seleccioná exactamente 3 campeones y 3 goleadores' }
  }

  const firstMatch = await prisma.match.findFirst({
    where: { round: 'GROUP' },
    orderBy: { kickoff: 'asc' },
  })
  if (firstMatch && firstMatch.kickoff <= new Date()) {
    return { error: 'El torneo ya comenzó, no podés cambiar tus picks' }
  }

  await prisma.specialPick.upsert({
    where: { userId: session.user.id },
    update: { champions: parsed.data.champions, topScorers: parsed.data.topScorers },
    create: {
      userId: session.user.id,
      champions: parsed.data.champions,
      topScorers: parsed.data.topScorers,
    },
  })

  revalidatePath('/picks')
}
