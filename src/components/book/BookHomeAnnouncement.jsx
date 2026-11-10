'use client'

import Link from 'next/link'

export default function BookHomeAnnouncement({ text }) {
  const line = String(text || '').trim()
  if (!line) return null

  return (
    <Link href="/book" className="book-announcement">
      <div className="book-announcement__viewport">
        <div className="book-announcement__track">
          <span className="book-announcement__text">{line}</span>
          <span className="book-announcement__text" aria-hidden="true">
            {line}
          </span>
        </div>
      </div>
    </Link>
  )
}
