'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { launchAtMsFromWindow, useStoreLaunched } from '@/hooks/useStoreLaunched'

export function useStoreCountdown({ onReachZero } = {}) {
  const [remainingMs, setRemainingMs] = useState(null)
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const launched = useStoreLaunched()
  const reachedZero = useRef(false)

  useEffect(() => {
    if (!isClient || launched) return undefined

    const tick = () => {
      const launch = launchAtMsFromWindow()
      setRemainingMs(Math.max(0, launch - Date.now()))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [isClient, launched])

  useEffect(() => {
    if (!onReachZero) return undefined
    if (!isClient || launched || remainingMs === null || remainingMs > 0) {
      return undefined
    }
    if (reachedZero.current) return undefined
    reachedZero.current = true
    onReachZero()
    return undefined
  }, [isClient, launched, remainingMs, onReachZero])

  return { isClient, launched, remainingMs }
}
