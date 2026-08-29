import { CartItem } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'

type CheckoutKind = 'order' | 'subscription'

function configuredClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Payments are not configured yet. Add the Supabase environment variables first.')
  }
  return supabase
}

export async function beginCheckout(items: CartItem[], kind: CheckoutKind = 'order', shippingAddress?: string) {
  const client = configuredClient()
  const { data, error } = await client.functions.invoke('create-checkout-session', { body: { items, kind, shippingAddress } })
  if (error) throw error
  if (!data?.url || typeof data.url !== 'string') throw new Error('Stripe did not return a checkout link.')
  return data.url
}

export async function getCheckoutStatus(sessionId: string) {
  const client = configuredClient()
  const { data, error } = await client.functions.invoke('checkout-status', { body: { sessionId } })
  if (error) throw error
  return data as { paid: boolean; orderId?: string; status?: string }
}

export async function manageSubscription(action: 'pause' | 'resume' | 'cancel') {
  const client = configuredClient()
  const { data, error } = await client.functions.invoke('manage-subscription', { body: { action } })
  if (error) throw error
  return data
}
