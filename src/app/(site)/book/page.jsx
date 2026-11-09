import { notFound } from 'next/navigation'
import BookCheckout from '@/components/book/BookCheckout'
import BookDescription from '@/components/book/BookDescription'
import BookPhotos from '@/components/book/BookPhotos'
import Reveal from '@/components/motion/Reveal'
import { getBookInventoryState, quantityLimit } from '@/lib/bookInventory'
import { bookPageQuery } from '@/lib/queries'
import { sanityFetch } from '@/lib/sanity'
import { bookStripeConfigured } from '@/lib/stripe'
import { contactHref } from '@/lib/site'

export const revalidate = 60

export async function generateMetadata() {
  let page = null
  try {
    page = await sanityFetch(bookPageQuery)
  } catch {
    page = null
  }
  if (!page?.title) return { title: 'Book' }
  const description = page.seoDescription?.trim() || undefined
  return {
    title: page.title,
    description,
    openGraph: description ? { description } : undefined,
  }
}

function detailLines(page) {
  const lines = []
  const shipping = page.shippingSummary?.trim()
  const refund = page.refundSummary?.trim()
  const email = page.supportEmail?.trim()
  if (shipping) lines.push({ key: 'shipping', text: shipping })
  if (email) {
    lines.push({
      key: 'support',
      node: (
        <>
          Questions and receipts:{' '}
          <a className="motion-link" href={contactHref(email)}>
            {email}
          </a>
        </>
      ),
    })
  }
  if (refund) lines.push({ key: 'refund', text: refund })
  return lines
}

export default async function BookPage(props) {
  const searchParams = await props.searchParams
  const ordered = searchParams?.ordered === '1'

  let page = null
  try {
    page = await sanityFetch(bookPageQuery)
  } catch {
    page = null
  }

  if (!page?.title?.trim()) {
    notFound()
  }

  const inventory = await getBookInventoryState()
  const maxQuantity = quantityLimit(inventory.remaining)
  const details = detailLines(page)

  return (
    <div className="plain-page book-page">
      <Reveal>
        <p className="kicker">Book</p>
        <h1>{page.title}</h1>
        {page.priceLabel?.trim() ? (
          <p className="book-page__price">{page.priceLabel.trim()}</p>
        ) : null}
      </Reveal>

      <Reveal delay={1}>
        <BookDescription value={page.description} />
      </Reveal>

      <Reveal delay={1}>
        <BookPhotos photos={page.photos} />
      </Reveal>

      {details.length ? (
        <Reveal delay={2}>
          <div className="book-page__details">
            {details.map((item) => (
              <p key={item.key}>{item.node ?? item.text}</p>
            ))}
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={2}>
        {inventory.showRemaining ? (
          <p className="book-page__stock" role="status">
            {inventory.remaining} {inventory.remaining === 1 ? 'copy' : 'copies'} left
          </p>
        ) : null}
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
      </Reveal>
    </div>
  )
}
