'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function LeaderboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10">
      <div className="w-full space-y-4 rounded-3xl border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          #
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold">La tabla no cargó bien</h1>
          <p className="text-sm text-muted-foreground">
            Los puntos siguen guardados. Reintentá la carga o entrá para seguir jugando.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => unstable_retry()}>
            Intentar de nuevo
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
