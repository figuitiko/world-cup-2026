import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface LeaderboardEntry {
  userId: string
  name: string
  matchPoints: number
  championBonus: number
  scorerBonus: number
  total: number
}

export function LeaderboardTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[]
  currentUserId: string
}) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">Aún no hay resultados cargados.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Jugador</TableHead>
          <TableHead className="text-right">Partidos</TableHead>
          <TableHead className="text-right">Campeón</TableHead>
          <TableHead className="text-right">Goleador</TableHead>
          <TableHead className="text-right font-bold">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, idx) => (
          <TableRow
            key={entry.userId}
            className={entry.userId === currentUserId ? 'bg-muted/50' : ''}
          >
            <TableCell className="font-medium">{idx + 1}</TableCell>
            <TableCell>
              {entry.name}
              {entry.userId === currentUserId && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Vos
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">{entry.matchPoints}</TableCell>
            <TableCell className="text-right">{entry.championBonus}</TableCell>
            <TableCell className="text-right">{entry.scorerBonus}</TableCell>
            <TableCell className="text-right font-bold">{entry.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
