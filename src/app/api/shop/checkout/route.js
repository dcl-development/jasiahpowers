import {
  getBookInventoryState,
  quantityLimit,
} from '@/lib/bookInventory'
import {
  BOOK_CHECKOUT_METADATA,
  CHECKOUT_RESERVATION_MINUTES,
  getStripe,
  bookStripeConfigured,
  MAX_COPIES_PER_ORDER,
} from '@/lib/stripe'
import { isStoreOpen } from '@/lib/storeLaunch'

function siteUrl(request) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  if (host) return `${proto}://${host}`
  return 'http://localhost:3000'
}

export async function POST(request) {
  if (!(await isStoreOpen(request))) {
    return Response.json({ error: 'Store is not open yet.' }, { status: 403 })
  }

  if (!bookStripeConfigured()) {
    return Response.json(
      { error: 'Checkout is not configured yet.' },
      { status: 503 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const requested = Number(body?.quantity)
  if (!Number.isInteger(requested) || requested < 1) {
    return Response.json({ error: 'Choose how many copies to buy.' }, { status: 400 })
  }
  if (requested > MAX_COPIES_PER_ORDER) {
    return Response.json(
      { error: `You can order up to ${MAX_COPIES_PER_ORDER} copies at a time.` },
      { status: 400 }
    )
  }

  let inventory
  try {
    inventory = await getBookInventoryState()
  } catch {
    return Response.json({ error: 'Could not check inventory.' }, { status: 503 })
  }

  if (inventory.soldOut) {
    return Response.json({ error: 'Sold out.' }, { status: 409 })
  }

  const maxQty = quantityLimit(inventory.remaining)
  if (requested > maxQty) {
    return Response.json(
      {
        error:
          maxQty === 0
            ? 'Sold out.'
            : `Only ${maxQty} ${maxQty === 1 ? 'copy' : 'copies'} left right now.`,
      },
      { status: 409 }
    )
  }

  const stripe = getStripe()
  const origin = siteUrl(request)
  const expiresAt =
    Math.floor(Date.now() / 1000) + CHECKOUT_RESERVATION_MINUTES * 60

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: requested,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate: process.env.STRIPE_SHIPPING_RATE_ID,
        },
      ],
      automatic_tax: { enabled: true },
      expires_at: expiresAt,
      success_url: `${origin}/shop?ordered=1`,
      cancel_url: `${origin}/shop`,
      metadata: {
        product: BOOK_CHECKOUT_METADATA,
        quantity: String(requested),
      },
    })

    if (!session.url) {
      return Response.json({ error: 'Could not start checkout.' }, { status: 502 })
    }

    return Response.json({ url: session.url })
  } catch {
    return Response.json({ error: 'Could not start checkout.' }, { status: 502 })
  }
}
