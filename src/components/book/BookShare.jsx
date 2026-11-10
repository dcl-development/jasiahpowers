'use client'

import { useState } from 'react'

const PRODUCTION_BOOK_URL = 'https://jasiahpowers.com/book'

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
        <span className="book-share__label">Share</span>
        <svg
          className="book-share__icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M14 4h6v6M10 20H4v-6M20 4l-8.5 8.5M4 20l8.5-8.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
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
