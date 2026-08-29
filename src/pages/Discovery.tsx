import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ProductVisual from '../components/ProductVisual'
import { useApp } from '../context/AppContext'
import { PRODUCTS } from '../data/products'

const Discovery: React.FC = () => {
  const { recordInteraction } = useApp()
  const navigate = useNavigate()
  const deck = useMemo(() => PRODUCTS.filter((p) => p.availability === 'available'), [])
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)

  const current = deck[index % deck.length]

  const act = (type: 'like' | 'dislike' | 'skip') => {
    recordInteraction(current.id, type)
    setFeedback("We'll use this to improve future recommendations.")
    window.setTimeout(() => setFeedback(null), 1400)
    setIndex((i) => i + 1)
  }

  return (
    <AppShell>
      <div className="container-page max-w-md py-10 sm:py-14">
        <p className="eyebrow text-center">Discover</p>
        <h1 className="mt-1 text-center font-display text-2xl text-forest-800">Tell us what you like</h1>

        <div className="mt-8 card overflow-hidden">
          <button onClick={() => navigate(`/product/${current.id}`)} className="block w-full">
            <ProductVisual shape={current.image} accent={current.accent} className="aspect-square w-full" />
          </button>
          <div className="p-5">
            <p className="text-xs uppercase tracking-wide text-forest-400">{current.subCategory}</p>
            <h2 className="font-display text-xl text-charcoal">{current.name}</h2>
            <p className="mt-1 text-sm text-charcoal/60">{current.positioning}</p>
            <p className="mt-2 font-display text-lg text-forest-800">${current.price}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={() => act('dislike')} aria-label="Not for me" className="flex h-14 w-14 items-center justify-center rounded-full border border-forest/15 bg-cream-100 text-xl shadow-card transition hover:-translate-y-0.5">
            ✕
          </button>
          <button onClick={() => act('skip')} aria-label="Show me more" className="flex h-12 w-12 items-center justify-center rounded-full border border-forest/15 bg-cream-100 text-forest-600 shadow-card transition hover:-translate-y-0.5">
            →
          </button>
          <button onClick={() => act('like')} aria-label="Like" className="flex h-14 w-14 items-center justify-center rounded-full border border-forest/15 bg-cream-100 text-xl shadow-card transition hover:-translate-y-0.5">
            ❤️
          </button>
        </div>

        <div className="mt-4 h-5 text-center text-xs font-medium text-forest-500">{feedback}</div>
      </div>
    </AppShell>
  )
}

export default Discovery
