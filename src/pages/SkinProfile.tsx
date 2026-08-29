import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useApp } from '../context/AppContext'

const SkinProfile: React.FC = () => {
  const { skinProfile, user, skinProfileWelcomeSeen, dismissSkinProfileWelcome } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const latestScan = skinProfile.scans[0]
  const arrivedFromOnboarding = Boolean((location.state as { onboardingComplete?: boolean } | null)?.onboardingComplete)
  const [showWelcome, setShowWelcome] = useState(() => arrivedFromOnboarding || !skinProfileWelcomeSeen)

  useEffect(() => {
    if (!showWelcome) return
    if (!skinProfileWelcomeSeen) dismissSkinProfileWelcome()
    if (arrivedFromOnboarding) navigate(location.pathname, { replace: true, state: null })
  }, [arrivedFromOnboarding, dismissSkinProfileWelcome, location.pathname, navigate, showWelcome, skinProfileWelcomeSeen])

  const dismissWelcome = () => {
    setShowWelcome(false)
    dismissSkinProfileWelcome()
  }

  const startFirstRoutine = () => {
    dismissWelcome()
    navigate('/routine-builder', { state: { firstRoutine: true } })
  }

  return (
    <AppShell>
      <div className="container-page max-w-3xl py-10 sm:py-14">
        {showWelcome && (
          <section
            className="profile-welcome card mb-8 border border-forest/20 bg-cream-100 p-6 sm:p-8"
            aria-labelledby="profile-welcome-title"
            aria-live="polite"
          >
            <p className="eyebrow">Welcome to Bonny &amp; Bright</p>
            <h2 id="profile-welcome-title" className="mt-2 font-display text-3xl text-forest-800 sm:text-4xl">
              Your profile is ready — here's what we found.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/70">
              We've used your skin, goals and budget to set up a more personal starting point for you.
            </p>

            <div className="profile-welcome__next mt-6 rounded-xl bg-forest/5 p-5">
              <p className="font-display text-lg text-forest-800">You're all set — here's what happens next</p>
              <ol className="mt-3 space-y-2 text-sm text-charcoal/70">
                <li><span className="mr-2 font-semibold text-gold-light">1.</span>Build a first routine tailored to your skin and monthly budget.</li>
                <li><span className="mr-2 font-semibold text-gold-light">2.</span>Add products you already own to your shelf.</li>
                <li><span className="mr-2 font-semibold text-gold-light">3.</span>Explore the shop when you're ready for a recommendation.</li>
              </ol>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={startFirstRoutine}>
                See My First Routine <span aria-hidden="true">→</span>
              </button>
              <button className="profile-welcome__dismiss" onClick={dismissWelcome}>
                Explore my profile first
              </button>
            </div>
          </section>
        )}

        <p className="eyebrow">Your profile</p>
        <h1 className="mt-1 font-display text-3xl text-forest-800 sm:text-4xl">Your Skin Profile</h1>

        <section className="skin-profile-hero card mt-7 grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <p className="eyebrow">Personal skin laboratory</p>
            <p className="mt-3 max-w-md font-display text-2xl leading-tight text-forest-800">A calmer, clearer picture of what your skin needs.</p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-charcoal/65">Your profile connects your skin type, goals, shelf and latest cosmetic scan into one considered starting point.</p>
            <button className="btn-secondary mt-5" onClick={() => navigate('/journey')}>Update Skin Scan</button>
          </div>
          <div className="skin-profile-orb" aria-label="Skin profile confidence">
            <span className="skin-profile-orb__halo" />
            <span className="skin-profile-orb__inner">{latestScan?.confidence ?? 70}<small>%<br />confidence</small></span>
          </div>
        </section>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="card p-6">
            <p className="eyebrow mb-2">Skin type</p>
            <p className="font-display text-2xl text-forest-800">{skinProfile.skinType || 'Not yet set'}</p>
          </div>
          <div className="card p-6">
            <p className="eyebrow mb-2">Monthly budget</p>
            <p className="font-display text-2xl text-forest-800">${user?.monthlyBudget ?? 0}</p>
          </div>
          <div className="card p-6 sm:col-span-2">
            <p className="eyebrow mb-3">Primary concerns</p>
            <div className="flex flex-wrap gap-2">
              {skinProfile.concerns.length ? (
                skinProfile.concerns.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))
              ) : (
                <p className="text-sm text-charcoal/50">No concerns recorded yet.</p>
              )}
            </div>
          </div>
          <div className="card p-6 sm:col-span-2">
            <p className="eyebrow mb-3">Current goals</p>
            <div className="flex flex-wrap gap-2">
              {skinProfile.goals.length ? (
                skinProfile.goals.map((g) => (
                  <span key={g} className="chip">
                    {g}
                  </span>
                ))
              ) : (
                <p className="text-sm text-charcoal/50">No goals recorded yet.</p>
              )}
            </div>
          </div>
          <div className="card p-6 sm:col-span-2">
            <p className="eyebrow mb-3">Ethical priorities</p>
            <div className="flex flex-wrap gap-2">
              {(user?.ethicalPreferences ?? []).length ? (
                user!.ethicalPreferences.map((p) => (
                  <span key={p.value} className="chip">
                    {p.value} · {p.priority}
                  </span>
                ))
              ) : (
                <p className="text-sm text-charcoal/50">No preferences set yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card mt-6 p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Last skin scan</p>
            <span className="text-xs text-charcoal/40">
              {latestScan ? `Last analysed: ${new Date(latestScan.date).toLocaleDateString()}` : 'No scan yet'}
            </span>
          </div>
          {latestScan ? (
            <p className="mt-3 text-sm leading-relaxed text-charcoal/75">{latestScan.summary}</p>
          ) : (
            <p className="mt-3 text-sm text-charcoal/50">Run a skin scan to get your first AI-assisted read.</p>
          )}
          <button className="btn-secondary mt-4" onClick={() => navigate('/journey')}>
            Update My Skin Scan
          </button>
        </div>
      </div>
    </AppShell>
  )
}

export default SkinProfile
