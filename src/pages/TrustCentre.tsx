import React from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ProductVisual from '../components/ProductVisual'
import TrustBadge from '../components/TrustBadge'
import { PRODUCTS } from '../data/products'

const TrustCentre: React.FC = () => {
  const navigate = useNavigate()
  return (
    <AppShell>
      <div className="bg-forest-800 py-14 text-center">
        <div className="container-page">
          <p className="eyebrow text-cream-300">Trust Centre</p>
          <h1 className="mt-2 font-display text-3xl text-cream-100 sm:text-4xl">Don't just take our word for it.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-cream-200/80">
            See exactly what has been verified about the products you use — and what hasn't.
          </p>
        </div>
      </div>

      <div className="container-page max-w-5xl py-10">
        <div className="mb-8 flex flex-wrap gap-3 text-xs">
          <span className="chip chip-active">✓ Verified — independently confirmed</span>
          <span className="chip">! Partially verified — some evidence, not complete</span>
          <span className="chip">? Information unavailable — not yet confirmed</span>
        </div>

        <div className="space-y-4">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="card flex flex-col gap-4 p-5 sm:flex-row">
              <button onClick={() => navigate(`/product/${p.id}`)} className="shrink-0">
                <ProductVisual shape={p.image} accent={p.accent} className="h-24 w-24" />
              </button>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-lg text-charcoal">{p.name}</p>
                  <button onClick={() => navigate(`/product/${p.id}`)} className="text-xs font-semibold text-forest-600 hover:underline">
                    Full profile →
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <TrustBadge status={p.crueltyFree} label={`Cruelty-free — ${p.crueltyFree}`} />
                  <TrustBadge status={p.sustainablePackaging} label={`Sustainability — ${p.sustainablePackaging}`} />
                  {p.certifications.map((c) => (
                    <TrustBadge key={c.name} status={c.status} label={c.name} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-charcoal/50">
                  <span className="font-semibold text-charcoal/70">Brand claim vs. verified:</span> {p.packagingInfo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

export default TrustCentre
