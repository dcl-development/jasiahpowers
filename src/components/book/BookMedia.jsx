import MotionImage from '@/components/motion/MotionImage'
import { imageLqip, imageMeta, imageSrc } from '@/lib/image'

export default function BookMedia({ photos }) {
  const items = (photos || []).filter((item) => item?.image?.asset)
  if (!items.length) {
    return (
      <div className="book-media book-media--empty">
        <span className="visually-hidden">Cover photo not added yet</span>
      </div>
    )
  }

  const [primary, ...rest] = items

  function renderFigure(item, index, featured) {
    const meta = imageMeta(item.image)
    const alt = String(item.alt ?? '').trim()
    return (
      <figure
        key={item.image.asset._ref || index}
        className={`book-media__item${featured ? ' book-media__item--primary' : ''}`}
      >
        <span
          className="book-media__frame motion-media"
          style={
            imageLqip(item.image)
              ? { backgroundImage: `url(${imageLqip(item.image)})` }
              : undefined
          }
        >
          <MotionImage
            src={imageSrc(item.image, featured ? 1400 : 800)}
            alt={alt}
            width={meta.width}
            height={meta.height}
            sizes={
              featured
                ? '(max-width: 799px) 100vw, 42vw'
                : '(max-width: 799px) 28vw, 120px'
            }
            priority={featured}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </span>
      </figure>
    )
  }

  return (
    <div className="book-media">
      {renderFigure(primary, 0, true)}
      {rest.length ? (
        <div className="book-media__thumbs">{rest.map((item, i) => renderFigure(item, i + 1, false))}</div>
      ) : null}
    </div>
  )
}
