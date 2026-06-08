import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Trophy } from 'lucide-react'

interface LeaderboardEntry {
  userId: string
  name: string
  matchPoints: number
  championBonus: number
  scorerBonus: number
  total: number
}

const MEDALS = ['🥇', '🥈', '🥉']

const PODIUM_STYLES = [
  { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', pts: 'text-amber-600' },
  { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-600', pts: 'text-gray-500' },
  { border: 'border-amber-700', bg: 'bg-amber-50/60', text: 'text-amber-800', pts: 'text-amber-700' },
]

export function LeaderboardTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[]
  currentUserId?: string
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Trophy className="mx-auto text-muted-foreground/20" size={56} strokeWidth={1.5} />
        <p className="font-heading font-bold text-lg">La carrera empieza con el primer resultado.</p>
        <p className="text-sm text-muted-foreground">Volvé cuando haya partidos terminados.</p>
      </div>
    )
  }

  // Podium display order: silver (2nd), gold (1st), bronze (3rd)
  const top = entries.slice(0, Math.min(3, entries.length))
  const rest = entries.slice(3)
  const podiumOrder =
    top.length >= 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : [top[0]]

  return (
    <div className="space-y-8">
      {/* Podium */}
      <div className="flex items-end justify-center gap-3">
        {podiumOrder.map((entry) => {
          if (!entry) return null
          const rank = entries.indexOf(entry)
          const style = PODIUM_STYLES[rank]
          const isCurrentUser = entry.userId === currentUserId
          const isFeatured = rank === 0

          return (
            <div
              key={entry.userId}
              className={cn(
                'flex-1 max-w-[140px] rounded-2xl border-2 p-4 text-center transition-all',
                style.border,
                style.bg,
                isFeatured && 'scale-105 shadow-lg',
                isCurrentUser && 'ring-2 ring-offset-2 ring-primary'
              )}
            >
              <div className="text-3xl mb-2">{MEDALS[rank]}</div>
              <p className={cn('font-heading font-bold text-sm leading-tight', style.text)}>
                {entry.name}
              </p>
              {isCurrentUser && (
                <span className="inline-block mt-0.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  VOS
                </span>
              )}
              <p className={cn('text-3xl font-heading font-bold mt-3', style.pts)}>
                {entry.total}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                puntos
              </p>
            </div>
          )
        })}
      </div>

      {/* Rest of table */}
      {rest.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Jugador</TableHead>
              <TableHead className="text-right">Partidos</TableHead>
              <TableHead className="text-right">Bonus</TableHead>
              <TableHead className="text-right font-bold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rest.map((entry, idx) => {
              const isCurrentUser = entry.userId === currentUserId
              return (
                <TableRow
                  key={entry.userId}
                  className={isCurrentUser ? 'bg-primary/5' : undefined}
                >
                  <TableCell className="font-medium text-muted-foreground tabular-nums">
                    {idx + 4}
                  </TableCell>
                  <TableCell>
                    <span className={cn('font-medium', isCurrentUser && 'text-primary')}>
                      {entry.name}
                    </span>
                    {isCurrentUser && (
                      <Badge
                        variant="outline"
                        className="ml-2 text-[10px] border-primary text-primary"
                      >
                        Vos
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{entry.matchPoints}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {entry.championBonus + entry.scorerBonus > 0
                      ? `+${entry.championBonus + entry.scorerBonus}`
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary tabular-nums">
                    {entry.total}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
