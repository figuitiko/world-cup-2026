import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10">
      <div className="relative w-full overflow-hidden rounded-[2rem] border bg-card p-8 text-center shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-destructive" />
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Mundial Picks 2026
        </p>
        <div className="mx-auto mt-5 flex size-16 items-center justify-center rounded-full bg-primary/10 font-heading text-3xl font-bold text-primary">
          404
        </div>
        <div className="mx-auto mt-5 max-w-md space-y-2">
          <h1 className="font-heading text-3xl font-bold">No encontramos esa pantalla</h1>
          <p className="text-sm text-muted-foreground">
            Capaz el enlace quedó viejo o el partido cambió. Volvé a una zona segura y seguí
            jugando.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/matches">Ir a partidos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/leaderboard">Ver tabla</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
