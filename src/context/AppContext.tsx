import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  CartItem,
  EthicalPreference,
  Interaction,
  JourneyEntry,
  Routine,
  ScanResult,
  ShelfItem,
  SkinConcern,
  SkinGoal,
  SkinProfile,
  SkinType,
  Subscription,
  User,
} from '../types'
import { PRODUCTS } from '../data/products'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const STORAGE_KEY = 'bb_app_state_v2'

interface AppState {
  isAuthenticated: boolean
  user: User | null
  skinProfile: SkinProfile
  skinProfileWelcomeSeen: boolean
  shelf: ShelfItem[]
  routines: Routine[]
  interactions: Interaction[]
  journey: JourneyEntry[]
  subscription: Subscription
  cart: CartItem[]
}

const defaultProfile: SkinProfile = { skinType: 'Not sure', concerns: [], goals: [], scans: [] }

const defaultState: AppState = {
  isAuthenticated: false,
  user: null,
  skinProfile: defaultProfile,
  // Existing saved profiles keep their familiar profile view. New onboarding
  // completions reset this so they receive the welcome once.
  skinProfileWelcomeSeen: true,
  shelf: [],
  routines: [],
  interactions: [],
  journey: [],
  subscription: { status: 'none', products: [], budget: 0, nextBillingDate: '' },
  cart: [],
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

function userFromProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }, profile?: Record<string, unknown> | null): User {
  return {
    id: authUser.id,
    name: String(profile?.full_name ?? authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'there'),
    email: String(profile?.email ?? authUser.email ?? ''),
    role: profile?.role === 'admin' ? 'admin' : 'customer',
    ageRange: String(profile?.age_range ?? ''),
    gender: String(profile?.gender ?? ''),
    monthlyBudget: Number(profile?.monthly_budget ?? 0),
    ethicalPreferences: Array.isArray(profile?.ethical_preferences) ? (profile!.ethical_preferences as EthicalPreference[]) : [],
    createdAt: String(profile?.created_at ?? new Date().toISOString()),
    onboarded: Boolean(profile?.onboarded),
  }
}

interface AppContextValue extends AppState {
  backendConfigured: boolean
  isAdmin: boolean
  signUp: (name: string, email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>
  logIn: (email: string, password: string) => Promise<User | null>
  logOut: () => Promise<void>
  completeOnboarding: (data: {
    name: string
    ageRange: string
    gender: string
    skinType: SkinType
    concerns: SkinConcern[]
    goals: SkinGoal[]
    scan: ScanResult
    budget: number
    ethicalPreferences: EthicalPreference[]
  }) => void
  dismissSkinProfileWelcome: () => void
  updateSkinProfile: (patch: Partial<SkinProfile>) => void
  addScan: (scan: ScanResult) => void
  addToShelf: (productId: string, isCustom?: boolean, customName?: string) => void
  removeFromShelf: (productId: string) => void
  markShelfItemFinished: (productId: string) => void
  toggleShelfInRoutine: (productId: string, value: boolean) => void
  saveRoutine: (routine: Routine) => void
  recordInteraction: (productId: string, type: Interaction['type']) => void
  addJourneyEntry: (entry: JourneyEntry) => void
  setSubscription: (sub: Subscription) => void
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  updateBudget: (budget: number) => void
  trackEvent: (name: string, properties?: Record<string, unknown>) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadState)

  const persistCloudState = (next: AppState) => {
    if (!isSupabaseConfigured || !supabase || !next.user) return
    const persistedState = { ...next, isAuthenticated: false, user: null }
    void supabase
      .from('customer_states')
      .upsert({ user_id: next.user.id, state: persistedState, updated_at: new Date().toISOString() })
      .then(({ error }) => error && console.error('Could not sync customer state', error))
  }

  const updateProfile = (user: User) => {
    if (!isSupabaseConfigured || !supabase) return
    void supabase
      .from('profiles')
      .update({
        full_name: user.name,
        age_range: user.ageRange || null,
        gender: user.gender || null,
        monthly_budget: user.monthlyBudget,
        ethical_preferences: user.ethicalPreferences,
        onboarded: user.onboarded,
      })
      .eq('id', user.id)
      .then(({ error }) => error && console.error('Could not sync customer profile', error))
  }

  const trackEvent = (eventName: string, properties: Record<string, unknown> = {}) => {
    if (!isSupabaseConfigured || !supabase || !state.user) return
    void supabase
      .from('analytics_events')
      .insert({ user_id: state.user.id, event_name: eventName, properties })
      .then(({ error }) => error && console.error('Could not record analytics event', error))
  }

  const commit = (updater: (current: AppState) => AppState) => {
    setState((current) => {
      const next = updater(current)
      persistCloudState(next)
      return next
    })
  }

