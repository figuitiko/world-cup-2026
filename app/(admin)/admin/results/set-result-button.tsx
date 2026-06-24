'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
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
import { enterMatchResult } from '@/actions/admin'

interface Props {
  matchId: string
  result: string
  label: string
  isSelected: boolean
  hasExistingResult: boolean
}

export function SetResultButton({ matchId, result, label, isSelected, hasExistingResult }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function confirm() {
    startTransition(async () => {
      const res = await enterMatchResult(matchId, result)
      if (res?.error) {
        toast.error(res.error)
      } else {
        setOpen(false)
        toast.success('Resultado guardado y picks bloqueados')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={isSelected ? 'default' : 'outline'}
          size="sm"
        >
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasExistingResult ? 'Actualizar resultado' : 'Confirmar resultado'}
          </DialogTitle>
          <DialogDescription>
            {hasExistingResult
              ? 'Estás cambiando un resultado ya cargado. '
              : ''}
            Al guardar, los picks de este partido quedarán <strong>bloqueados permanentemente</strong> y no podrán modificarse.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm font-medium">Resultado: {label}</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={confirm} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
