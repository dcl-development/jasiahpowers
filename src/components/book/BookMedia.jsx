'use client'

import { useCallback, useState } from 'react'
import MotionImage from '@/components/motion/MotionImage'
import { imageMeta, imageSrc } from '@/lib/image'

export default function BookMedia({ photos }) {
  const items = (photos || []).filter((item) => item?.image?.asset)
  const [selected, setSelected] = useState(0)

  const select = useCallback((index) => {
    setSelected(index)
  }, [])

  const onKeyDown = useCallback(
    (event) => {
      if (items.length < 2) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setSelected((current) => (current - 1 + items.length) % items.length)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setSelected((current) => (current + 1) % items.length)
      }
    },
    [items.length]
  )

  if (!items.length) {
    return (
      <div className="book-media book-media--empty" aria-hidden="true">
        <span className="visually-hidden">Cover photo not added yet</span>
      </div>
    )
  }

  const safeIndex = Math.min(selected, items.length - 1)
  const current = items[safeIndex]
  const meta = imageMeta(current.image)
  const alt = String(current.alt ?? '').trim()

  return (
    <div
      className="book-media"
      role="region"
      aria-label="Book photos"
      tabIndex={items.length > 1 ? 0 : undefined}
      onKeyDown={onKeyDown}
    >
      <figure className="book-media__main">
        <div className="book-media__stage">
          <MotionImage
            key={current.image.asset._ref || safeIndex}
            src={imageSrc(current.image, 1400)}
            alt={alt}
            width={meta.width}
            height={meta.height}
            sizes="(max-width: 919px) 100vw, 50vw"
            priority={safeIndex === 0}
            className="book-media__hero-img"
          />
        </div>
      </figure>

      {items.length > 1 ? (
        <ul className="book-media__thumbs" role="list">
          {items.map((item, index) => {
            const thumbMeta = imageMeta(item.image)
            const thumbAlt = String(item.alt ?? '').trim()
            const label = thumbAlt || `View photo ${index + 1} of ${items.length}`
            const isSelected = index === safeIndex
            return (
              <li key={item.image.asset._ref || index}>
                <button
                  type="button"
                  className={`book-media__thumb${isSelected ? ' book-media__thumb--selected' : ''}`}
                  aria-pressed={isSelected}
                  aria-label={label}
                  onClick={() => select(index)}
                >
                  <MotionImage
                    src={imageSrc(item.image, 240)}
                    alt=""
                    width={thumbMeta.width}
                    height={thumbMeta.height}
                    sizes="80px"
                    aria-hidden
                    className="book-media__thumb-img"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
