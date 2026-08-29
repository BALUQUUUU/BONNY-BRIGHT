import React from 'react'
import AppShell from '../components/AppShell'

const LOCATIONS = [
  { name: 'Bonny & Bright — Riverside', type: 'Flagship store', inventory: 'available' as const },
  { name: 'Bonny & Bright — Northgate', type: 'Store', inventory: 'available' as const },
  { name: 'Fine Foods — Elm Street', type: 'Partner location', inventory: 'unavailable' as const },
  { name: 'Fine Foods — Harbor Market', type: 'Partner location', inventory: 'unavailable' as const },
]

const StoreLocator: React.FC = () => (
  <AppShell>
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <p className="eyebrow">Find Bonny &amp; Bright</p>
      <h1 className="mt-1 font-display text-3xl text-forest-800 sm:text-4xl">In stores near you.</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-charcoal/65">
        Your Bonny &amp; Bright skin profile can help connect your online routine with your in-store experience.
      </p>

      <div className="mt-8 space-y-3">
        {LOCATIONS.map((loc) => (
          <div key={loc.name} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-display text-base text-charcoal">{loc.name}</p>
              <p className="text-xs text-charcoal/50">{loc.type}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                loc.inventory === 'available' ? 'bg-forest/10 text-forest-700' : 'bg-charcoal/5 text-charcoal/45'
              }`}
            >
              {loc.inventory === 'available' ? 'Live inventory available' : 'Live inventory unavailable'}
            </span>
          </div>
        ))}
      </div>
    </div>
  </AppShell>
)

export default StoreLocator
