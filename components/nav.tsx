import Link from 'next/link'
import { auth } from '@/auth'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export async function Nav() {
  const session = await auth()

  return (
    <header className="border-b">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href={session ? '/matches' : '/leaderboard'} className="font-bold text-lg">
          ⚽ Mundial 2026
        </Link>
        {session ? (
          <>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link href="/matches" className="hover:underline">Partidos</Link>
              <Link href="/picks" className="hover:underline">Mis Picks</Link>
              <Link href="/leaderboard" className="hover:underline">Tabla</Link>
              {session.user.isAdmin && (
                <Link href="/admin/results" className="hover:underline text-amber-600">Admin</Link>
              )}
            </nav>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit">Salir</Button>
            </form>
          </>
        ) : (
          <Button asChild size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
