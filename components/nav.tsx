import { auth } from '@/auth'
import { NavClient } from '@/components/nav-client'

export async function Nav() {
  const session = await auth()
  return <NavClient session={session} />
}
