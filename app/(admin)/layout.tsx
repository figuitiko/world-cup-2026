import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.isAdmin) redirect('/')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-amber-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-bold text-amber-700">Admin</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/games" className="hover:underline">
              Partidos
            </Link>
            <Link href="/admin/candidates" className="hover:underline">
              Candidatos
            </Link>
            <Link href="/admin/user-picks" className="hover:underline">
              Picks
            </Link>
            <Link href="/admin/results" className="hover:underline">
              Resultados
            </Link>
            <Link href="/admin/tournament" className="hover:underline">
              Final del Torneo
            </Link>
            <Link href="/matches" className="hover:underline text-muted-foreground">
              Ver app
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  )
}
