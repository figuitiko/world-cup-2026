export default function AdminGamesLoading() {
  return (
    <div className="space-y-6" aria-label="Cargando administración de partidos">
      <div className="space-y-3">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-primary/25" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-xl border bg-card p-4">
            <div className="mb-3 h-5 w-52 animate-pulse rounded bg-muted" />
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
