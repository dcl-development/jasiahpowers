import MotionImage from '@/components/motion/MotionImage'
import { imageLqip, imageMeta, imageSrc } from '@/lib/image'

export default function BookPhotos({ photos }) {
  if (!photos?.length) return null

  const items = photos.filter((item) => item?.image?.asset)
  if (!items.length) return null

  return (
    <div className="book-photos">
      {items.map((item, index) => {
        const meta = imageMeta(item.image)
        const alt = String(item.alt ?? '').trim()
        return (
          <figure key={item.image.asset._ref || index} className="book-photos__item">
            <span
              className="book-photos__frame motion-media"
              style={
                imageLqip(item.image)
                  ? { backgroundImage: `url(${imageLqip(item.image)})` }
                  : undefined
              }
            >
              <MotionImage
                src={imageSrc(item.image, 1200)}
                alt={alt}
                width={meta.width}
                height={meta.height}
                sizes="(max-width: 720px) 100vw, 32rem"
                style={{ width: '100%', height: 'auto' }}
              />
            </span>
          </figure>
        )
      })}
    </div>
  )
}
