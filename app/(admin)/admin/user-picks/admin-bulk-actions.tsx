'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  autoAssignMissingChampions,
  autoAssignMissingPicks,
  autoAssignMissingTopScorers,
} from '@/actions/admin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type BulkAction = {
  label: string
  title: string
  description: string
  run: () => Promise<{ count?: number; error?: string } | undefined>
}

export function AdminBulkActions() {
  const router = useRouter()
  const [openAction, setOpenAction] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const actions: BulkAction[] = [
    {
      label: 'Asignar campeones faltantes',
      title: 'Asignar campeones faltantes',
      description:
        'Esto asigna una selección campeona al azar solo a usuarios que todavía no tienen campeón. No sobrescribe picks existentes.',
      run: autoAssignMissingChampions,
    },
    {
      label: 'Asignar goleadores faltantes',
      title: 'Asignar goleadores faltantes',
      description:
        'Esto asigna un goleador al azar solo a usuarios que todavía no tienen goleador. No sobrescribe picks existentes.',
      run: autoAssignMissingTopScorers,
    },
    {
      label: 'Asignar picks faltantes (−5 min)',
      title: 'Asignar picks faltantes',
      description:
        'Esto completa al azar predicciones de partidos próximos o ya iniciados para usuarios que no eligieron. Usalo solo al cierre.',
      run: autoAssignMissingPicks,
    },
  ]

  function confirm(action: BulkAction) {
    startTransition(async () => {
      const result = await action.run()

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(`Listo: ${result?.count ?? 0} asignaciones realizadas`)
      setOpenAction(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Dialog
          key={action.label}
          open={openAction === action.label}
          onOpenChange={(open) => setOpenAction(open ? action.label : null)}
        >
          <DialogTrigger asChild>
            <Button type="button" variant="destructive" size="sm" className="min-w-[200px]">
              {action.label}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{action.title}</DialogTitle>
              <DialogDescription>{action.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={() => confirm(action)}
                disabled={isPending}
              >
                {isPending ? 'Asignando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
