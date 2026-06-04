'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      {copied ? '¡Copiado!' : `Código: ${code}`}
    </Button>
  )
}
