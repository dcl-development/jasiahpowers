'use client'

import { useState } from 'react'

const PRODUCTION_BOOK_URL = 'https://jasiahpowers.com/shop'

function shareUrl() {
  if (typeof window === 'undefined') return PRODUCTION_BOOK_URL
  const host = window.location.hostname
  if (host === 'www.jasiahpowers.com' || host === 'jasiahpowers.com') {
    return PRODUCTION_BOOK_URL
  }
  return window.location.href.split('#')[0]
}

export default function BookShare() {
  const [note, setNote] = useState('')

  async function onShare() {
    const url = shareUrl()
    setNote('')

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url, title: document.title })
        return
      } catch (error) {
        if (error?.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setNote('Link copied')
      window.setTimeout(() => setNote(''), 2600)
    } catch {
      setNote('Could not copy link')
    }
  }

  return (
    <div className="book-share">
      <button
        type="button"
        className="send motion-press book-share__btn"
        aria-label="Share"
        onClick={onShare}
      >
        <svg
          className="book-share__icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 11.5v7.5h8v-7.5"
            stroke="currentColor"
            strokeWidth="1.65"
          />
          <path d="M8 11.5h2.35" stroke="currentColor" strokeWidth="1.65" />
          <path d="M13.65 11.5H16" stroke="currentColor" strokeWidth="1.65" />
          <path d="M12 16.25V5.75" stroke="currentColor" strokeWidth="1.65" />
          <path
            d="M9.6 8.35 12 5.75l2.4 2.6"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="miter"
          />
        </svg>
      </button>
      {note ? (
        <span className="book-share__note" role="status" aria-live="polite">
          {note}
        </span>
      ) : null}
    </div>
  )
}
