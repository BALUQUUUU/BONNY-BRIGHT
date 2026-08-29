import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import BudgetSummary from '../components/BudgetSummary'
import { useApp } from '../context/AppContext'
import { buildRoutine, SUGGESTED_PROMPTS } from '../lib/recommendationEngine'
import { findProduct } from '../data/products'
import { Routine, RoutineStep } from '../types'

type Message = { role: 'user' | 'ai'; text: string }

const RoutineBuilder: React.FC = () => {
  const { skinProfile, shelf, user, saveRoutine, addToShelf, trackEvent } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const firstRoutineStarted = useRef(false)
  const isFirstRoutine = Boolean((location.state as { firstRoutine?: boolean } | null)?.firstRoutine)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: isFirstRoutine
        ? `Welcome, ${user?.name ?? 'there'} — I'm building your first routine from your skin profile.`
        : `Hi ${user?.name ?? ''}, what would you like help with today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [saved, setSaved] = useState(false)

  const budget = user?.monthlyBudget ?? 40

  const ask = (prompt: string) => {
    if (!prompt.trim()) return
    setMessages((m) => [...m, { role: 'user', text: prompt }])
    setInput('')
    setThinking(true)
    setSaved(false)
    trackEvent('routine_builder_started', { prompt_length: prompt.trim().length })
    window.setTimeout(() => {
      const r = buildRoutine({
        prompt,
        profile: skinProfile,
        shelf,
        budget,
        ethicalMustHaves: (user?.ethicalPreferences ?? []).filter((p) => p.priority === 'Essential').map((p) => p.value),
      })
      setRoutine(r)
      setThinking(false)
      setMessages((m) => [...m, { role: 'ai', text: r.explanation }])
      trackEvent(r.totalCost === 0 ? 'recommendation_already_owned' : 'routine_generated', {
        routine_id: r.id,
        recommended_cost: r.totalCost,
        owned_cost: r.ownedCost,
      })
    }, 900)
  }

  useEffect(() => {
    if (!isFirstRoutine || firstRoutineStarted.current) return
    firstRoutineStarted.current = true
    navigate(location.pathname, { replace: true, state: null })
    ask('Build my first routine from my skin profile.')
  }, [isFirstRoutine, location.pathname, navigate])

  const handleSave = () => {
    if (!routine || saved) return
    saveRoutine(routine)
    setSaved(true)
  }

  const handleAddMissingToShelf = () => {
    if (!routine) return
    ;[...routine.morning, ...routine.evening]
      .filter((s) => s.productId && !s.owned)
      .forEach((s) => addToShelf(s.productId))
  }

  return (
    <AppShell>
      <div className="container-page max-w-5xl py-8 sm:py-12">
        <p className="eyebrow">AI Skin Advisor</p>
        <h1 className="mt-1 font-display text-3xl text-forest-800 sm:text-4xl">What would you like help with?</h1>
        <p className="mt-2 max-w-xl text-sm text-charcoal/60">A private consultation shaped by your skin profile, what you already own and the budget you set.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="advisor-panel card flex flex-col lg:col-span-2" style={{ minHeight: 460 }}>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user' ? 'advisor-message advisor-message--user' : 'advisor-message advisor-message--ai'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-cream-200 px-4 py-2.5 text-sm text-charcoal/50">Thinking through your skin, shelf and budget…</div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-5 pb-3">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button key={p} onClick={() => ask(p)} className="chip text-xs">
                    {p}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                ask(input)
              }}
              className="flex items-center gap-2 border-t border-forest/10 p-3"
            >
              <input
                className="input flex-1"
                placeholder="Tell your advisor what's going on…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="btn-primary px-4 py-3" disabled={thinking}>
                Send
              </button>
            </form>
          </div>

          <div className="lg:col-span-3">
            {!routine ? (
              <div className="card flex h-full min-h-[300px] flex-col items-center justify-center p-10 text-center">
                <p className="text-sm text-charcoal/50">Ask a question or pick a suggestion to generate your routine.</p>
              </div>
            ) : (
              <RoutineResult
                routine={routine}
                budget={budget}
                onSave={handleSave}
                saved={saved}
                onAddMissingToShelf={handleAddMissingToShelf}
                onGoShop={() => navigate('/shop')}
                onViewRoutine={() => navigate('/home')}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

const RoutineResult: React.FC<{
  routine: Routine
  budget: number
  onSave: () => void
  saved: boolean
  onAddMissingToShelf: () => void
  onGoShop: () => void
  onViewRoutine: () => void
}> = ({ routine, budget, onSave, saved, onAddMissingToShelf, onGoShop, onViewRoutine }) => {
  const navigate = useNavigate()
  const ownedCount = new Set([...routine.morning, ...routine.evening].filter((s) => s.productId && s.owned).map((s) => s.productId)).size
  const totalCount = new Set([...routine.morning, ...routine.evening].filter((s) => s.productId).map((s) => s.productId)).size

  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="routine-stage card p-6">
        <p className="eyebrow">{routine.name.toUpperCase()}</p>
        <p className="mt-1 text-sm text-charcoal/70">
          <strong>Goal:</strong> {routine.goal}
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <StepList title="Morning" steps={routine.morning} />
          <StepList title="Evening" steps={routine.evening} />
        </div>

        <div className="mt-6 rounded-xl bg-forest/5 p-4">
          <p className="eyebrow mb-1">Why this routine?</p>
          <p className="text-sm leading-relaxed text-charcoal/80">{routine.explanation}</p>
          <p className="mt-2 text-sm font-semibold text-forest-700">
            You already own {ownedCount} of the {totalCount} products needed.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={onSave} disabled={saved}>
            {saved ? 'Routine saved' : 'Save Routine'}
          </button>
          {routine.totalCost > 0 && (
            <button className="btn-secondary" onClick={onAddMissingToShelf}>
              Add missing to shelf
            </button>
          )}
          <button className="btn-secondary" onClick={onGoShop}>
            Shop this routine
          </button>
        </div>

        {saved && (
          <div className="completion-panel mt-5 rounded-xl border border-forest/15 bg-forest/5 p-4" role="status">
            <p className="eyebrow mb-1">Next step</p>
            <p className="font-semibold text-forest-800">Your routine is saved.</p>
            <p className="mt-1 text-sm text-charcoal/65">Keep it handy on your dashboard, then check in as your skin changes.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={onViewRoutine}>View My Routine</button>
              <button className="btn-secondary" onClick={onGoShop}>Continue Shopping</button>
            </div>
          </div>
        )}
      </div>

      <BudgetSummary routine={routine} budget={budget} />

      {[...routine.morning, ...routine.evening]
        .filter((s, i, arr) => s.productId && arr.findIndex((x) => x.productId === s.productId) === i)
        .map((s) => {
          const p = findProduct(s.productId)
          if (!p) return null
          return (
            <button
              key={s.productId}
              onClick={() => navigate(`/product/${p.id}`)}
              className="card flex w-full items-center justify-between p-4 text-left transition hover:-translate-y-0.5"
            >
              <div>
                <p className="font-display text-base text-charcoal">{p.name}</p>
                <p className="text-xs text-charcoal/50">{s.owned ? 'Already owned' : `$${p.price} · Recommended addition`}</p>
              </div>
              <span className="text-sm font-semibold text-forest-700">View →</span>
            </button>
          )
        })}
    </div>
  )
}

const StepList: React.FC<{ title: string; steps: RoutineStep[] }> = ({ title, steps }) => (
  <div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-500">{title}</p>
    <ol className="space-y-2.5">
      {steps.map((s) => (
        <li key={s.order} className="flex items-start gap-3">
          <span className="mt-0.5 text-xs font-semibold text-forest-400">{String(s.order).padStart(2, '0')}</span>
          <div>
            <p className="text-sm font-medium text-charcoal">{s.productName}</p>
            <p className={`text-xs font-semibold ${s.owned ? 'text-forest-500' : 'text-gold-dark'}`}>
              {s.owned ? 'Already owned' : 'Recommended addition'}
            </p>
          </div>
        </li>
      ))}
    </ol>
  </div>
)

export default RoutineBuilder
