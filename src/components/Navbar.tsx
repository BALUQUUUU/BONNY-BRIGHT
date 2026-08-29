import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PRODUCTS } from '../data/products'

const links = [
  { to: '/home', label: 'Home' },
  { to: '/skin-profile', label: 'My Skin' },
  { to: '/shelf', label: 'My Shelf' },
  { to: '/routine-builder', label: 'Routine' },
  { to: '/shop', label: 'Shop' },
  { to: '/subscription', label: 'Subscription' },
  { to: '/journey', label: 'Journey' },
  { to: '/trust', label: 'Trust' },
  { to: '/profile', label: 'Profile' },
]

type SearchResult = {
  id: string
  label: string
  detail: string
  to: string
  kind: 'Product' | 'Page'
  searchText: string
}

const pageSearchResults: SearchResult[] = [
  { id: 'page-home', label: 'Home', detail: 'Your skin dashboard', to: '/home', kind: 'Page', searchText: 'home dashboard overview' },
  { id: 'page-skin', label: 'My Skin', detail: 'Skin profile and scan', to: '/skin-profile', kind: 'Page', searchText: 'skin profile scan analysis concerns goals' },
  { id: 'page-shelf', label: 'My Shelf', detail: 'Products you already own', to: '/shelf', kind: 'Page', searchText: 'shelf owned products cabinet' },
  { id: 'page-routine', label: 'Routine Builder', detail: 'Build a personalised routine', to: '/routine-builder', kind: 'Page', searchText: 'routine ai advisor personalised build morning evening' },
  { id: 'page-shop', label: 'Shop', detail: 'Personalised product recommendations', to: '/shop', kind: 'Page', searchText: 'shop products recommendations buy' },
  { id: 'page-journey', label: 'Skin Journey', detail: 'Track your progress', to: '/journey', kind: 'Page', searchText: 'journey progress check in tracking photo' },
  { id: 'page-trust', label: 'Trust Centre', detail: 'Ingredients and certifications', to: '/trust', kind: 'Page', searchText: 'trust ingredients certification sustainability' },
  { id: 'page-subscription', label: 'Subscription Box', detail: 'Your monthly ritual', to: '/subscription', kind: 'Page', searchText: 'subscription monthly box replenishment' },
]

const productSearchResults: SearchResult[] = PRODUCTS.map((product) => ({
  id: `product-${product.id}`,
  label: product.name,
  detail: `${product.category} · ${product.subCategory}`,
  to: `/product/${product.id}`,
  kind: 'Product',
  searchText: [product.name, product.category, product.subCategory, product.positioning, product.description, ...product.keyIngredients.map((ingredient) => ingredient.name)].join(' '),
}))

const Navbar: React.FC<{ immersive?: boolean }> = ({ immersive = false }) => {
  const { cart, isAdmin, user } = useApp()
  const navigate = useNavigate()
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLFormElement>(null)
  const searchTerm = searchQuery.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!searchTerm) return []
    return [...productSearchResults, ...pageSearchResults]
      .filter((result) => `${result.label} ${result.detail} ${result.searchText}`.toLowerCase().includes(searchTerm))
      .slice(0, 6)
  }, [searchTerm])

  useEffect(() => {
    const closeSearchOnOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', closeSearchOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeSearchOnOutsideClick)
  }, [])

  const openSearchResult = (result: SearchResult) => {
    setSearchQuery('')
    setSearchOpen(false)
    navigate(result.to)
  }

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (searchResults[0]) openSearchResult(searchResults[0])
  }

  return (
    <header className="app-header hidden md:block">
      <aside className="app-sidebar">
        <button onClick={() => navigate('/home')} className="app-wordmark">
          Bonny <span>&amp;</span> Bright
        </button>
        <p className="app-sidebar__caption">Personal skin space</p>
        <nav className="app-sidebar__nav" aria-label="Main navigation">
          {[...links, ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : [])].map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}>
              <NavGlyph label={l.label} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <NavLink to="/profile" className="app-sidebar__profile">
          <span className="app-avatar"><AccountInitial /></span>
          <span><b>{user?.name ?? 'Your profile'}</b><small>Personal settings</small></span>
        </NavLink>
      </aside>

        <div className="app-topbar container-page">
          <div className="app-topbar__intro"><span className="app-topbar__eyebrow">Bonny &amp; Bright</span><span className="app-topbar__page">Your considered ritual</span></div>
          <form ref={searchRef} className="header-search header-search--interactive" role="search" onSubmit={submitSearch}>
            <SearchIcon />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => event.key === 'Escape' && setSearchOpen(false)}
              placeholder="Search products, routines, ingredients..."
              aria-label="Search products, routines, ingredients"
              aria-expanded={searchOpen && Boolean(searchTerm)}
              aria-controls="global-search-results"
              autoComplete="off"
            />
            {searchOpen && searchTerm && (
              <div id="global-search-results" className="header-search__results" role="listbox" aria-label="Search results">
                {searchResults.length ? (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      role="option"
                      className="header-search__result"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openSearchResult(result)}
                    >
                      <span className="header-search__result-copy"><b>{result.label}</b><small>{result.detail}</small></span>
                      <span className="header-search__result-kind">{result.kind}</span>
                    </button>
                  ))
                ) : (
                  <p className="header-search__empty">No products, ingredients or pages match “{searchQuery.trim()}”.</p>
                )}
              </div>
            )}
          </form>
        <div className="app-header__actions">
          <button type="button" aria-label="Notifications" className="app-icon-button"><BellIcon /></button>
          <NavLink to="/profile" aria-label="Profile" className="app-icon-button"><AccountInitial /></NavLink>
          <NavLink to="/checkout" aria-label="Cart" className="app-icon-button app-cart-button"><CartIcon />{cartCount > 0 && <span>{cartCount}</span>}</NavLink>
        </div>
      </div>
    </header>
  )
}

const AccountInitial: React.FC = () => {
  const { user } = useApp()
  return <>{user?.name?.[0]?.toUpperCase() ?? 'B'}</>
}

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
)
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
)

const NavGlyph: React.FC<{ label: string }> = ({ label }) => {
  const path: Record<string, string> = {
    Home: 'M3 11.5 12 4l9 7.5M5 10v10h14V10',
    'My Skin': 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-3 9a3 3 0 0 1 6 0',
    'My Shelf': 'M4 6h16M4 12h16M4 18h16M7 4v4',
    Routine: 'M12 3v4m0 10v4M4.2 7.2l2.8 2.8m10 4 2.8 2.8M3 12h4m10 0h4M4.2 16.8 7 14m10-4 2.8-2.8M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
    Shop: 'M3 8h18l-1.5 11a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 8ZM8 8V6a4 4 0 0 1 8 0v2',
    Subscription: 'M5 7h14v12H5zM8 4h8M8 11h8',
    Journey: 'M4 17c3-7 5-7 8-3s5 4 8-5M4 20h16',
    Trust: 'M12 3 20 6v5c0 5-3.2 8-8 10-4.8-2-8-5-8-10V6l8-3Zm-3 9 2 2 4-4',
    Profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.8-3.3 3.2-5 7-5s6.2 1.7 7 5',
    Admin: 'M4 20V10m5 10V4m6 16v-7m5 7V7',
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" aria-hidden="true"><path d={path[label] ?? path.Home} /></svg>
}

export default Navbar
