'use client'

import { PortableText } from '@portabletext/react'
import { useEffect, useId, useRef, useState } from 'react'

const components = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || ''
      const external = /^https?:/i.test(href)
      return (
        <a
          className="motion-link"
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
  },
}

export default function BookDescription({ value }) {
  const id = useId()
  const bodyRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return undefined
    const measure = () => {
      if (expanded) return
      setOverflows(el.scrollHeight > el.clientHeight + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded, value])

  if (!value?.length) return null

  return (
    <div className="prose book-product__description">
      <div
        id={id}
        ref={bodyRef}
        className={`book-product__description-body${expanded ? '' : ' is-clamped'}`}
      >
        <PortableText value={value} components={components} />
      </div>
      {overflows || expanded ? (
        <button
          type="button"
          className="motion-link book-product__description-toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      ) : null}
    </div>
  )
}
