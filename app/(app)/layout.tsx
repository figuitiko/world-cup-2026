import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Nav } from '@/components/nav'
import { Toaster } from '@/components/ui/sonner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-24 sm:pb-8">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
