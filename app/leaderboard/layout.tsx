import { Nav } from '@/components/nav'
import { Toaster } from '@/components/ui/sonner'

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
