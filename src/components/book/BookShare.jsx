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
        onClick={onShare}
      >
        Share
      </button>
      {note ? (
        <span className="book-share__note" role="status" aria-live="polite">
          {note}
        </span>
      ) : null}
    </div>
  )
}
