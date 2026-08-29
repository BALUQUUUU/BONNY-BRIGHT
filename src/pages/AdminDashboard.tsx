import React, { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { SalesDashboardMetrics } from '../types'
import { supabase } from '../lib/supabase'

type ProductMetric = { product_name: string; units_sold: number; revenue_cents: number }
type FunnelMetric = { event_name: string; event_count: number; users: number }
type InventoryAlert = { product_name: string; stock_quantity: number; low_stock_threshold: number; status: string }
type ConversionMetric = { routine_users: number; purchasers: number; conversion_percent: number }

const emptyMetrics: SalesDashboardMetrics = {
  dailyRevenueCents: 0,
  weeklyRevenueCents: 0,
  monthlyRevenueCents: 0,
  paidOrders: 0,
  averageOrderValueCents: 0,
  activeSubscriptions: 0,
  pausedSubscriptions: 0,
  cancelledSubscriptions: 0,
  monthlyRecurringRevenueCents: 0,
}

const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState(emptyMetrics)
  const [products, setProducts] = useState<ProductMetric[]>([])
  const [funnel, setFunnel] = useState<FunnelMetric[]>([])
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([])
  const [conversion, setConversion] = useState<ConversionMetric>({ routine_users: 0, purchasers: 0, conversion_percent: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setError('Connect Supabase to load live sales data.')
      setLoading(false)
      return
    }
    void Promise.all([
      supabase.from('sales_dashboard_metrics').select('*').single(),
      supabase.from('sales_by_product').select('*').order('revenue_cents', { ascending: false }).limit(8),
      supabase.from('personalization_funnel').select('*').order('event_count', { ascending: false }),
      supabase.from('inventory_alerts').select('*').order('stock_quantity', { ascending: true }),
      supabase.from('personalization_conversion').select('*').single(),
    ])
      .then(([metricsResult, productsResult, funnelResult, inventoryResult, conversionResult]) => {
        if (metricsResult.error) throw metricsResult.error
        const row = metricsResult.data
        setMetrics({
          dailyRevenueCents: Number(row.daily_revenue_cents),
          weeklyRevenueCents: Number(row.weekly_revenue_cents),
          monthlyRevenueCents: Number(row.monthly_revenue_cents),
          paidOrders: Number(row.paid_orders),
          averageOrderValueCents: Number(row.average_order_value_cents),
          activeSubscriptions: Number(row.active_subscriptions),
          pausedSubscriptions: Number(row.paused_subscriptions),
          cancelledSubscriptions: Number(row.cancelled_subscriptions),
          monthlyRecurringRevenueCents: Number(row.monthly_recurring_revenue_cents),
        })
        if (productsResult.error) throw productsResult.error
        if (funnelResult.error) throw funnelResult.error
        if (inventoryResult.error) throw inventoryResult.error
        if (conversionResult.error) throw conversionResult.error
        setProducts((productsResult.data ?? []) as ProductMetric[])
        setFunnel((funnelResult.data ?? []) as FunnelMetric[])
        setInventoryAlerts((inventoryResult.data ?? []) as InventoryAlert[])
        setConversion(conversionResult.data as ConversionMetric)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load sales data.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell>
      <div className="container-page py-8 sm:py-12">
        <p className="eyebrow">Staff only</p>
        <h1 className="mt-1 font-display text-3xl text-forest-800">Sales &amp; personalization</h1>
        <p className="mt-2 text-sm text-charcoal/60">Live figures are recorded only after verified Stripe webhook events.</p>

        {loading && <p className="mt-8 text-sm text-charcoal/60">Loading live metrics…</p>}
        {error && <div className="card mt-7 border border-gold/30 bg-gold/10 p-5 text-sm text-charcoal/70">{error}</div>}
        {!loading && !error && (
          <>
            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Today" value={money(metrics.dailyRevenueCents)} />
              <Metric label="This month" value={money(metrics.monthlyRevenueCents)} />
              <Metric label="Average order value" value={money(metrics.averageOrderValueCents)} />
              <Metric label="MRR" value={money(metrics.monthlyRecurringRevenueCents)} />
            </section>
            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Paid orders this month" value={String(metrics.paidOrders)} />
              <Metric label="Active subscriptions" value={String(metrics.activeSubscriptions)} />
              <Metric label="Paused / cancelled" value={`${metrics.pausedSubscriptions} / ${metrics.cancelledSubscriptions}`} />
              <Metric label="Routine-to-purchase conversion" value={`${conversion.conversion_percent}%`} />
            </section>
            <section className="mt-9 grid gap-6 lg:grid-cols-2">
              <div className="card p-5">
                <h2 className="font-display text-xl text-forest-800">Best-selling products</h2>
                <div className="mt-4 space-y-3">
                  {products.length ? products.map((product) => (
                    <div key={product.product_name} className="flex items-center justify-between border-b border-forest/10 pb-3 text-sm last:border-0 last:pb-0">
                      <div><p className="font-medium text-charcoal">{product.product_name}</p><p className="text-xs text-charcoal/50">{product.units_sold} units sold</p></div>
                      <span className="font-semibold text-forest-700">{money(product.revenue_cents)}</span>
                    </div>
                  )) : <p className="text-sm text-charcoal/60">No paid orders yet.</p>}
                </div>
              </div>
              <div className="card p-5">
                <h2 className="font-display text-xl text-forest-800">Personalization funnel</h2>
                <div className="mt-4 space-y-3">
                  {funnel.length ? funnel.map((event) => (
                    <div key={event.event_name} className="flex items-center justify-between border-b border-forest/10 pb-3 text-sm last:border-0 last:pb-0">
                      <span className="capitalize text-charcoal">{event.event_name.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-forest-700">{event.users} users · {event.event_count} events</span>
                    </div>
                  )) : <p className="text-sm text-charcoal/60">No funnel events yet.</p>}
                </div>
              </div>
            </section>
            <section className="card mt-6 p-5">
              <h2 className="font-display text-xl text-forest-800">Inventory alerts</h2>
              <div className="mt-4 space-y-3">
                {inventoryAlerts.length ? inventoryAlerts.map((item) => (
                  <div key={item.product_name} className="flex items-center justify-between border-b border-forest/10 pb-3 text-sm last:border-0 last:pb-0">
                    <span className="font-medium text-charcoal">{item.product_name}</span>
                    <span className="font-semibold text-clay">{item.stock_quantity === 0 ? 'Out of stock' : `${item.stock_quantity} left (threshold ${item.low_stock_threshold})`}</span>
                  </div>
                )) : <p className="text-sm text-forest-600">All products are above their low-stock threshold.</p>}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-forest-500">{label}</p><p className="mt-2 font-display text-2xl text-forest-800">{value}</p></div>
)

export default AdminDashboard
