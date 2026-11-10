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
        <svg
          className="book-share__icon"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 11.5v7.5h8v-7.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M7 11.5h4M13 11.5h4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
          />
          <path
            d="M12 16V6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
          />
          <path
            d="M9.25 8.75 12 6l2.75 2.75"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
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
