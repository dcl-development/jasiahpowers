import { notFound } from 'next/navigation'
import BookCheckout from '@/components/book/BookCheckout'
import BookDescription from '@/components/book/BookDescription'
import BookMedia from '@/components/book/BookMedia'
import Reveal from '@/components/motion/Reveal'
import { getBookInventoryState, quantityLimit } from '@/lib/bookInventory'
import { bookPageQuery } from '@/lib/queries'
import { sanityFetch } from '@/lib/sanity'
import { bookStripeConfigured } from '@/lib/stripe'
import { contactHref } from '@/lib/site'
import { isStoreOpen } from '@/lib/storeLaunch'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  let page = null
  try {
    page = await sanityFetch(bookPageQuery)
  } catch {
    page = null
  }
  if (!page?.title) return { title: 'Shop', alternates: { canonical: '/shop' } }
  const description = page.seoDescription?.trim() || undefined
  return {
    title: page.title,
    description,
    alternates: { canonical: '/shop' },
    openGraph: {
      url: '/shop',
      ...(description ? { description } : {}),
    },
  }
}

function detailLines(page) {
  const lines = []
  const shipping = page.shippingSummary?.trim()
  const refund = page.refundSummary?.trim()
  const email = page.supportEmail?.trim()
  if (shipping) lines.push({ key: 'shipping', label: 'Shipping', text: shipping })
  if (refund) lines.push({ key: 'refund', label: 'Refunds', text: refund })
  if (email) {
    lines.push({
      key: 'support',
      label: 'Support',
      node: (
        <a className="motion-link" href={contactHref(email)}>
          {email}
        </a>
      ),
    })
  }
  return lines
}

function availabilityNote(inventory) {
  if (inventory.paused && inventory.remaining > 0) {
    return 'Sales are paused.'
  }
  if (inventory.soldOut) {
    return 'Sold out'
  }
  if (inventory.showRemaining) {
    const n = inventory.remaining
    return `${n} ${n === 1 ? 'copy' : 'copies'} left`
  }
  return null
}

function ComingSoonShop({ page }) {
  const coverPhotos = page.photos?.length
    ? [page.photos.find((item) => item?.image?.asset) || page.photos[0]]
    : []

  return (
    <article className="book-page book-page--soon">
      <div className="book-product book-product--soon">
        {coverPhotos.length ? (
          <Reveal className="book-product__media" delay={1}>
            <BookMedia photos={coverPhotos} />
          </Reveal>
        ) : null}
        <div className="book-product__info">
          <div className="book-product__stack">
            <Reveal delay={1}>
              <p className="kicker book-product__kicker">Book</p>
              <h1 className="book-product__title">{page.title}</h1>
              <p className="book-product__coming-soon" role="status">
                Coming soon
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </article>
  )
}

export default async function ShopPage(props) {
  const searchParams = await props.searchParams
  const ordered = searchParams?.ordered === '1'
  const cookieStore = await cookies()
  const storeOpen = await isStoreOpen(cookieStore)

  let page = null
  try {
    page = await sanityFetch(bookPageQuery)
  } catch {
    page = null
  }

  if (!page?.title?.trim()) {
    notFound()
  }

  if (!storeOpen) {
    return <ComingSoonShop page={page} />
  }

  const inventory = await getBookInventoryState()
  const maxQuantity = quantityLimit(inventory.remaining)
  const details = detailLines(page)
  const availability = availabilityNote(inventory)

  return (
    <article className="book-page">
      <div className="book-product">
        <Reveal className="book-product__media" delay={1}>
          <BookMedia photos={page.photos} />
        </Reveal>

        <div className="book-product__info">
          <div className="book-product__stack">
            <Reveal delay={1}>
              <p className="kicker book-product__kicker">Book</p>
              <h1 className="book-product__title">{page.title}</h1>
              {page.priceLabel?.trim() ? (
                <p className="book-product__price">{page.priceLabel.trim()}</p>
              ) : null}
              {availability ? (
                <p className="book-product__availability" role="status">
                  {availability}
                </p>
              ) : null}
            </Reveal>

            <Reveal delay={2}>
              <BookDescription value={page.description} />
            </Reveal>

            {details.length ? (
              <Reveal delay={2}>
                <dl className="book-product__meta">
                  {details.map((item) => (
                    <div key={item.key} className="book-product__meta-row">
                      <dt>{item.label}</dt>
                      <dd>{item.node ?? item.text}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}

            <Reveal delay={3}>
              <div className="book-product__buy">
                {ordered ? (
                  <p className="form-status" role="status">
                    Thanks — watch your email for Stripe’s receipt.
                  </p>
                ) : null}
                <BookCheckout
                  soldOut={inventory.soldOut}
                  maxQuantity={maxQuantity}
                  checkoutReady={bookStripeConfigured()}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </article>
  )
}
