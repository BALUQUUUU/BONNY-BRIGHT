import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Product } from '../types'
import ProductVisual from './ProductVisual'
import TrustBadge from './TrustBadge'

interface Props {
  product: Product
  owned?: boolean
  contextLabel?: string
  compact?: boolean
  matchPercent?: number
  notes?: string[]
}

const ProductCard: React.FC<Props> = ({ product, owned, contextLabel, compact, matchPercent, notes = [] }) => {
  const navigate = useNavigate()
  const unavailable = product.availability === 'unavailable'
  const strength = typeof matchPercent === 'number' ? Math.min(99, Math.max(72, matchPercent)) : 92

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl border border-forest/10 bg-cream-100 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative cursor-pointer" onClick={() => navigate(`/shop/product/${product.id}`)}>
        <ProductVisual shape={product.image} accent={product.accent} className={compact ? 'aspect-[4/3]' : 'aspect-square'} />
        {contextLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-forest-800/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream-100">
            {contextLabel}
          </span>
        )}
        {owned && (
          <span className="absolute right-3 top-3 rounded-full bg-cream-100 px-2.5 py-1 text-[10px] font-semibold text-forest-700 shadow-card">
            Already owned
          </span>
        )}
        {unavailable && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-charcoal/80 px-2.5 py-1 text-center text-[10px] font-semibold text-cream-100">
            Coming soon
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-forest-400">{product.subCategory}</p>
            <h3 className="mt-1 font-display text-base font-medium leading-snug text-charcoal">{product.name}</h3>
          </div>
          <span className="rounded-full bg-forest/10 px-2 py-1 text-[10px] font-semibold text-forest-700">{strength}% match</span>
        </div>

        <p className="line-clamp-2 text-sm text-charcoal/60">{product.positioning}</p>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-display text-base text-forest-800">{owned ? 'Owned' : `$${product.price}`}</span>
          <TrustBadge status={product.crueltyFree} label={product.crueltyFree === 'verified' ? 'Cruelty-free' : undefined} />
        </div>

        {notes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-medium text-forest-700">
            {notes.map((note) => (
              <span key={note} className="rounded-full bg-forest/5 px-2 py-1">
                ✓ {note}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          className="btn-secondary mt-2 w-full justify-center"
          onClick={() => navigate(`/shop/product/${product.id}`)}
        >
          View product
        </button>
      </div>
    </article>
  )
}

export default ProductCard
