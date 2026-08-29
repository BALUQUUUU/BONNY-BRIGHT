import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ProductVisual from '../components/ProductVisual'
import { useApp } from '../context/AppContext'
import { PRODUCTS, findProduct } from '../data/products'
import { Product } from '../types'

const CATEGORY_ORDER: Product['category'][] = ['Face', 'Bath & Body', 'Cosmetics', "Men's Line"]

const Shelf: React.FC = () => {
  const { shelf, addToShelf, removeFromShelf, markShelfItemFinished, toggleShelfInRoutine } = useApp()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')

  const activeItems = shelf.filter((i) => i.status === 'active')
  const activeIds = new Set(activeItems.map((i) => i.productId))

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: activeItems.filter((i) => findProduct(i.productId)?.category === cat),
  })).filter((g) => g.items.length > 0)

  const searchResults = PRODUCTS.filter((p) => !activeIds.has(p.id) && p.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <AppShell>
      <div className="container-page max-w-4xl py-8 sm:py-12">
        <p className="eyebrow">My Shelf</p>
        <h1 className="mt-1 font-display text-3xl text-forest-800 sm:text-4xl">Products you already own.</h1>

        {activeItems.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-forest/25 p-10 text-center">
            <p className="text-sm text-charcoal/60">Your shelf is empty. Add what you already use so we don't recommend it again.</p>
            <button className="btn-primary mt-4" onClick={() => setShowAdd(true)}>
              + Add Product
            </button>
          </div>
        ) : (
          <>
            {grouped.map((group) => (
              <section key={group.category} className="mt-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-500">{group.category}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.items.map((item) => {
                    const product = findProduct(item.productId)
                    if (!product) return null
                    return (
                      <div key={item.productId} className="card flex gap-4 p-4">
                        <button onClick={() => navigate(`/product/${product.id}`)} className="shrink-0">
                          <ProductVisual shape={product.image} accent={product.accent} className="h-20 w-20" />
                        </button>
                        <div className="flex flex-1 flex-col">
                          <p className="text-[11px] uppercase tracking-wide text-forest-400">{product.subCategory}</p>
                          <p className="font-display text-base text-charcoal">{product.name}</p>
                          <label className="mt-1 flex items-center gap-1.5 text-xs text-charcoal/60">
                            <input
                              type="checkbox"
                              checked={item.inRoutine}
                              onChange={(e) => toggleShelfInRoutine(item.productId, e.target.checked)}
                              className="accent-forest-700"
                            />
                            In my routine
                          </label>
                          <div className="mt-auto flex flex-wrap gap-2 pt-2 text-xs">
                            <button className="font-semibold text-forest-700 hover:underline" onClick={() => navigate('/routine-builder')}>
                              Add to Routine
                            </button>
                            <button className="font-semibold text-forest-700 hover:underline" onClick={() => navigate(`/product/${product.id}`)}>
                              View Product
                            </button>
                            <button className="font-semibold text-gold-dark hover:underline" onClick={() => markShelfItemFinished(item.productId)}>
                              Mark as Finished
                            </button>
                            <button className="font-semibold text-clay hover:underline" onClick={() => removeFromShelf(item.productId)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}

            <button className="btn-secondary mt-8" onClick={() => setShowAdd(true)}>
              + Add Product
            </button>
          </>
        )}

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-0 sm:items-center sm:p-5" onClick={() => setShowAdd(false)}>
            <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-cream-100 p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg text-forest-800">Add to your shelf</h3>
                <button onClick={() => setShowAdd(false)} className="text-sm text-charcoal/50 hover:text-charcoal">
                  Close
                </button>
              </div>
              <input className="input" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
              <div className="mt-4 space-y-2">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      addToShelf(p.id)
                      setShowAdd(false)
                      setQuery('')
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-forest/10 p-3 text-left transition hover:bg-forest/5"
                  >
                    <ProductVisual shape={p.image} accent={p.accent} className="h-12 w-12 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">{p.name}</p>
                      <p className="text-xs text-charcoal/50">{p.subCategory}</p>
                    </div>
                  </button>
                ))}
                {query && searchResults.length === 0 && <p className="py-4 text-center text-sm text-charcoal/50">No matching products.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default Shelf
