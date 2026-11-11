'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { launchAtMsFromWindow, useStoreLaunched } from '@/hooks/useStoreLaunched'

const DEFAULT_COUNTDOWN_PREFIX = "Let's Figure It Out drops in"

function formatCountdown(remainingMs) {
  if (remainingMs <= 0) return '0m'
  const totalMinutes = Math.floor(remainingMs / 60_000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (days > 0 || hours > 0) parts.push(`${hours}h`)
  parts.push(`${minutes}m`)
  return parts.join(' ')
}

export default function BookHomeAnnouncement({
  enabled = false,
  announcementText = '',
  countdownPrefix = '',
}) {
  const viewportRef = useRef(null)
  const measureRef = useRef(null)
  const [overflows, setOverflows] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [remainingMs, setRemainingMs] = useState(null)
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const launched = useStoreLaunched()
  const prefix = (countdownPrefix || DEFAULT_COUNTDOWN_PREFIX).trim()

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

  const postLaunchText = String(announcementText || '').trim()
  let line = ''
  if (launched) {
    line = postLaunchText
  } else if (remainingMs !== null) {
    line = `${prefix} ${formatCountdown(remainingMs)}`.trim()
  }

  useEffect(() => {
    if (!line) return undefined

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = () => setReducedMotion(mq.matches)
    onMotionChange()
    mq.addEventListener('change', onMotionChange)

    const measure = () => {
      const viewport = viewportRef.current
      const measureEl = measureRef.current
      if (!viewport || !measureEl) return
      setOverflows(measureEl.scrollWidth > viewport.clientWidth + 1)
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (viewportRef.current) observer.observe(viewportRef.current)
    window.addEventListener('resize', measure)

    return () => {
      mq.removeEventListener('change', onMotionChange)
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [line])

  if (!enabled || !isClient || !line) return null

  const marquee = overflows && !reducedMotion

  return (
    <Link href="/shop" className="book-announcement">
      <div className="book-announcement__viewport" ref={viewportRef}>
        <span className="book-announcement__measure" ref={measureRef} aria-hidden="true">
          {line}
        </span>
        <div
          className={`book-announcement__track${
            marquee ? ' book-announcement__track--scroll' : ' book-announcement__track--static'
          }`}
        >
          <span className="book-announcement__text" suppressHydrationWarning>
            {line}
          </span>
          {marquee ? (
            <span className="book-announcement__text" aria-hidden="true" suppressHydrationWarning>
              {line}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
