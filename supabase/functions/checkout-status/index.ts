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
    const { sessionId } = await request.json()
    if (typeof sessionId !== 'string') return json({ error: 'Invalid checkout session.' }, 400)
    const session = await new Stripe(env('STRIPE_SECRET_KEY')).checkout.sessions.retrieve(sessionId)
    if (session.metadata?.user_id !== user.id) return json({ error: 'This checkout does not belong to you.' }, 403)
    const admin = createClient(url, env('SUPABASE_SERVICE_ROLE_KEY'))
    const { data: order } = await admin.from('orders').select('id, status').eq('stripe_checkout_session_id', session.id).eq('user_id', user.id).maybeSingle()
    return json({ paid: order?.status === 'paid', orderId: order?.id, status: order?.status ?? session.payment_status })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Could not confirm checkout.' }, 500)
  }
})
