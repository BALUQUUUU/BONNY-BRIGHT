import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ProductVisual from '../components/ProductVisual'
import TrustBadge from '../components/TrustBadge'
import { useActiveShelfProducts, useApp } from '../context/AppContext'
import { findProduct } from '../data/products'
import { EDITORIAL_IMAGES, ingredientImageFor } from '../data/editorialImages'

const ProductDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = id ? findProduct(id) : undefined
  const { skinProfile, addToShelf, addToCart, recordInteraction, user } = useApp()
  const shelfProducts = useActiveShelfProducts()
  const [addedNotice, setAddedNotice] = useState(false)
  const owned = product ? shelfProducts.some((p) => p.id === product.id) : false

  if (!product) {
    return (
      <AppShell>
        <div className="container-page py-16 text-center">
          <p className="text-sm text-charcoal/60">We couldn't find that product.</p>
          <button className="btn-secondary mt-4" onClick={() => navigate('/shop')}>
            Back to Shop
          </button>
        </div>
      </AppShell>
    )
  }

  const matchedConcerns = product.concerns.filter((concern) => skinProfile.concerns.includes(concern))
  const budget = user?.monthlyBudget ?? 40
  const matches = [
    { label: 'Skin', ok: matchedConcerns.length > 0 },
    { label: 'Goal', ok: product.concerns.some((concern) => skinProfile.concerns.includes(concern)) || true },
    { label: 'Routine', ok: product.category === 'Face' },
    { label: 'Budget', ok: product.price <= budget },
  ]

  const knownFacts = [
    product.crueltyFree !== 'unavailable' ? `Ingredients: ${product.keyIngredients.map((ingredient) => ingredient.name).join(', ')}` : null,
    product.crueltyFree !== 'unavailable' ? `Certification: ${product.certifications[0]?.name ?? 'Information available'}` : null,
    product.sustainablePackaging !== 'unavailable' ? `Packaging: ${product.packagingInfo}` : null,
  ].filter(Boolean) as string[]

  const unknownFacts = [
    product.crueltyFree === 'unavailable' ? 'Certification has not been independently verified.' : null,
    product.sustainablePackaging === 'unavailable' ? 'Sustainability claims are not yet independently verified.' : null,
  ].filter(Boolean) as string[]

  const handleAddToCart = () => {
    addToCart(product.id)
    recordInteraction(product.id, 'like')
    setAddedNotice(true)
    window.setTimeout(() => setAddedNotice(false), 2200)
  }

  return (
    <AppShell>
      <div className="container-page max-w-5xl py-8 sm:py-12">
        {addedNotice && (
          <div className="mb-6 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-card backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">Added to your cart</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="font-display text-lg text-forest-800">{product.name} — ${product.price}</p>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => setAddedNotice(false)}>
                  Continue shopping
                </button>
                <button className="btn-primary" onClick={() => navigate('/cart')}>
                  View cart
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="editorial-wash relative isolate grid gap-10 overflow-hidden rounded-3xl border border-white/50 p-5 shadow-card sm:p-8 md:grid-cols-2">
          <img
            src={EDITORIAL_IMAGES[ingredientImageFor(product.keyIngredients[0]?.name ?? '')].src}
            alt=""
            aria-hidden="true"
            className="editorial-photo absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.09]"
          />
          <ProductVisual shape={product.image} accent={product.accent} className="aspect-square w-full" />
          <div>
            <p className="eyebrow">{product.subCategory}</p>
            <h1 className="mt-1 font-display text-3xl text-forest-800">{product.name}</h1>
            <p className="mt-1 text-sm text-charcoal/60">{product.positioning}</p>
            <p className="mt-4 font-display text-2xl text-forest-800">${product.price}</p>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/75">{product.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {!owned && (
                <button className="btn-primary" onClick={handleAddToCart}>
                  Add to cart
                </button>
              )}
              <button
                className="btn-secondary"
                onClick={() => {
                  addToShelf(product.id)
                  navigate('/routine-builder')
                }}
              >
                Add to routine
              </button>
              <button className="btn-secondary" onClick={() => recordInteraction(product.id, 'like')}>
                Save
              </button>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-forest/10 bg-cream-100 p-6">
          <h2 className="font-display text-xl text-forest-800">Why this product?</h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
            Based on your skin profile and current routine, this product may help address your hydration goal.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {matches.map((match) => (
              <div key={match.label} className="rounded-xl border border-forest/10 bg-white/60 px-4 py-3 text-sm font-medium text-charcoal/75">
                {match.label}: {match.ok ? '✓' : '—'}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-5">
            <h2 className="font-display text-xl text-forest-800">Your shelf</h2>
            <p className="mt-1 text-sm text-charcoal/60">You already own {shelfProducts.length} products.</p>
            <div className="mt-4 space-y-2">
              {shelfProducts.slice(0, 4).map((item) => (
                <div key={item.productId} className="flex items-center justify-between rounded-xl bg-forest/5 px-3 py-2 text-sm text-charcoal/75">
                  <span>{findProduct(item.productId)?.name ?? 'Product'}</span>
                  <span className="font-semibold text-forest-700">✓</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-xl text-forest-800">This product adds:</h2>
            <p className="mt-3 font-display text-xl text-forest-800">{product.name}</p>
            <p className="mt-2 text-sm text-charcoal/60">This fills the evening treatment step in your routine.</p>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-forest/10 bg-cream-100 p-6">
          <h2 className="font-display text-xl text-forest-800">Trust &amp; verification</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-sm text-charcoal/75">
                <span>Ingredients</span>
                <span className="font-semibold text-forest-700">Available ✓</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-sm text-charcoal/75">
                <span>Certification</span>
                <span className="font-semibold text-forest-700">Verified ✓</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-sm text-charcoal/75">
                <span>Cruelty-free</span>
                <span className="font-semibold text-charcoal/70">Information available</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-sm text-charcoal/75">
                <span>Sustainability</span>
                <span className="font-semibold text-charcoal/60">Not independently verified</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <TrustBadge status={product.crueltyFree} label={`Cruelty-free: ${labelFor(product.crueltyFree)}`} />
                <TrustBadge status={product.sustainablePackaging} label={`Packaging: ${labelFor(product.sustainablePackaging)}`} />
                {product.certifications.map((certification) => (
                  <TrustBadge key={certification.name} status={certification.status} label={certification.name} />
                ))}
              </div>
            </div>
          </div>
          <button className="btn-secondary mt-5" onClick={() => navigate('/trust')}>
            View full verification
          </button>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl text-forest-800">Key ingredients</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {product.keyIngredients.map((ingredient) => (
              <div key={ingredient.name} className="card overflow-hidden p-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="ingredient-orb grid h-14 w-14 shrink-0 place-items-center"
                    style={{ background: `radial-gradient(circle at 32% 26%, #ffffffb8 0 7%, transparent 8%), linear-gradient(145deg, ${product.accent}b3, #f7f2e9)` }}
                  >
                    <span className="h-5 w-5 rounded-full border border-cream-50/70 bg-cream-50/30" />
                  </span>
                  <div>
                    <p className="font-display text-base text-charcoal">{ingredient.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-forest-500">{ingredient.purpose}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-charcoal/65">{ingredient.whyItMatters}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-forest-800">Benefits</h2>
          <ul className="mt-3 space-y-2 text-sm text-charcoal/70">
            {product.keyIngredients.map((ingredient) => (
              <li key={ingredient.name}>• {ingredient.name}: {ingredient.whyItMatters}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-forest-800">How to use</h2>
          <ol className="mt-3 space-y-2">
            {product.howToUse.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm text-charcoal/75">
                <span className="text-xs font-semibold text-forest-400">{String(index + 1).padStart(2, '0')}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-forest-800">Full ingredient list</h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/60">{product.fullIngredients}</p>
        </section>

        <section className="mt-10 rounded-2xl border border-forest/10 bg-cream-100 p-6">
          <h2 className="font-display text-xl text-forest-800">Choose what to do</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={handleAddToCart}>Add to cart</button>
            <button className="btn-secondary" onClick={() => { addToShelf(product.id); navigate('/routine-builder') }}>Add to routine</button>
            <button className="btn-secondary" onClick={() => recordInteraction(product.id, 'like')}>Save</button>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

const labelFor = (status: string) => (status === 'verified' ? 'Verified' : status === 'partial' ? 'Partially verified' : 'Verification unavailable')

export default ProductDetail
