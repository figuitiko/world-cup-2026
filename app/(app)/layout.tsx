import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Nav } from '@/components/nav'
import { Toaster } from '@/components/ui/sonner'
import { MissedPicksModal } from '@/components/missed-picks-modal'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const userId = session.user.id
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const missedMatches = await prisma.match.findMany({
    where: {
      kickoff: { gte: startOfDay, lte: endOfDay },
      homeTeam: { not: 'POR DEFINIR' },
      predictions: { none: { userId } },
    },
    orderBy: { kickoff: 'asc' },
    select: { id: true, homeTeam: true, awayTeam: true, kickoff: true },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-24 sm:pb-8">
        {children}
      </main>
      <MissedPicksModal matches={missedMatches} />
      <Toaster />
    </div>
  )
}
