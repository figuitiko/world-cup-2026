'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Star, Trophy } from 'lucide-react'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavClientProps {
  session: {
    user: {
      id?: string
      name?: string | null
      isAdmin?: boolean
    }
  } | null
}

const NAV_ITEMS = [
  { href: '/matches', label: 'Partidos', icon: CalendarDays },
  { href: '/picks', label: 'Mis Picks', icon: Star },
  { href: '/leaderboard', label: 'Tabla', icon: Trophy },
]

export function NavClient({ session }: NavClientProps) {
  const path = usePathname()

  const isActive = (href: string) => {
    if (href === '/leaderboard') return path === '/leaderboard'
    return path.startsWith(href)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link
            href={session ? '/matches' : '/leaderboard'}
            className="font-heading font-bold text-base tracking-widest uppercase text-primary"
          >
            ⚽ Mundial 2026
          </Link>

          {session ? (
            <>
              <nav className="hidden sm:flex items-center gap-1">
                {NAV_ITEMS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150',
                      isActive(href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    {label}
                  </Link>
                ))}
                {session.user.isAdmin && (
                  <Link
                    href="/admin/results"
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </nav>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground">
                  Salir
                </Button>
              </form>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </header>

      {session && (
        <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white border-t shadow-[0_-1px_0_0_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around h-16 max-w-md mx-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-6 py-2 text-xs font-medium transition-colors duration-150',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}
