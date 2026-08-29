import React, { useMemo } from 'react'
import AppShell from '../components/AppShell'
import ProductCard from '../components/ProductCard'
import { useActiveShelfProducts, useApp } from '../context/AppContext'
import { PRODUCTS } from '../data/products'
import { EDITORIAL_IMAGES } from '../data/editorialImages'

const Shop: React.FC = () => {
  const { user, skinProfile } = useApp()
  const shelfProducts = useActiveShelfProducts()
  const ownedIds = new Set(shelfProducts.map((p) => p.id))
  const budget = user?.monthlyBudget ?? 40

  const recommended = useMemo(
    () => PRODUCTS.filter((p) => p.concerns.some((c) => skinProfile.concerns.includes(c)) && p.availability === 'available').slice(0, 4),
    [skinProfile.concerns],
  )
  const completeRoutine = useMemo(() => PRODUCTS.filter((p) => !ownedIds.has(p.id) && p.category === 'Face' && p.availability === 'available'), [ownedIds])
  const underBudget = useMemo(() => PRODUCTS.filter((p) => p.price <= budget && p.availability === 'available'), [budget])
  const verifiedSustainable = useMemo(() => PRODUCTS.filter((p) => p.sustainablePackaging === 'verified'), [])
  const nightRenewal = useMemo(() => PRODUCTS.filter((p) => p.collection === 'Night Renewal'), [])
  const mensLine = useMemo(() => PRODUCTS.filter((p) => p.collection === "Men's Line"), [])

  return (
    <AppShell>
      <div className="container-page max-w-6xl py-8 sm:py-12">
        <section className="relative isolate overflow-hidden rounded-3xl border border-white/45 px-6 py-9 shadow-card sm:px-10 sm:py-12">
          <img
            src={EDITORIAL_IMAGES.aloe.src}
            alt=""
            aria-hidden="true"
            className="editorial-photo absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
          />
          <div className="editorial-wash absolute inset-0 -z-10" />
          <p className="eyebrow">Shop</p>
          <h1 className="mt-1 max-w-2xl font-display text-3xl text-forest-800 sm:text-4xl">Built around your profile, not a generic catalog.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal/65">Formula-led care selected for your concerns, with space for what is already working on your shelf.</p>
        </section>

        <ShopSection title="Recommended for you" products={recommended} owned={ownedIds} contextLabel="For your concerns" />
        <ShopSection title="Complete your routine" products={completeRoutine} owned={ownedIds} contextLabel="Fills a gap" />
        <section className="relative isolate mt-12 overflow-hidden rounded-2xl px-6 py-12 sm:px-10 sm:py-16">
          <img
            src={EDITORIAL_IMAGES.dew.src}
            alt={EDITORIAL_IMAGES.dew.alt}
            className="editorial-photo absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-forest-900/60" />
          <div className="max-w-lg">
            <p className="eyebrow text-cream-300">Ingredient-led care</p>
            <h2 className="mt-2 font-display text-3xl text-cream-100">Let your routine be as considered as your shelf.</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/85">Start with what you own, then find additions that have a clear place in your routine.</p>
          </div>
        </section>
        <ShopSection title={`Under your $${budget} budget`} products={underBudget} owned={ownedIds} contextLabel="In budget" />
        <ShopSection title="Verified sustainable" products={verifiedSustainable} owned={ownedIds} contextLabel="Verified" />
        <ShopSection title="Night Renewal collection" products={nightRenewal} owned={ownedIds} />
        <ShopSection title="Core range" products={PRODUCTS.filter((p) => p.category !== "Men's Line")} owned={ownedIds} />
        <ShopSection
          title="Men's Line"
          products={mensLine}
          owned={ownedIds}
          note="Emerging collection — proposed, inventory not yet available."
        />
      </div>
    </AppShell>
  )
}

const ShopSection: React.FC<{
  title: string
  products: typeof PRODUCTS
  owned: Set<string>
  contextLabel?: string
  note?: string
}> = ({ title, products, owned, contextLabel, note }) => {
  if (products.length === 0) return null
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-xl text-forest-800">{title}</h2>
        {note && <span className="text-xs text-charcoal/45">{note}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} owned={owned.has(p.id)} contextLabel={owned.has(p.id) ? undefined : contextLabel} />
        ))}
      </div>
    </section>
  )
}

export default Shop
