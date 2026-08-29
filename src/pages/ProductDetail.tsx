import React from 'react'
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
  const { skinProfile, addToShelf, addToCart, recordInteraction } = useApp()
  const shelfProducts = useActiveShelfProducts()
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

  const matchedConcerns = product.concerns.filter((c) => skinProfile.concerns.includes(c))
  const suits =
    matchedConcerns.length > 0
      ? `This targets ${matchedConcerns.join(', ').toLowerCase()}, which you've told us are concerns for you, and it's formulated for ${skinProfile.skinType.toLowerCase()} skin.`
      : `Formulated for ${product.skinTypes.join(', ').toLowerCase()} skin types.`

  const knownFacts = [
    product.crueltyFree !== 'unavailable' ? `Cruelty-free status: ${product.crueltyFree}` : null,
    product.sustainablePackaging !== 'unavailable' ? `Packaging: ${product.packagingInfo}` : null,
  ].filter(Boolean) as string[]
  const unknownFacts = [
    product.crueltyFree === 'unavailable' ? 'Cruelty-free status has not been independently verified.' : null,
    product.sustainablePackaging === 'unavailable' ? 'Sustainability claims for packaging are not yet verified.' : null,
  ].filter(Boolean) as string[]

  return (
    <AppShell>
      <div className="container-page max-w-5xl py-8 sm:py-12">
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
            <p className="mt-4 font-display text-2xl text-forest-800">{owned ? 'Owned' : `$${product.price}`}</p>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/75">{product.description}</p>

            {product.availability === 'unavailable' ? (
              <p className="mt-6 rounded-xl bg-charcoal/5 px-4 py-3 text-sm font-medium text-charcoal/60">
                This item isn't available yet — it's part of a proposed collection.
              </p>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                {!owned && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      addToCart(product.id)
                      recordInteraction(product.id, 'like')
                    }}
                  >
                    Buy Now
                  </button>
                )}
                <button className="btn-secondary" onClick={() => addToShelf(product.id)}>
                  Add to Shelf
                </button>
                <button className="btn-secondary" onClick={() => navigate('/routine-builder')}>
                  Add to Routine
                </button>
              </div>
            )}

            <div className="mt-6 rounded-xl bg-forest/5 p-4">
              <p className="eyebrow mb-1">Why it may suit you</p>
              <p className="text-sm leading-relaxed text-charcoal/80">{suits}</p>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl text-forest-800">Key ingredients</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {product.keyIngredients.map((ing) => (
              <div key={ing.name} className="card overflow-hidden p-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="ingredient-orb grid h-14 w-14 shrink-0 place-items-center"
                    style={{ background: `radial-gradient(circle at 32% 26%, #ffffffb8 0 7%, transparent 8%), linear-gradient(145deg, ${product.accent}b3, #f7f2e9)` }}
                  >
                    <span className="h-5 w-5 rounded-full border border-cream-50/70 bg-cream-50/30" />
                  </span>
                  <div>
                    <p className="font-display text-base text-charcoal">{ing.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-forest-500">{ing.purpose}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-charcoal/65">{ing.whyItMatters}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-forest-800">How to use</h2>
          <ol className="mt-3 space-y-2">
            {product.howToUse.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-charcoal/75">
                <span className="text-xs font-semibold text-forest-400">{String(i + 1).padStart(2, '0')}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-forest-800">Full ingredients</h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/60">{product.fullIngredients}</p>
        </section>

        <section className="mt-10 rounded-2xl border border-forest/10 bg-cream-100 p-6">
          <h2 className="font-display text-xl text-forest-800">Trust &amp; verification</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <TrustBadge status={product.crueltyFree} label={`Cruelty-free: ${labelFor(product.crueltyFree)}`} />
            <TrustBadge status={product.sustainablePackaging} label={`Sustainability claim: ${labelFor(product.sustainablePackaging)}`} />
            {product.certifications.map((c) => (
              <TrustBadge key={c.name} status={c.status} label={c.name} />
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-600">What we know</p>
              <ul className="space-y-1.5 text-sm text-charcoal/70">
                {knownFacts.length ? knownFacts.map((f, i) => <li key={i}>• {f}</li>) : <li className="text-charcoal/40">Nothing independently confirmed yet.</li>}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal/50">What we don't know</p>
              <ul className="space-y-1.5 text-sm text-charcoal/60">
                {unknownFacts.length ? unknownFacts.map((f, i) => <li key={i}>• {f}</li>) : <li className="text-charcoal/40">Nothing outstanding — see certifications above.</li>}
              </ul>
            </div>
          </div>
        </section>

        <div className="mt-10 flex gap-4">
          <button
            onClick={() => {
              recordInteraction(product.id, 'like')
              navigate('/discover')
            }}
            className="btn-secondary"
          >
            ❤️ Like
          </button>
          <button
            onClick={() => {
              recordInteraction(product.id, 'dislike')
              navigate('/discover')
            }}
            className="btn-secondary"
          >
            ✕ Not for me
          </button>
        </div>
      </div>
    </AppShell>
  )
}

const labelFor = (s: string) => (s === 'verified' ? 'Verified' : s === 'partial' ? 'Partially verified' : 'Verification unavailable')

export default ProductDetail
