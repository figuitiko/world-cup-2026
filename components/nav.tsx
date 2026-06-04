import Link from 'next/link'
import { auth } from '@/auth'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { CopyInviteCode } from '@/components/copy-invite-code'
import { prisma } from '@/lib/db'

export async function Nav() {
  const session = await auth()
  if (!session) return null

  const league = session.user.leagueId
    ? await prisma.league.findUnique({ where: { id: session.user.leagueId } })
    : null

  return (
    <header className="border-b">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/matches" className="font-bold text-lg">
          ⚽ Mundial 2026
        </Link>
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <Link href="/matches" className="hover:underline">Partidos</Link>
          <Link href="/picks" className="hover:underline">Mis Picks</Link>
          <Link href="/leaderboard" className="hover:underline">Tabla</Link>
          {session.user.isAdmin && (
            <Link href="/admin/results" className="hover:underline text-amber-600">Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {league && <CopyInviteCode code={league.inviteCode} />}
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">Salir</Button>
          </form>
        </div>
      </div>
    </header>
  )
}
