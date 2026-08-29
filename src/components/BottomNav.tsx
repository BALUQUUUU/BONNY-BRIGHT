import React from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/home', label: 'Home', icon: HomeIcon },
  { to: '/skin-profile', label: 'My Skin', icon: SkinIcon },
  { to: '/shelf', label: 'Shelf', icon: ShelfIcon },
  { to: '/routine-builder', label: 'Routine', icon: RoutineIcon },
  { to: '/shop', label: 'Shop', icon: ShopIcon },
]

const BottomNav: React.FC<{ immersive?: boolean }> = ({ immersive = false }) => (
  <nav
    className="bottom-glass-nav fixed inset-x-3 bottom-3 z-40 flex pb-[env(safe-area-inset-bottom)] md:hidden"
  >
    {items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
            isActive ? (immersive ? 'text-cream-100' : 'text-forest-800') : immersive ? 'text-cream-300/70' : 'text-forest-400'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <item.icon active={isActive} immersive={immersive} />
            {item.label}
          </>
        )}
      </NavLink>
    ))}
  </nav>
)

const iconProps = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 1.8 }

function HomeIcon({ active, immersive = false }: { active: boolean; immersive?: boolean }) {
  return (
    <svg {...iconProps} stroke="currentColor" className={active ? (immersive ? 'text-cream-100' : 'text-forest-800') : immersive ? 'text-cream-300/70' : 'text-forest-400'}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}
function SkinIcon({ active, immersive = false }: { active: boolean; immersive?: boolean }) {
  return (
    <svg {...iconProps} stroke="currentColor" className={active ? (immersive ? 'text-cream-100' : 'text-forest-800') : immersive ? 'text-cream-300/70' : 'text-forest-400'}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 12a3 3 0 0 1 6 0" />
    </svg>
  )
}
function ShelfIcon({ active, immersive = false }: { active: boolean; immersive?: boolean }) {
  return (
    <svg {...iconProps} stroke="currentColor" className={active ? (immersive ? 'text-cream-100' : 'text-forest-800') : immersive ? 'text-cream-300/70' : 'text-forest-400'}>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <rect x="6" y="3.5" width="3" height="5" rx="0.5" />
    </svg>
  )
}
function RoutineIcon({ active, immersive = false }: { active: boolean; immersive?: boolean }) {
  return (
    <svg {...iconProps} stroke="currentColor" className={active ? (immersive ? 'text-cream-100' : 'text-forest-800') : immersive ? 'text-cream-300/70' : 'text-forest-400'}>
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function ShopIcon({ active, immersive = false }: { active: boolean; immersive?: boolean }) {
  return (
    <svg {...iconProps} stroke="currentColor" className={active ? (immersive ? 'text-cream-100' : 'text-forest-800') : immersive ? 'text-cream-300/70' : 'text-forest-400'}>
      <path d="M3 8h18l-1.5 11a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 8Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
  )
}

export default BottomNav
