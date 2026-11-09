'use client'

import { useState } from 'react'
import { MAX_COPIES_PER_ORDER } from '@/lib/bookConstants'

export default function BookCheckout({
  soldOut,
  maxQuantity,
  checkoutReady,
}) {
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const cappedMax = Math.max(0, Math.min(maxQuantity, MAX_COPIES_PER_ORDER))
  const disabled = soldOut || !checkoutReady || cappedMax < 1 || status === 'loading'

  async function onBuy(event) {
    event.preventDefault()
    if (disabled) return
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/book/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) {
        window.location.assign(data.url)
        return
      }
      setStatus('idle')
      setMessage(data.error || 'Could not start checkout.')
    } catch {
      setStatus('idle')
      setMessage('Could not start checkout.')
    }
  }

  return (
    <form className="book-checkout" onSubmit={onBuy}>
      {!soldOut && cappedMax > 0 ? (
        <label className="field book-checkout__qty">
          <span>Copies</span>
          <select
            name="quantity"
            value={Math.min(quantity, cappedMax)}
            onChange={(event) => setQuantity(Number(event.target.value))}
            disabled={disabled}
          >
            {Array.from({ length: cappedMax }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button className="send motion-press" type="submit" disabled={disabled}>
        {soldOut ? 'Sold out' : status === 'loading' ? 'Redirecting…' : 'Buy'}
      </button>
      {!checkoutReady && !soldOut ? (
        <p className="form-status" role="status">
          Checkout is not wired up on this deploy yet.
        </p>
      ) : null}
      {message ? (
        <p className="form-status" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  )
}
