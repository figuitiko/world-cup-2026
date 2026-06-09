export default function AdminUsersLoading() {
  return (
    <div className="space-y-6" aria-label="Cargando administración de usuarios">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex gap-2">
              <div className="h-5 w-36 animate-pulse rounded bg-muted" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-44 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
