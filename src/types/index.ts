export type SkinType = 'Dry' | 'Oily' | 'Combination' | 'Normal' | 'Sensitive' | 'Not sure'

export type SkinConcern =
  | 'Acne-prone'
  | 'Dryness'
  | 'Redness'
  | 'Dullness'
  | 'Pigmentation'
  | 'Uneven texture'
  | 'Sensitivity'
  | 'Signs of ageing'

export type SkinGoal =
  | 'Clearer skin'
  | 'Hydration'
  | 'Brighter appearance'
  | 'Calmer skin'
  | 'Smoother texture'
  | 'Night routine'
  | 'Event preparation'
  | 'General maintenance'

export type EthicalValue =
  | 'Cruelty-free'
  | 'Sustainable packaging'
  | 'Independent certification'
  | 'Natural ingredients'
  | 'Organic certification'
  | 'Ingredient transparency'

export type PriorityLevel = 'Nice to have' | 'Important' | 'Essential'

export type VerificationStatus = 'verified' | 'partial' | 'unavailable'

export interface EthicalPreference {
  value: EthicalValue
  priority: PriorityLevel
}

export interface User {
  id: string
  name: string
  email: string
  role?: 'customer' | 'admin'
  ageRange: string
  gender: string
  monthlyBudget: number
  ethicalPreferences: EthicalPreference[]
  createdAt: string
  onboarded: boolean
}

export interface ScanResult {
  id: string
  date: string
  imageDataUrl?: string
  summary: string
  detectedSkinType: SkinType
  detectedConcerns: SkinConcern[]
  confidence: number
}

export interface SkinProfile {
  skinType: SkinType
  concerns: SkinConcern[]
  goals: SkinGoal[]
  scans: ScanResult[]
}

export interface Certification {
  name: string
  status: VerificationStatus
  certifyingBody?: string
  dateVerified?: string
}

export interface Product {
  id: string
  name: string
  category: 'Face' | 'Bath & Body' | 'Cosmetics' | "Men's Line"
  subCategory: string
  price: number
  description: string
  positioning: string
  howToUse: string[]
  keyIngredients: { name: string; purpose: string; whyItMatters: string }[]
  fullIngredients: string
  skinTypes: SkinType[]
  concerns: SkinConcern[]
  certifications: Certification[]
  crueltyFree: VerificationStatus
  sustainablePackaging: VerificationStatus
  packagingInfo: string
  image: string
  accent: string
  availability: 'available' | 'limited' | 'unavailable'
  collection?: string
}

export type ShelfStatus = 'active' | 'finished' | 'removed'

export interface ShelfItem {
  productId: string
  addedAt: string
  status: ShelfStatus
  inRoutine: boolean
  isCustom?: boolean
  customName?: string
}

export interface RoutineStep {
  order: number
  productId: string
  productName: string
  price: number
  owned: boolean
  reason: string
}

export interface Routine {
  id: string
  name: string
  goal: string
  createdAt: string
  morning: RoutineStep[]
  evening: RoutineStep[]
  totalCost: number
  ownedCost: number
  budgetStatus: 'under' | 'at' | 'over'
  explanation: string
}

export type InteractionType = 'like' | 'dislike' | 'skip'

export interface Interaction {
  productId: string
  type: InteractionType
  timestamp: string
}

export interface JourneyEntry {
  id: string
  date: string
  imageDataUrl?: string
  note: string
  routineName: string
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'none'

export interface Subscription {
  status: SubscriptionStatus
  products: { productId: string; reason: string; type: 'owned' | 'replacement' | 'new' }[]
  budget: number
  nextBillingDate: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface SalesDashboardMetrics {
  dailyRevenueCents: number
  weeklyRevenueCents: number
  monthlyRevenueCents: number
  paidOrders: number
  averageOrderValueCents: number
  activeSubscriptions: number
  pausedSubscriptions: number
  cancelledSubscriptions: number
  monthlyRecurringRevenueCents: number
}
