'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AppError({
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
    <div className="mx-auto max-w-md space-y-4 rounded-3xl border bg-card p-6 text-center shadow-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        !
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">No pudimos cargar esta pantalla</h1>
        <p className="text-sm text-muted-foreground">
          Puede ser un corte momentáneo. Probá de nuevo o volvé a los partidos.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button type="button" onClick={() => unstable_retry()}>
          Intentar de nuevo
        </Button>
        <Button asChild variant="outline">
          <Link href="/matches">Ir a partidos</Link>
        </Button>
      </div>
    </div>
  )
}
