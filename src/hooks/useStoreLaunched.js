'use client'

import { useEffect, useState } from 'react'

import { DEFAULT_LAUNCH_AT } from '@/lib/storeLaunch'

export function launchAtMsFromWindow() {
  if (typeof window !== 'undefined' && window.__JP_STORE_LAUNCH__) {
    const ms = Date.parse(window.__JP_STORE_LAUNCH__)
    if (Number.isFinite(ms)) return ms
  }
  return Date.parse(DEFAULT_LAUNCH_AT)
}

export function useStoreLaunched() {
  const [launched, setLaunched] = useState(() => Date.now() >= launchAtMsFromWindow())

  useEffect(() => {
    const launch = launchAtMsFromWindow()
    const delay = launch - Date.now()
    if (delay <= 0) return undefined
    const id = window.setTimeout(() => setLaunched(true), delay + 50)
    return () => window.clearTimeout(id)
  }, [])

  return launched
}
