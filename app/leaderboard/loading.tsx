export default function LeaderboardLoading() {
  return (
    <div className="space-y-8" aria-label="Cargando tabla de posiciones">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="flex items-end justify-center gap-3">
        {[88, 116, 96].map((height, index) => (
          <div
            key={index}
            className="flex-1 max-w-[140px] rounded-2xl border-2 border-primary/10 bg-card p-4 text-center"
          >
            <div
              className="mx-auto mb-3 w-12 animate-pulse rounded-full bg-muted"
              style={{ height }}
            />
            <div className="mx-auto h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="mx-auto mt-3 h-8 w-14 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="grid grid-cols-[2rem_1fr_4rem_4rem] gap-3">
              <div className="h-5 animate-pulse rounded bg-muted" />
              <div className="h-5 animate-pulse rounded bg-muted" />
              <div className="h-5 animate-pulse rounded bg-muted" />
              <div className="h-5 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
