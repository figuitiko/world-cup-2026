'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface MissedMatch {
  id: string
  homeTeam: string
  awayTeam: string
  kickoff: Date
}

interface Props {
  matches: MissedMatch[]
}

export function MissedPicksModal({ matches }: Props) {
  const [open, setOpen] = useState(matches.length > 0)

  if (matches.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>⚠️ Picks pendientes hoy</DialogTitle>
          <DialogDescription>
            Tenés {matches.length} partido{matches.length > 1 ? 's' : ''} hoy sin pronosticar.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {matches.map(m => (
            <li
              key={m.id}
              className="flex items-center justify-between text-sm px-3 py-2 rounded-lg border bg-muted/30"
            >
              <span className="font-semibold">
                {m.homeTeam} <span className="text-muted-foreground font-normal">vs</span> {m.awayTeam}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {new Date(m.kickoff).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </li>
          ))}
        </ul>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Ignorar
          </Button>
          <Button asChild onClick={() => setOpen(false)}>
            <Link href="/matches">Ir a pronosticar</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
