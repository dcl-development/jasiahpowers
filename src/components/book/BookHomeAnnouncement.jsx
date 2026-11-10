'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function BookHomeAnnouncement({ text }) {
  const line = String(text || '').trim()
  const viewportRef = useRef(null)
  const measureRef = useRef(null)
  const [overflows, setOverflows] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

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

  if (!line) return null

  const marquee = overflows && !reducedMotion

  return (
    <Link href="/book" className="book-announcement">
      <div className="book-announcement__viewport" ref={viewportRef}>
        <span className="book-announcement__measure" ref={measureRef} aria-hidden="true">
          {line}
        </span>
        <div
          className={`book-announcement__track${
            marquee ? ' book-announcement__track--scroll' : ' book-announcement__track--static'
          }`}
        >
          <span className="book-announcement__text">{line}</span>
          {marquee ? (
            <span className="book-announcement__text" aria-hidden="true">
              {line}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
