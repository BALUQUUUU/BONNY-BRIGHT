import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^22'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('SITE_URL') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
const env = (name: string) => {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) return json({ error: 'Please sign in before checking out.' }, 401)

    const supabaseUrl = env('SUPABASE_URL')
    const publishableKey = Deno.env.get('SB_PUBLISHABLE_KEY') ?? env('SUPABASE_ANON_KEY')
    const userClient = createClient(supabaseUrl, publishableKey, { global: { headers: { Authorization: authorization } } })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) return json({ error: 'Your session has expired. Please sign in again.' }, 401)

    const body = await request.json()
    const kind = body?.kind === 'subscription' ? 'subscription' : 'order'
    const submittedItems = Array.isArray(body?.items) ? body.items : []
    const quantities = new Map<string, number>()
    for (const item of submittedItems) {
      if (!item || typeof item.productId !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        return json({ error: 'Your cart contains an invalid item.' }, 400)
      }
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
    }
    if (!quantities.size) return json({ error: 'Your cart is empty.' }, 400)

    const admin = createClient(supabaseUrl, env('SUPABASE_SERVICE_ROLE_KEY'))
    const productIds = [...quantities.keys()]
    const { data: products, error: productError } = await admin
      .from('products')
      .select('id, name, price_cents, currency, stock_quantity, active, stripe_price_id')
      .in('id', productIds)
    if (productError || !products || products.length !== productIds.length) return json({ error: 'One or more products are unavailable.' }, 400)
    if (products.some((product) => !product.active || product.stock_quantity < (quantities.get(product.id) ?? 0))) {
      return json({ error: 'One or more products are out of stock. Please update your cart.' }, 409)
    }

    const currency = products[0].currency
    if (products.some((product) => product.currency !== currency)) return json({ error: 'Products must use one currency per order.' }, 400)
    const subtotalCents = products.reduce((total, product) => total + product.price_cents * (quantities.get(product.id) ?? 0), 0)
    const shippingCents = kind === 'order' && subtotalCents > 0 && subtotalCents < 5000 ? 400 : 0
    const totalCents = subtotalCents + shippingCents
    const shippingAddress = typeof body?.shippingAddress === 'string' ? body.shippingAddress.trim().slice(0, 500) : ''

    const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', user.id).single()
    const stripe = new Stripe(env('STRIPE_SECRET_KEY'))
    let customerId = profile?.stripe_customer_id as string | null | undefined
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email ?? undefined, name: String(user.user_metadata?.full_name ?? ''), metadata: { supabase_user_id: user.id } })
      customerId = customer.id
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        source: kind === 'subscription' ? 'subscription' : 'one_time',
        currency,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        shipping_address: shippingAddress ? { address: shippingAddress } : {},
      })
      .select('id')
      .single()
    if (orderError || !order) throw orderError ?? new Error('Could not create your order.')

    const orderItems = products.map((product) => {
      const quantity = quantities.get(product.id) ?? 0
      return { order_id: order.id, product_id: product.id, product_name: product.name, quantity, unit_price_cents: product.price_cents, line_total_cents: product.price_cents * quantity }
    })
    const { error: itemsError } = await admin.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    const lineItems = products.map((product) => {
      const quantity = quantities.get(product.id) ?? 0
      if (product.stripe_price_id) return { price: product.stripe_price_id, quantity }
      return {
        price_data: {
          currency,
          product_data: { name: product.name, metadata: { bonny_product_id: product.id } },
          unit_amount: product.price_cents,
          ...(kind === 'subscription' ? { recurring: { interval: 'month' as const } } : {}),
        },
        quantity,
      }
    })
    if (shippingCents) {
      lineItems.push({ price_data: { currency, product_data: { name: 'Standard delivery' }, unit_amount: shippingCents }, quantity: 1 })
    }

    const siteUrl = env('SITE_URL').replace(/\/$/, '')
    const session = await stripe.checkout.sessions.create({
      mode: kind === 'subscription' ? 'subscription' : 'payment',
      customer: customerId,
      line_items: lineItems,
      success_url: `${siteUrl}/checkout?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?checkout=cancelled`,
      metadata: { order_id: order.id, user_id: user.id, kind },
      ...(kind === 'subscription' ? { subscription_data: { metadata: { order_id: order.id, user_id: user.id } } } : { payment_intent_data: { metadata: { order_id: order.id, user_id: user.id } } }),
    })
    await admin.from('orders').update({ stripe_checkout_session_id: session.id }).eq('id', order.id)
    return json({ url: session.url })
  } catch (error) {
    console.error(error)
    return json({ error: error instanceof Error ? error.message : 'Could not start checkout.' }, 500)
  }
})
