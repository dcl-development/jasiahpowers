'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useStoreCountdown } from '@/hooks/useStoreCountdown'
import { formatCountdownLine } from '@/lib/storeCountdown'

export default function ShopLaunchCountdown({ countdownPrefix = '' }) {
  const router = useRouter()
  const onReachZero = useCallback(() => {
    router.refresh()
  }, [router])

  const { isClient, launched, remainingMs } = useStoreCountdown({ onReachZero })

  if (!isClient || launched || remainingMs === null) return null

  const line = formatCountdownLine(countdownPrefix, remainingMs)

  return (
    <p className="book-product__launch-countdown" role="timer" suppressHydrationWarning>
      {line}
    </p>
  )
}
