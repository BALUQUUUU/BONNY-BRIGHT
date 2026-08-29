import React from 'react'
import { useNavigate } from 'react-router-dom'
import { EDITORIAL_IMAGES } from '../data/editorialImages'
import ForestBackdrop from '../components/ForestBackdrop'

const pillars = [
  { title: 'Your Skin', copy: 'Understand your skin and concerns, tracked over time.', shape: 'jar', accent: '#7C8F6E' },
  { title: 'Your Shelf', copy: 'Use what you already own before we recommend anything more.', shape: 'dropper', accent: '#C9A961' },
  { title: 'Your Budget', copy: 'Build a routine that fits what you actually want to spend.', shape: 'bottle', accent: '#88A58F' },
  { title: 'Your Trust', copy: 'See what is actually verified, not just what is claimed.', shape: 'balm', accent: '#B5654A' },
]

const Landing: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="forest-shell public-scene min-h-screen">
      <ForestBackdrop />
      <div className="relative z-10">
      {/* Hero */}
      <section className="public-hero relative isolate overflow-hidden border-b border-forest/10">
        <img
          src={EDITORIAL_IMAGES.aloe.src}
          alt=""
          aria-hidden="true"
          className="editorial-photo absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.16]"
        />
        <div className="public-hero__wash absolute inset-0 -z-10" />
        <div className="container-page grid items-center gap-10 py-16 sm:py-24 md:grid-cols-2 md:py-28">
          <div className="animate-fadeUp">
            <p className="eyebrow mb-5">Bonny &amp; Bright</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] text-forest-800 sm:text-5xl md:text-6xl">
              Your skin.
              <br />
              Your routine.
              <br />
              <span className="italic text-gold-dark">Actually</span> personalised.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-charcoal/70">
              Tell us what your skin needs, what you already own, and what you want to spend. Bonny &amp; Bright builds a
              routine around you — not the other way around.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => navigate('/signup')}>
                Build My Skin Profile
              </button>
              <button className="btn-secondary" onClick={() => navigate('/shop')}>
                Explore Products
              </button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/70 bg-cream-100/70 p-7 shadow-lift backdrop-blur-sm sm:p-9">
            <p className="eyebrow">A calmer way to choose</p>
            <p className="mt-3 font-display text-3xl leading-tight text-forest-800">Care that knows your skin before it fills your shelf.</p>
            <div className="mt-8 space-y-3">
              {['Your skin profile', 'What you already own', 'A considered next step'].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-forest/10 bg-cream-50/80 px-4 py-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-forest text-[10px] font-semibold text-cream-100">0{index + 1}</span>
                  <span className="text-sm font-medium text-charcoal/75">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <div key={p.title} className="card animate-fadeUp p-6" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="mb-4 h-1 w-8 rounded-full" style={{ backgroundColor: p.accent }} />
              <h3 className="font-display text-lg text-forest-800">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/65">{p.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative isolate min-h-[340px] overflow-hidden sm:min-h-[400px]">
        <img
          src={EDITORIAL_IMAGES.oat.src}
          alt={EDITORIAL_IMAGES.oat.alt}
          className="editorial-photo absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-forest-900/55" />
        <div className="container-page flex min-h-[340px] items-end py-10 sm:min-h-[400px] sm:py-14">
          <div className="max-w-xl rounded-2xl border border-cream-100/20 bg-forest-900/55 p-6 backdrop-blur-sm sm:p-8">
            <p className="eyebrow text-cream-300">Made with intention</p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-cream-100 sm:text-4xl">A softer ritual, built around what your skin already needs.</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/85">Thoughtful formulas, less visual noise and a routine that feels easy to return to.</p>
          </div>
        </div>
      </section>

      {/* AI advisor intro */}
      <section className="relative isolate overflow-hidden border-t border-forest/10 bg-forest-800">
        <img
          src={EDITORIAL_IMAGES.dew.src}
          alt=""
          aria-hidden="true"
          className="editorial-photo absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <p className="eyebrow text-cream-300">Meet your AI Skin Advisor</p>
          <h2 className="max-w-xl font-display text-3xl font-medium text-cream-100 sm:text-4xl">
            It reasons from your skin, your shelf and your budget — not a script.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-cream-200/80">
            Sometimes the right answer is a new product. Sometimes it's "you already have what you need." Either way, you'll
            know why.
          </p>
          <button className="btn-gold" onClick={() => navigate('/signup')}>
            Start My Skin Analysis
          </button>
        </div>
      </section>
      </div>
    </div>
  )
}

export default Landing
