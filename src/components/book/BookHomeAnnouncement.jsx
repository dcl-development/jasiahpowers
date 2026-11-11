'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { launchAtMsFromWindow, useStoreLaunched } from '@/hooks/useStoreLaunched'

const DEFAULT_COUNTDOWN_PREFIX = "Let's Figure It Out drops in"

function pad2(value) {
  return String(value).padStart(2, '0')
}

function formatCountdown(remainingMs) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${days}d ${pad2(hours)}h ${pad2(minutes)}m ${pad2(seconds)}s`
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
