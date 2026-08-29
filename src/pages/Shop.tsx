import React, { useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import ProductCard from '../components/ProductCard'
import { useActiveShelfProducts, useApp } from '../context/AppContext'
import { PRODUCTS } from '../data/products'
import { EDITORIAL_IMAGES } from '../data/editorialImages'

const categories = ['All', 'Face', 'Bath & Body', 'Cosmetics', "Men's Line"] as const

const Shop: React.FC = () => {
  const { user, skinProfile } = useApp()
  const shelfProducts = useActiveShelfProducts()
  const ownedIds = new Set(shelfProducts.map((p) => p.id))
  const budget = user?.monthlyBudget ?? 40
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('All')
  const [sort, setSort] = useState<'recommended' | 'low-high' | 'new' | 'popular'>('recommended')

  const allProducts = useMemo(
    () => PRODUCTS.filter((product) => product.availability === 'available' && !ownedIds.has(product.id)),
    [ownedIds],
  )

  const matchScore = (product: (typeof PRODUCTS)[number]) => {
    const overlap = product.concerns.filter((concern) => skinProfile.concerns.includes(concern)).length
    const budgetFit = product.price <= budget ? 18 : 0
    const routineFit = product.category === 'Face' ? 14 : 8
    const base = 70 + overlap * 10 + routineFit + budgetFit
    return Math.min(98, base)
  }

  const recommended = useMemo(
    () =>
      [...allProducts]
        .sort((a, b) => matchScore(b) - matchScore(a))
        .slice(0, 4)
        .map((product) => ({ ...product, matchScore: matchScore(product) })),
    [allProducts, budget, skinProfile.concerns],
  )

  const completeRoutine = useMemo(
    () =>
      allProducts
        .filter((product) => product.category === 'Face')
        .sort((a, b) => matchScore(b) - matchScore(a))
        .slice(0, 4),
    [allProducts, budget, skinProfile.concerns],
  )

  const underBudget = useMemo(
    () => allProducts.filter((product) => product.price <= budget).slice(0, 4),
    [allProducts, budget],
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    let list = allProducts.filter((product) => {
      const textMatch = !query || product.name.toLowerCase().includes(query) || product.positioning.toLowerCase().includes(query)
      const categoryMatch = activeCategory === 'All' || product.category === activeCategory
      return textMatch && categoryMatch
    })

    switch (sort) {
      case 'low-high':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'new':
        list = [...list].sort((a, b) => (b.collection ? 1 : 0) - (a.collection ? 1 : 0))
        break
      case 'popular':
        list = [...list].sort((a, b) => matchScore(b) - matchScore(a))
        break
      default:
        list = [...list].sort((a, b) => matchScore(b) - matchScore(a))
    }

    return list
  }, [activeCategory, allProducts, budget, search, skinProfile.concerns, sort])

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
          <h1 className="mt-1 max-w-2xl font-display text-3xl text-forest-800 sm:text-4xl">Discover products selected for your skin, routine and goals.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal/65">Thoughtful essentials, routine gaps and budget-friendly picks chosen around your profile.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-forest/10 bg-cream-100 p-4 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <label className="sr-only" htmlFor="shop-search">Search products</label>
              <input
                id="shop-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search: hydrating serum"
                className="w-full rounded-full border border-forest/15 bg-white px-4 py-2.5 text-sm text-charcoal outline-none ring-0 placeholder:text-charcoal/35 focus:border-forest-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/45">Sort</label>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as 'recommended' | 'low-high' | 'new' | 'popular')}
                className="rounded-full border border-forest/15 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-forest-500"
              >
                <option value="recommended">Recommended</option>
                <option value="low-high">Price: Low → High</option>
                <option value="new">New</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={category === activeCategory ? 'rounded-full bg-forest-800 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-cream-100' : 'rounded-full border border-forest/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal/60'}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <ShopSection title="Recommended for you" products={recommended} owned={ownedIds} contextLabel="For your concerns" />
        <ShopSection title="Complete your routine" products={completeRoutine} owned={ownedIds} contextLabel="Fills a gap" />
        <ShopSection title={`Within your budget`} products={underBudget} owned={ownedIds} contextLabel="Within budget" />

        <section className="relative isolate mt-12 overflow-hidden rounded-2xl px-6 py-12 sm:px-10 sm:py-16">
          <img
            src={EDITORIAL_IMAGES.dew.src}
            alt={EDITORIAL_IMAGES.dew.alt}
            className="editorial-photo absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-forest-900/60" />
          <div className="max-w-lg">
            <p className="eyebrow text-cream-300">Explore the catalogue</p>
            <h2 className="mt-2 font-display text-3xl text-cream-100">Everything you could add next.</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/85">Browse the full collection, then narrow by skin profile, routine gaps and values.</p>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-display text-xl text-forest-800">Explore all products</h2>
            <span className="text-sm text-charcoal/55">{filteredProducts.length} products</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                owned={ownedIds.has(product.id)}
                contextLabel={ownedIds.has(product.id) ? undefined : product.price <= budget ? 'Within budget' : 'For your routine'}
                matchPercent={matchScore(product)}
                notes={[product.price <= budget ? 'Within budget' : undefined, product.category === 'Face' ? 'Fits your routine' : undefined].filter(Boolean) as string[]}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

const ShopSection: React.FC<{
  title: string
  products: typeof PRODUCTS
  owned: Set<string>
  contextLabel?: string
}> = ({ title, products, owned, contextLabel }) => {
  if (products.length === 0) return null
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-xl text-forest-800">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            owned={owned.has(product.id)}
            contextLabel={owned.has(product.id) ? undefined : contextLabel}
            matchPercent={Math.min(98, 72 + product.concerns.length * 4)}
            notes={product.price <= 40 ? ['Within budget', 'Fits your routine'] : ['Fits your routine']}
          />
        ))}
      </div>
    </section>
  )
}

export default Shop
