'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Lock } from 'lucide-react'
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
import { lockMatch } from '@/actions/admin'

interface Props {
  matchId: string
  matchLabel: string
}

export function LockMatchButton({ matchId, matchLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function confirm() {
    startTransition(async () => {
      const result = await lockMatch(matchId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setOpen(false)
        toast.success('Partido bloqueado')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1.5">
          <Lock size={14} />
          Bloquear
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear partido</DialogTitle>
          <DialogDescription>
            Esta acción es <strong>irreversible</strong>. Nadie podrá modificar picks de este partido.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm font-medium">{matchLabel}</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button variant="destructive" disabled={isPending} onClick={confirm}>
            {isPending ? 'Bloqueando...' : 'Confirmar bloqueo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
