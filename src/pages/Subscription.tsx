import React, { useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import ProductVisual from '../components/ProductVisual'
import { useActiveShelfProducts, useApp } from '../context/AppContext'
import { PRODUCTS, findProduct } from '../data/products'
import { beginCheckout, manageSubscription } from '../lib/commerce'

const Subscription: React.FC = () => {
  const { subscription, setSubscription, user, skinProfile, backendConfigured, trackEvent } = useApp()
  const shelfProducts = useActiveShelfProducts()
  const budget = user?.monthlyBudget ?? 40
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const curatedBox = useMemo(() => {
    type BoxItem = { productId: string; reason: string; type: 'owned' | 'replacement' | 'new' }
    const owned: BoxItem[] = shelfProducts.slice(0, 1).map((p) => ({ productId: p.id, reason: 'Already in your routine — kept as-is.', type: 'owned' }))
    const gapCandidates = PRODUCTS.filter(
      (p) => p.availability === 'available' && !shelfProducts.some((s) => s.id === p.id) && p.concerns.some((c) => skinProfile.concerns.includes(c)),
    )
    const picks: BoxItem[] = [...owned]
    let spent = 0
    for (const p of gapCandidates) {
      if (spent + p.price > budget) continue
      picks.push({ productId: p.id, reason: `Closes a gap for ${p.concerns.filter((c) => skinProfile.concerns.includes(c)).join(', ').toLowerCase()}.`, type: 'new' })
      spent += p.price
      if (picks.length >= 3) break
    }
    return picks
  }, [shelfProducts, skinProfile.concerns, budget])

  const activeBox = subscription.status === 'active' || subscription.status === 'paused' ? subscription.products : curatedBox
  const total = activeBox.reduce((sum, item) => {
    const t = item.type === 'owned' ? 0 : (findProduct(item.productId)?.price ?? 0)
    return sum + t
  }, 0)

  const start = async () => {
    if (!backendConfigured) {
      setSubscription({ status: 'active', products: curatedBox, budget, nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString() })
      return
    }
    const items = curatedBox.filter((item) => item.type !== 'owned').map((item) => ({ productId: item.productId, quantity: 1 }))
    if (!items.length) {
      setError('Your box only contains products you already own. Add a new recommendation before starting a subscription.')
      return
    }
    try {
      setProcessing(true)
      setError('')
      trackEvent('subscription_checkout_started', { item_count: items.length, value: total })
      window.location.assign(await beginCheckout(items, 'subscription'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not start subscription checkout.')
      setProcessing(false)
    }
  }
  const changeSubscription = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!backendConfigured) {
      if (action === 'pause') setSubscription({ ...subscription, status: 'paused' })
      if (action === 'resume') setSubscription({ ...subscription, status: 'active' })
      if (action === 'cancel') setSubscription({ status: 'none', products: [], budget: 0, nextBillingDate: '' })
      return
    }
    try {
      setProcessing(true)
      setError('')
      await manageSubscription(action)
      if (action === 'pause') setSubscription({ ...subscription, status: 'paused' })
      if (action === 'resume') setSubscription({ ...subscription, status: 'active' })
      if (action === 'cancel') setSubscription({ status: 'cancelled', products: subscription.products, budget: subscription.budget, nextBillingDate: subscription.nextBillingDate })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not update your subscription.')
    } finally {
      setProcessing(false)
    }
  }
  const skipMonth = () => setSubscription({ ...subscription, nextBillingDate: new Date(Date.now() + 60 * 86400000).toISOString() })

  return (
    <AppShell>
      <div className="bg-forest-800 py-14 text-center">
        <div className="container-page">
          <p className="eyebrow text-cream-300">Subscription</p>
          <h1 className="mt-2 font-display text-3xl text-cream-100 sm:text-4xl">Your routine, delivered.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-cream-200/80">
            A personalised box curated around your skin, shelf and budget.
          </p>
        </div>
      </div>

      <div className="container-page max-w-3xl py-10">
        {subscription.status === 'none' && (
          <div className="card p-6 text-center">
            <p className="text-sm text-charcoal/60">You don't have an active subscription yet. Here's what this month's box would look like.</p>
          </div>
        )}
        {subscription.status === 'active' && (
          <div className="card flex items-center justify-between p-4">
            <span className="text-sm font-semibold text-forest-700">Subscription active</span>
            <span className="text-xs text-charcoal/50">Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}</span>
          </div>
        )}
        {subscription.status === 'paused' && (
          <div className="card flex items-center justify-between bg-gold/10 p-4">
            <span className="text-sm font-semibold text-gold-dark">Subscription paused</span>
          </div>
        )}

        <section className="mt-6">
          <h2 className="mb-3 font-display text-xl text-forest-800">This month's box</h2>
          <div className="space-y-3">
            {activeBox.map((item) => {
              const p = findProduct(item.productId)
              if (!p) return null
              return (
                <div key={item.productId} className="card flex gap-4 p-4">
                  <ProductVisual shape={p.image} accent={p.accent} className="h-16 w-16 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-base text-charcoal">{p.name}</p>
                      <span className="text-xs font-semibold text-forest-500 capitalize">{item.type === 'owned' ? 'Already owned' : item.type === 'replacement' ? 'Replacement' : 'New recommendation'}</span>
                    </div>
                    <p className="mt-1 text-sm text-charcoal/60">{item.reason}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card mt-4 flex items-center justify-between p-4">
            <span className="text-sm font-semibold text-charcoal">Total</span>
            <span className="font-display text-xl text-forest-800">${total}</span>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          {subscription.status === 'none' && (
            <button className="btn-primary" onClick={start} disabled={processing}>
              {processing ? 'Opening secure checkout…' : backendConfigured ? 'Continue to secure payment' : 'Start demo subscription'}
            </button>
          )}
          {subscription.status === 'active' && (
            <>
              <button className="btn-secondary" onClick={skipMonth}>
                Skip month
              </button>
              <button className="btn-secondary" onClick={() => void changeSubscription('pause')} disabled={processing}>
                Pause subscription
              </button>
              <button className="btn-secondary text-clay" onClick={() => void changeSubscription('cancel')} disabled={processing}>
                Cancel subscription
              </button>
            </>
          )}
          {subscription.status === 'paused' && (
            <>
              <button className="btn-primary" onClick={() => void changeSubscription('resume')} disabled={processing}>
                Resume subscription
              </button>
              <button className="btn-secondary text-clay" onClick={() => void changeSubscription('cancel')} disabled={processing}>
                Cancel subscription
              </button>
            </>
          )}
        </div>
        {error && <p className="mt-4 text-sm font-medium text-clay">{error}</p>}
      </div>
    </AppShell>
  )
}

export default Subscription
