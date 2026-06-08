'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/matches')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Brand bar */}
      <div className="bg-primary px-4 py-3">
        <p className="text-primary-foreground font-heading font-bold text-center text-base tracking-widest uppercase">
          ⚽ Mundial Picks 2026
        </p>
      </div>

      {/* Hero */}
      <div className="bg-primary/5 border-b px-4 py-10 text-center space-y-3">
        <h1 className="font-heading font-bold text-3xl sm:text-4xl leading-tight">
          Pronosticá el Mundial.
          <br />
          <span className="text-primary">Ganale a tus amigos.</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
          Elegí ganador, empate o derrota. Sumá puntos. Escalá la tabla.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center p-6 pt-8">
        <div className="w-full max-w-sm space-y-6">
          <h2 className="font-heading font-bold text-xl text-center">Ingresá a tu cuenta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
