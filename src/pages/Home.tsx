import React from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ProductVisual from '../components/ProductVisual'
import { useActiveShelfProducts, useApp } from '../context/AppContext'
import { EDITORIAL_IMAGES } from '../data/editorialImages'
import { PRODUCTS } from '../data/products'

const timeGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const Home: React.FC = () => {
  const { user, routines, skinProfile, journey } = useApp()
  const shelfProducts = useActiveShelfProducts()
  const navigate = useNavigate()
  const latestRoutine = routines[0]
  const featuredProduct = shelfProducts[0] ?? PRODUCTS[1]
  const daysFollowed = Math.min(18, 25)
  const adherence = Math.round((daysFollowed / 25) * 100)
  const progressEntries = journey.slice(0, 3)

  const insight = skinProfile.concerns.includes('Dryness')
    ? 'Your skin profile suggests prioritising hydration today.'
    : skinProfile.concerns.includes('Dullness')
      ? 'Your skin profile suggests a brightening step could help today.'
      : 'Your skin profile looks steady — a light maintenance routine should do.'

  return (
    <AppShell atmosphere="forest">
      <div className="home-dashboard container-page max-w-7xl py-7 sm:py-10">
        <section className="home-dashboard__welcome">
          <div>
            <p className="eyebrow">Your considered ritual</p>
            <h1>{timeGreeting()}, {user?.name ?? 'there'}</h1>
            <p>Your skin, understood.</p>
          </div>
          <button className="btn-primary home-dashboard__advisor" onClick={() => navigate('/routine-builder')}>
            <SparkleIcon /> AI Skin Advisor <span aria-hidden="true">→</span>
          </button>
        </section>

        <div className="home-dashboard-grid mt-7">
          <button className="home-card home-insight text-left" onClick={() => navigate('/skin-profile')}>
            <p className="eyebrow"><LeafIcon /> Today's skin insight</p>
            <p className="home-card__statement">{insight}</p>
            <span className="home-card__link">See details <span aria-hidden="true">→</span></span>
          </button>

          <section className="home-card home-routine" aria-labelledby="routine-title">
            <div className="flex items-center justify-between gap-4">
              <p id="routine-title" className="eyebrow">Your current routine</p>
              {latestRoutine && <span className="home-routine__tag">{latestRoutine.name}</span>}
            </div>
            {latestRoutine ? (
              <div className="home-routine__steps mt-5">
                <RoutineList title="Morning" steps={latestRoutine.morning} />
                <RoutineList title="Evening" steps={latestRoutine.evening} />
              </div>
            ) : (
              <p className="mt-5 max-w-sm text-sm text-charcoal/65">No routine yet. Your first ritual can be built from your skin profile, shelf and budget.</p>
            )}
            <button className="btn-secondary mt-auto self-start" onClick={() => navigate('/routine-builder')}>
              {latestRoutine ? 'View Routine' : 'Build My Routine'} <span aria-hidden="true">→</span>
            </button>
          </section>

          <button className="home-card home-shelf text-left" onClick={() => navigate('/shelf')}>
            <p className="eyebrow">Your shelf</p>
            <div className="home-shelf__content">
              <div>
                <p className="home-shelf__count">{shelfProducts.length}</p>
                <p className="text-sm text-charcoal/70">{shelfProducts.length === 1 ? 'product' : 'products'}<br />in your shelf</p>
              </div>
              <ProductVisual shape={featuredProduct.image} accent={featuredProduct.accent} className="home-shelf__visual" />
            </div>
            <span className="home-card__link">View Shelf <span aria-hidden="true">→</span></span>
          </button>

          <button
            className="home-card home-discover home-discover--shop text-left"
            onClick={() => navigate('/shop')}
            style={{ '--card-image': `url(${EDITORIAL_IMAGES.aloe.src})` } as React.CSSProperties}
          >
            <p className="eyebrow">Discover</p>
            <p className="home-card__title">Shop</p>
            <p className="max-w-[12rem] text-sm text-charcoal/70">Personalised recommendations for your profile.</p>
            <span className="home-card__link">Explore <span aria-hidden="true">→</span></span>
          </button>

          <button
            className="home-card home-discover home-discover--subscription text-left"
            onClick={() => navigate('/subscription')}
            style={{ '--card-image': `url(${EDITORIAL_IMAGES.oat.src})` } as React.CSSProperties}
          >
            <p className="eyebrow">Your ritual, replenished</p>
            <p className="home-card__title">Subscription Box</p>
            <p className="max-w-[12rem] text-sm text-charcoal/70">Your monthly routine, curated for you.</p>
            <span className="home-card__link">View Box <span aria-hidden="true">→</span></span>
          </button>

          <button className="home-card home-trust text-left" onClick={() => navigate('/trust')}>
            <div>
              <p className="eyebrow">Trust Centre</p>
              <p className="home-card__title">Know what<br />you're buying.</p>
              <p className="mt-3 max-w-[14rem] text-sm text-charcoal/70">Ingredients, certifications and sustainability verification.</p>
            </div>
            <div className="home-trust__seal" aria-hidden="true"><TrustIcon /></div>
            <span className="home-card__link">Open Trust Centre <span aria-hidden="true">→</span></span>
          </button>

          <button className="home-card home-journey text-left" onClick={() => navigate('/journey')}>
            <p className="eyebrow">Your skin journey</p>
            <div className="home-journey__milestones">
              {['Week 1', 'Week 2', 'Week 4'].map((label, index) => {
                const entry = progressEntries[index]
                return (
                  <div key={label} className="home-journey__milestone">
                    <span>{label}</span>
                    {entry?.imageDataUrl ? <img src={entry.imageDataUrl} alt={`${label} check-in`} /> : <span className="home-journey__placeholder">{index + 1}</span>}
                  </div>
                )
              })}
            </div>
            <span className="home-card__link">View Journey <span aria-hidden="true">→</span></span>
          </button>

          <button className="home-card home-adherence text-left" onClick={() => navigate('/journey')}>
            <p className="eyebrow">Routine adherence</p>
            <div className="home-adherence__content">
              <div className="home-adherence__ring" style={{ '--progress': `${adherence * 3.6}deg` } as React.CSSProperties}><span>{adherence}%</span></div>
              <div><p className="font-display text-lg text-forest-800">You're doing great!</p><p className="mt-1 text-sm text-charcoal/70">{daysFollowed} / 25 days<br />followed</p></div>
            </div>
            <span className="home-card__link">View Progress <span aria-hidden="true">→</span></span>
          </button>

          <button className="home-card home-help text-left" onClick={() => navigate('/routine-builder')}>
            <p className="eyebrow">Need help?</p>
            <p className="home-card__title">Ask your<br />AI Skin Advisor</p>
            <p className="mt-3 text-sm text-charcoal/70">A little guidance for the skin you're in today.</p>
            <span className="home-help__sparkle"><SparkleIcon /></span>
            <span className="home-card__link">Start a chat <span aria-hidden="true">→</span></span>
          </button>
        </div>
      </div>
    </AppShell>
  )
}

const RoutineList: React.FC<{ title: string; steps: { order: number; productName: string; owned: boolean }[] }> = ({ title, steps }) => (
  <div>
    <p className="home-routine__time">{title}</p>
    <ol className="mt-2 space-y-1.5">
      {steps.slice(0, 3).map((step) => <li key={step.order}><span>{step.order}.</span>{step.productName}</li>)}
    </ol>
  </div>
)

const SparkleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z" /><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z" /></svg>
const LeafIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 4C11 4 5 8.5 5 15c0 2.2 1.8 4 4 4C15.5 19 20 13 20 4Z" /><path d="M4 20c3-4 6-6 11-9" /></svg>
const TrustIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" aria-hidden="true"><path d="M12 3.5 20 7v5c0 4.5-3.3 7.5-8 9-4.7-1.5-8-4.5-8-9V7l8-3.5Z" /><path d="M7.5 14.5c2.3-4.2 5-5.6 9-6.2-1 4.5-3.5 6.7-7.2 7.5" /><path d="m9 16 4.8-5" /></svg>

export default Home
