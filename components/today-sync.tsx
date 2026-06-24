'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function TodaySync() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    const now = new Date()
    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const localTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const todayStart = localMidnight.toISOString()
    const todayEnd = localTomorrow.toISOString()

    if (
      searchParams.get('todayStart') !== todayStart ||
      searchParams.get('todayEnd') !== todayEnd
    ) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('todayStart', todayStart)
      params.set('todayEnd', todayEnd)
      params.delete('today')
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [router, searchParams, pathname])

  return null
}
