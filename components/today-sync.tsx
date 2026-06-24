'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function TodaySync() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    const clientDate = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local tz
    if (searchParams.get('today') !== clientDate) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('today', clientDate)
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
