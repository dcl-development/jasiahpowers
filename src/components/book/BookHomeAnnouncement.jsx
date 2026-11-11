'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useStoreCountdown } from '@/hooks/useStoreCountdown'
import { formatCountdownLine } from '@/lib/storeCountdown'

const DEFAULT_COUNTDOWN_PREFIX = "Let's Figure It Out drops in"

export default function BookHomeAnnouncement({
  enabled = false,
  announcementText = '',
  countdownPrefix = '',
}) {
  const viewportRef = useRef(null)
  const measureRef = useRef(null)
  const [overflows, setOverflows] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const { isClient, launched, remainingMs } = useStoreCountdown()
  const prefix = (countdownPrefix || DEFAULT_COUNTDOWN_PREFIX).trim()

  const postLaunchText = String(announcementText || '').trim()
  let line = ''
  if (launched) {
    line = postLaunchText
  } else if (remainingMs !== null) {
    line = formatCountdownLine(prefix, remainingMs)
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
