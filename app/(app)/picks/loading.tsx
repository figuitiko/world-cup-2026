export default function PicksLoading() {
  return (
    <div className="space-y-6" aria-label="Cargando picks especiales">
      <div className="space-y-3">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="rounded-2xl border bg-card p-4">
            <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="space-y-2">
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>

      <div className="h-11 animate-pulse rounded-lg bg-primary/25" />
    </div>
  )
}
