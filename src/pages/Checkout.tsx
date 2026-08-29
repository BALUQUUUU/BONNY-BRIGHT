import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ProductVisual from '../components/ProductVisual'
import { useApp } from '../context/AppContext'
import { findProduct } from '../data/products'
import { beginCheckout, getCheckoutStatus } from '../lib/commerce'

type Step = 'cart' | 'delivery' | 'payment' | 'confirmation'

const Checkout: React.FC = () => {
  const { cart, removeFromCart, clearCart, user, backendConfigured, trackEvent } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('cart')
  const [address, setAddress] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const lineItems = cart.map((c) => ({ ...c, product: findProduct(c.productId) })).filter((c) => c.product)
  const subtotal = lineItems.reduce((sum, c) => sum + (c.product!.price * c.quantity), 0)
  const delivery = subtotal > 0 && subtotal < 50 ? 4 : 0
  const total = subtotal + delivery
  const budget = user?.monthlyBudget ?? 40

  const steps: Step[] = ['cart', 'delivery', 'payment', 'confirmation']
  const stepIndex = steps.indexOf(step)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!backendConfigured || params.get('checkout') !== 'success' || !sessionId) return
    setProcessing(true)
    void getCheckoutStatus(sessionId)
      .then((result) => {
        if (!result.paid) throw new Error('Your payment is still being confirmed. Please refresh this page in a moment.')
        clearCart()
        setStep('confirmation')
      })
      .catch((err) => setPaymentError(err instanceof Error ? err.message : 'We could not confirm this payment yet.'))
      .finally(() => setProcessing(false))
  }, [backendConfigured])

  const placeOrder = async () => {
    if (!backendConfigured) {
      clearCart()
      setStep('confirmation')
      return
    }
    try {
      setPaymentError('')
      setProcessing(true)
      trackEvent('checkout_started', { item_count: cart.length, total })
      const checkoutUrl = await beginCheckout(cart, 'order', address)
      window.location.assign(checkoutUrl)
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'We could not start secure checkout. Please try again.')
      setProcessing(false)
    }
  }

  if (step === 'confirmation') {
    return (
      <AppShell>
        <div className="container-page flex max-w-md flex-col items-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest text-2xl text-cream-100">✓</div>
          <h1 className="mt-6 font-display text-2xl text-forest-800">Your routine is on its way.</h1>
          <p className="mt-2 text-sm text-charcoal/60">Your payment is confirmed and your order is being prepared.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>
            <button className="btn-secondary" onClick={() => navigate('/home')}>
              View My Routine
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  if (lineItems.length === 0) {
    return (
      <AppShell>
        <div className="container-page max-w-md py-20 text-center">
          <p className="text-sm text-charcoal/60">Your cart is empty.</p>
          <button className="btn-primary mt-4" onClick={() => navigate('/shop')}>
            Go to Shop
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="container-page max-w-2xl py-8 sm:py-12">
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-forest-500">
          {steps.slice(0, 3).map((s, i) => (
            <React.Fragment key={s}>
              <span className={i <= stepIndex ? 'text-forest-800' : 'text-forest-300'}>{i + 1}. {s[0].toUpperCase() + s.slice(1)}</span>
              {i < 2 && <span className="text-forest-200">—</span>}
            </React.Fragment>
          ))}
        </div>

        {step === 'cart' && (
          <div>
            <h1 className="font-display text-2xl text-forest-800">Your cart</h1>
            <div className="mt-5 space-y-3">
              {lineItems.map((item) => (
                <div key={item.productId} className="card flex items-center gap-4 p-4">
                  <ProductVisual shape={item.product!.image} accent={item.product!.accent} className="h-16 w-16 shrink-0" />
                  <div className="flex-1">
                    <p className="font-display text-base text-charcoal">{item.product!.name}</p>
                    <p className="text-xs text-charcoal/50">Qty {item.quantity}</p>
                  </div>
                  <span className="font-display text-base text-forest-800">${item.product!.price * item.quantity}</span>
                  <button onClick={() => removeFromCart(item.productId)} className="text-xs font-semibold text-clay hover:underline">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <Summary subtotal={subtotal} delivery={delivery} total={total} budget={budget} />
            <button className="btn-primary mt-6 w-full" onClick={() => setStep('delivery')}>
              Continue to delivery
            </button>
          </div>
        )}

        {step === 'delivery' && (
          <div>
            <h1 className="font-display text-2xl text-forest-800">Delivery</h1>
            <div className="mt-5 space-y-3">
              <input className="input" placeholder="Full name" defaultValue={user?.name} />
              <input className="input" placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <input className="input" placeholder="City" />
              <input className="input" placeholder="Phone number" />
            </div>
            <Summary subtotal={subtotal} delivery={delivery} total={total} budget={budget} />
            <div className="mt-6 flex gap-3">
              <button className="btn-secondary" onClick={() => setStep('cart')}>
                Back
              </button>
              <button className="btn-primary flex-1" onClick={() => setStep('payment')}>
                Continue to payment
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div>
            <h1 className="font-display text-2xl text-forest-800">Payment</h1>
            {backendConfigured ? (
              <div className="card mt-5 p-5">
                <p className="font-semibold text-forest-800">Secure payment with Stripe</p>
                <p className="mt-1 text-sm text-charcoal/60">You’ll enter your card details on Stripe’s secure checkout page. Bonny &amp; Bright never handles your card number.</p>
              </div>
            ) : (
              <div className="card mt-5 p-5 text-sm text-charcoal/60">
                Payment is in prototype mode. Add the Supabase and Stripe configuration to enable real, secure checkout.
              </div>
            )}
            <Summary subtotal={subtotal} delivery={delivery} total={total} budget={budget} />
            {paymentError && <p className="mt-3 text-sm font-medium text-clay">{paymentError}</p>}
            <div className="mt-6 flex gap-3">
              <button className="btn-secondary" onClick={() => setStep('delivery')}>
                Back
              </button>
              <button className="btn-primary flex-1" onClick={placeOrder} disabled={processing}>
                {processing ? 'Confirming payment…' : backendConfigured ? 'Continue to secure payment' : 'Place demo order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

const Summary: React.FC<{ subtotal: number; delivery: number; total: number; budget: number }> = ({ subtotal, delivery, total, budget }) => (
  <div className="card mt-5 p-5">
    <div className="flex justify-between text-sm text-charcoal/70">
      <span>Subtotal</span>
      <span>${subtotal}</span>
    </div>
    <div className="mt-1 flex justify-between text-sm text-charcoal/70">
      <span>Delivery</span>
      <span>{delivery === 0 ? 'Free' : `$${delivery}`}</span>
    </div>
    <div className="mt-2 flex justify-between border-t border-forest/10 pt-2 font-semibold text-forest-800">
      <span>Total</span>
      <span>${total}</span>
    </div>
    <p className={`mt-2 text-xs font-medium ${total > budget ? 'text-clay' : 'text-forest-500'}`}>
      {total > budget ? `This is $${total - budget} over your monthly budget of $${budget}.` : `Within your $${budget} monthly budget.`}
    </p>
  </div>
)

export default Checkout
