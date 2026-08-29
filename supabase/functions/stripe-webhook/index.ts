import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^22'

const env = (name: string) => {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

const stripe = new Stripe(env('STRIPE_SECRET_KEY'))
const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (request) => {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return new Response('Missing Stripe signature', { status: 400 })

  try {
    // Use the raw body; parsing JSON before verification would invalidate the signature.
    const event = await stripe.webhooks.constructEventAsync(await request.text(), signature, env('STRIPE_WEBHOOK_SIGNING_SECRET'), undefined, cryptoProvider)
    const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'))

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.order_id
      const userId = session.metadata?.user_id
      if (!orderId || !userId) return new Response('Missing checkout metadata', { status: 400 })

      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      if (subscriptionId) {
        const { data: items } = await admin.from('order_items').select('product_id, quantity').eq('order_id', orderId)
        await admin.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
            stripe_subscription_id: subscriptionId,
            status: session.payment_status === 'paid' ? 'active' : 'pending',
            currency: session.currency ?? 'usd',
            monthly_amount_cents: session.amount_total ?? 0,
            items: (items ?? []).map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
          },
          { onConflict: 'stripe_subscription_id' },
        )
      }

      if (session.payment_status === 'paid') {
        const { error } = await admin.rpc('fulfill_paid_order', {
          p_order_id: orderId,
          p_stripe_event_id: event.id,
          p_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? '',
          p_amount_cents: session.amount_total ?? 0,
          p_currency: session.currency ?? 'usd',
        })
        if (error) throw error
        await admin.from('analytics_events').insert({ user_id: userId, event_name: subscriptionId ? 'subscription_started' : 'purchase_completed', properties: { order_id: orderId, amount_cents: session.amount_total ?? 0 } })
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const status = event.type === 'customer.subscription.deleted' || subscription.status === 'canceled'
        ? 'cancelled'
        : subscription.pause_collection
          ? 'paused'
          : subscription.status === 'past_due'
            ? 'past_due'
            : subscription.status === 'active' || subscription.status === 'trialing'
              ? 'active'
              : 'pending'
      const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
      await admin
        .from('subscriptions')
        .update({ status, cancel_at_period_end: subscription.cancel_at_period_end, current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null })
        .eq('stripe_subscription_id', subscription.id)
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
      // The initial payment was fulfilled from checkout.session.completed. Each later
      // cycle gets its own order and decrements stock in one database transaction.
      if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
        const { error } = await admin.rpc('fulfill_subscription_renewal', {
          p_stripe_subscription_id: subscriptionId,
          p_stripe_event_id: event.id,
          p_stripe_invoice_id: invoice.id,
          p_amount_cents: invoice.amount_paid,
          p_currency: invoice.currency,
        })
        if (error) throw error
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error(error)
    return new Response(error instanceof Error ? error.message : 'Webhook error', { status: 400 })
  }
})
