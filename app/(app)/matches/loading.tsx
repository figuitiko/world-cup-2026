export default function MatchesLoading() {
  return (
    <div className="space-y-8" aria-label="Cargando partidos">
      <div className="space-y-3">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </div>

      {['Fase de Grupos', 'Grupo A', 'Grupo B'].map((section) => (
        <section key={section} className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 animate-pulse rounded-full bg-primary/40" />
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="h-5 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-12 animate-pulse rounded-lg bg-muted" />
                  <div className="h-5 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