  const hydrateForAuthUser = async (authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
    if (!supabase) return null
    const [{ data: profile }, { data: cloudState }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
      supabase.from('customer_states').select('state').eq('user_id', authUser.id).maybeSingle(),
    ])
    const user = userFromProfile(authUser, profile)
    const restored = cloudState?.state && typeof cloudState.state === 'object' ? (cloudState.state as Partial<AppState>) : {}
    setState({ ...defaultState, ...restored, isAuthenticated: true, user })
    return user
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) void hydrateForAuthUser(session.user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void hydrateForAuthUser(session.user)
      else setState((current) => ({ ...current, isAuthenticated: false, user: null }))
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp: AppContextValue['signUp'] = async (name, email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) throw error
      if (data.session && data.user) await hydrateForAuthUser(data.user)
      return { requiresEmailConfirmation: !data.session }
    }
    const user: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'customer',
      ageRange: '',
      gender: '',
      monthlyBudget: 0,
      ethicalPreferences: [],
      createdAt: new Date().toISOString(),
      onboarded: false,
    }
    commit((current) => ({ ...current, isAuthenticated: true, user }))
    return { requiresEmailConfirmation: false }
  }

  const logIn: AppContextValue['logIn'] = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data.user ? hydrateForAuthUser(data.user) : null
    }
    let signedInUser: User | null = null
    commit((current) => {
      signedInUser = current.user
        ? { ...current.user, email }
        : {
            id: `user-${Date.now()}`,
            name: email.split('@')[0],
            email,
            role: 'customer',
            ageRange: '',
            gender: '',
            monthlyBudget: 40,
            ethicalPreferences: [],
            createdAt: new Date().toISOString(),
            onboarded: true,
          }
      return { ...current, isAuthenticated: true, user: signedInUser }
    })
    return signedInUser
  }

  const logOut = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
    setState((current) => ({ ...current, isAuthenticated: false, user: null }))
  }

  const completeOnboarding: AppContextValue['completeOnboarding'] = (data) => {
    commit((current) => {
      const user = current.user
        ? {
            ...current.user,
            name: data.name || current.user.name,
            ageRange: data.ageRange,
            gender: data.gender,
            monthlyBudget: data.budget,
            ethicalPreferences: data.ethicalPreferences,
            onboarded: true,
          }
        : null
      if (user) updateProfile(user)
      return {
        ...current,
        user,
        skinProfileWelcomeSeen: false,
        skinProfile: { skinType: data.skinType, concerns: data.concerns, goals: data.goals, scans: [data.scan] },
      }
    })
    trackEvent('onboarding_completed')
  }

  const dismissSkinProfileWelcome = () => commit((current) => ({ ...current, skinProfileWelcomeSeen: true }))
  const updateSkinProfile = (patch: Partial<SkinProfile>) => commit((current) => ({ ...current, skinProfile: { ...current.skinProfile, ...patch } }))
  const addScan = (scan: ScanResult) => commit((current) => ({ ...current, skinProfile: { ...current.skinProfile, scans: [scan, ...current.skinProfile.scans] } }))

  const addToShelf = (productId: string, isCustom?: boolean, customName?: string) => {
    commit((current) => {
      if (current.shelf.some((item) => item.productId === productId && item.status === 'active')) return current
      const item: ShelfItem = { productId, addedAt: new Date().toISOString(), status: 'active', inRoutine: true, isCustom, customName }
      return { ...current, shelf: [...current.shelf, item] }
    })
    trackEvent('shelf_item_added', { product_id: productId, custom: Boolean(isCustom) })
  }

  const removeFromShelf = (productId: string) => commit((current) => ({ ...current, shelf: current.shelf.map((item) => (item.productId === productId ? { ...item, status: 'removed' } : item)) }))
  const markShelfItemFinished = (productId: string) => commit((current) => ({ ...current, shelf: current.shelf.map((item) => (item.productId === productId ? { ...item, status: 'finished' } : item)) }))
  const toggleShelfInRoutine = (productId: string, value: boolean) => commit((current) => ({ ...current, shelf: current.shelf.map((item) => (item.productId === productId ? { ...item, inRoutine: value } : item)) }))

  const saveRoutine = (routine: Routine) => {
    commit((current) => ({ ...current, routines: [routine, ...current.routines] }))
    trackEvent('routine_saved', { routine_id: routine.id, recommended_cost: routine.totalCost, owned_cost: routine.ownedCost })
  }

  const recordInteraction = (productId: string, type: Interaction['type']) => {
    commit((current) => ({ ...current, interactions: [{ productId, type, timestamp: new Date().toISOString() }, ...current.interactions] }))
    trackEvent(`recommendation_${type}`, { product_id: productId })
  }

  const addJourneyEntry = (entry: JourneyEntry) => commit((current) => ({ ...current, journey: [entry, ...current.journey] }))
  const setSubscription = (subscription: Subscription) => {
    commit((current) => ({ ...current, subscription }))
    trackEvent('subscription_status_changed', { status: subscription.status })
  }

  const addToCart = (productId: string, quantity = 1) => {
    commit((current) => {
      const existing = current.cart.find((item) => item.productId === productId)
      const cart = existing
        ? current.cart.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item))
        : [...current.cart, { productId, quantity }]
      return { ...current, cart }
    })
    trackEvent('add_to_cart', { product_id: productId, quantity })
  }

  const removeFromCart = (productId: string) => commit((current) => ({ ...current, cart: current.cart.filter((item) => item.productId !== productId) }))
  const clearCart = () => commit((current) => ({ ...current, cart: [] }))
  const updateBudget = (budget: number) => {
    commit((current) => {
      const user = current.user ? { ...current.user, monthlyBudget: budget } : null
      if (user) updateProfile(user)
      return { ...current, user }
    })
  }

  const value: AppContextValue = {
    ...state,
    backendConfigured: isSupabaseConfigured,
    isAdmin: state.user?.role === 'admin',
    signUp,
    logIn,
    logOut,
    completeOnboarding,
    dismissSkinProfileWelcome,
    updateSkinProfile,
    addScan,
    addToShelf,
    removeFromShelf,
    markShelfItemFinished,
    toggleShelfInRoutine,
    saveRoutine,
    recordInteraction,
    addJourneyEntry,
    setSubscription,
    addToCart,
    removeFromCart,
    clearCart,
    updateBudget,
    trackEvent,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

export function useActiveShelfProducts() {
  const { shelf } = useApp()
  const activeIds = shelf.filter((item) => item.status === 'active').map((item) => item.productId)
  return PRODUCTS.filter((product) => activeIds.includes(product.id))
}
