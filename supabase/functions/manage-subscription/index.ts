import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^22'

const corsHeaders = { 'Access-Control-Allow-Origin': Deno.env.get('SITE_URL') ?? '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
const env = (name: string) => { const value = Deno.env.get(name); if (!value) throw new Error(`Missing ${name}`); return value }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) return json({ error: 'Sign in required.' }, 401)
    const url = env('SUPABASE_URL')
    const userClient = createClient(url, Deno.env.get('SB_PUBLISHABLE_KEY') ?? env('SUPABASE_ANON_KEY'), { global: { headers: { Authorization: authorization } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Sign in required.' }, 401)
    const { action } = await request.json()
    if (!['pause', 'resume', 'cancel'].includes(action)) return json({ error: 'Unknown subscription action.' }, 400)

    const admin = createClient(url, env('SUPABASE_SERVICE_ROLE_KEY'))
    const { data: subscription } = await admin
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('user_id', user.id)
      .in('status', ['active', 'paused', 'past_due'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!subscription?.stripe_subscription_id) return json({ error: 'No active subscription was found.' }, 404)

    const stripe = new Stripe(env('STRIPE_SECRET_KEY'))
    if (action === 'pause') {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, { pause_collection: { behavior: 'void' } })
      await admin.from('subscriptions').update({ status: 'paused' }).eq('id', subscription.id)
    }
    if (action === 'resume') {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, { pause_collection: null })
      await admin.from('subscriptions').update({ status: 'active' }).eq('id', subscription.id)
    }
    if (action === 'cancel') {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
      await admin.from('subscriptions').update({ status: 'cancelled' }).eq('id', subscription.id)
    }
    await admin.from('analytics_events').insert({ user_id: user.id, event_name: `subscription_${action}d`, properties: { subscription_id: subscription.id } })
    return json({ ok: true })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Could not update subscription.' }, 500)
  }
})
