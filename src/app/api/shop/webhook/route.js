import { markBookCheckoutPaid } from '@/lib/bookWebhook'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    return Response.json({ error: 'Webhook is not configured.' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return Response.json({ error: 'Missing signature.' }, { status: 400 })
  }

  const payload = await request.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret)
  } catch {
    return Response.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    if (
      session.metadata?.product === 'book' &&
      session.payment_status === 'paid'
    ) {
      await markBookCheckoutPaid(session)
    }
  }

  if (event.type === 'checkout.session.expired') {
    /* Reservation is released automatically when the session is no longer open. */
  }

  return Response.json({ received: true })
}
