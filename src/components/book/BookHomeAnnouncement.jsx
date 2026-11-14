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
  const textRef = useRef(null)
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
      const textEl = textRef.current
      if (!viewport || !textEl) return
      const style = window.getComputedStyle(textEl)
      const padLeft = parseFloat(style.paddingLeft) || 0
      const padRight = parseFloat(style.paddingRight) || 0
      const contentWidth = textEl.scrollWidth - padLeft - padRight
      setOverflows(contentWidth + padLeft * 2 > viewport.clientWidth + 1)
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (viewportRef.current) observer.observe(viewportRef.current)
    if (textRef.current) observer.observe(textRef.current)
    window.addEventListener('resize', measure)
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {})

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
        <div
          className={`book-announcement__track${
            marquee ? ' book-announcement__track--scroll' : ' book-announcement__track--static'
          }`}
        >
          <span className="book-announcement__text" ref={textRef} suppressHydrationWarning>
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
