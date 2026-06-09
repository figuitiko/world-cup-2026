'use client'

import Image from 'next/image'
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
    <div className="min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Brand bar */}
      <div className="relative bg-primary px-4 py-3 text-primary-foreground">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,var(--primary)_0%,var(--primary)_33%,var(--secondary)_33%,var(--secondary)_66%,var(--destructive)_66%,var(--destructive)_100%)]"
        />
        <p className="relative z-10 text-center font-heading text-base font-bold uppercase tracking-widest">
          ⚽ Mundial Picks 2026
        </p>
      </div>

      {/* Hero */}
      <section className="relative isolate border-b bg-white px-4 py-12 text-center sm:py-16">
        <div
          aria-hidden="true"
          className="absolute -left-20 top-10 -z-10 h-44 w-72 rotate-[-18deg] rounded-[999px] border-[18px] border-primary/20"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 bottom-6 -z-10 h-44 w-80 rotate-[22deg] rounded-[999px] border-[18px] border-secondary/20"
        />
        <div className="mx-auto max-w-xl space-y-4">
          <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
            <Image
              src="/trionda-ball.png"
              alt="Balón TRIONDA del Mundial 2026"
              fill
              priority
              sizes="(max-width: 640px) 128px, 160px"
              className="object-contain drop-shadow-2xl"
            />
          </div>
          <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-border bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span className="h-2 w-2 rounded-full bg-destructive" />
            TRIONDA Challenge
          </div>
          <h1 className="font-heading text-4xl font-bold leading-none text-foreground sm:text-5xl">
            Pronosticá el Mundial.
            <br />
            <span className="bg-[linear-gradient(90deg,var(--primary),var(--secondary),var(--destructive))] bg-clip-text text-transparent">
              Ganale a tus amigos.
            </span>
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            Elegí ganador, empate o derrota. Sumá puntos. Escalá la tabla.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-2 border-secondary bg-white text-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            <Link href="/leaderboard">Ver tabla</Link>
          </Button>
        </div>
      </section>

      {/* Form */}
      <div className="flex flex-1 items-start justify-center p-6 pt-8">
        <div className="w-full max-w-sm space-y-6 rounded-3xl border bg-card/95 p-5 shadow-xl shadow-primary/10">
          <div className="space-y-1 text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-[linear-gradient(90deg,var(--primary),var(--secondary),var(--destructive))]"
            />
            <h2 className="font-heading text-xl font-bold">Ingresá a tu cuenta</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-11 border-border bg-white"
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
                className="h-11 border-border bg-white"
              />
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="h-12 w-full text-base font-bold shadow-lg shadow-primary/20"
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
