import { PRODUCTS, findProduct } from '../data/products'
import { Product, Routine, RoutineStep, ShelfItem, SkinConcern, SkinProfile } from '../types'

/** Keyword map used to interpret free-text prompts into concerns/goals, like a lightweight intent parser. */
const KEYWORD_CONCERNS: { pattern: RegExp; concern: SkinConcern }[] = [
  { pattern: /dry|dehydrat|tight/i, concern: 'Dryness' },
  { pattern: /dull|dark|uneven glow|tired/i, concern: 'Dullness' },
  { pattern: /acne|breakout|spot|blemish/i, concern: 'Acne-prone' },
  { pattern: /red|irritat|sensitive|react/i, concern: 'Redness' },
  { pattern: /pigment|dark spot|discolo/i, concern: 'Pigmentation' },
  { pattern: /textur|bump|rough/i, concern: 'Uneven texture' },
  { pattern: /age|fine line|wrinkle|mature/i, concern: 'Signs of ageing' },
]

export interface AdvisorRequest {
  prompt: string
  profile: SkinProfile
  shelf: ShelfItem[]
  budget: number
  ethicalMustHaves: string[]
}

function parsePromptConcerns(prompt: string): SkinConcern[] {
  const found = KEYWORD_CONCERNS.filter((k) => k.pattern.test(prompt)).map((k) => k.concern)
  return Array.from(new Set(found))
}

function ownedProductIdsFromShelf(shelf: ShelfItem[]): Set<string> {
  return new Set(shelf.filter((s) => s.status === 'active').map((s) => s.productId))
}

/** Picks the best-fit product for a routine role, preferring what's already owned. */
function bestMatch(
  candidates: Product[],
  concerns: SkinConcern[],
  skinType: string,
  owned: Set<string>,
): Product | undefined {
  const scored = candidates
    .map((p) => {
      let score = 0
      if (owned.has(p.id)) score += 100 // strongly prefer what they already have
      score += p.concerns.filter((c) => concerns.includes(c)).length * 10
      if (p.skinTypes.includes(skinType as any)) score += 5
      if (p.availability !== 'available') score -= 1000
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
  return scored[0]?.p
}

export function buildRoutine(req: AdvisorRequest): Routine {
  const { prompt, profile, shelf, budget } = req
  const owned = ownedProductIdsFromShelf(shelf)

  const promptConcerns = parsePromptConcerns(prompt)
  const concerns: SkinConcern[] =
    promptConcerns.length > 0 ? promptConcerns : profile.concerns.length > 0 ? profile.concerns : ['Dryness']

  const cleansers = PRODUCTS.filter((p) => p.subCategory === 'Cleanser' || p.subCategory.includes('gel'))
  const serums = PRODUCTS.filter((p) => p.subCategory.toLowerCase().includes('serum'))
  const dayCreams = PRODUCTS.filter((p) => p.subCategory === 'Moisturiser')
  const nightTreatments = PRODUCTS.filter((p) => p.subCategory === 'Night treatment')

  // Cleanser step: fall back to a generic "Cleanse" placeholder if nothing owned/available fits.
  const cleanserPick = bestMatch(cleansers, concerns, profile.skinType, owned)

  const serumPick = bestMatch(serums, concerns, profile.skinType, owned)
  const creamPick = bestMatch(dayCreams, concerns, profile.skinType, owned)
  const nightPick =
    concerns.includes('Dryness') || concerns.includes('Signs of ageing') || /night/i.test(prompt)
      ? bestMatch(nightTreatments, concerns, profile.skinType, owned)
      : undefined

  const explainFor = (p: Product, isOwned: boolean): string => {
    if (isOwned) {
      const matched = p.concerns.filter((c) => concerns.includes(c))
      return matched.length
        ? `Already in your shelf, and it covers ${matched.join(', ').toLowerCase()} — no need to replace it.`
        : `Already in your shelf and suitable for your skin type — kept in place.`
    }
    const matched = p.concerns.filter((c) => concerns.includes(c))
    return matched.length
      ? `Fills the gap for ${matched.join(', ').toLowerCase()} that nothing on your shelf currently covers.`
      : `Recommended to round out this routine for your skin type.`
  }

  const toStep = (order: number, p: Product | undefined, fallbackName: string): RoutineStep | undefined => {
    if (!p) {
      return { order, productId: '', productName: fallbackName, price: 0, owned: true, reason: 'Use your current cleanser — no change needed here.' }
    }
    const isOwned = owned.has(p.id)
    return { order, productId: p.id, productName: p.name, price: isOwned ? 0 : p.price, owned: isOwned, reason: explainFor(p, isOwned) }
  }

  const morning: RoutineStep[] = [
    toStep(1, cleanserPick, 'Cleanse')!,
    toStep(2, serumPick, 'Serum')!,
    toStep(3, creamPick, 'Moisturiser')!,
  ].filter(Boolean) as RoutineStep[]

  const evening: RoutineStep[] = [
    toStep(1, cleanserPick, 'Cleanse')!,
    toStep(2, serumPick, 'Serum')!,
    nightPick ? toStep(3, nightPick, 'Night treatment')! : toStep(3, creamPick, 'Moisturiser')!,
  ].filter(Boolean) as RoutineStep[]

  // Dedupe cost across morning+evening (same product used twice shouldn't double count).
  const uniqueNewProductIds = new Set(
    [...morning, ...evening].filter((s) => s.productId && !s.owned).map((s) => s.productId),
  )
  const uniqueOwnedProductIds = new Set(
    [...morning, ...evening].filter((s) => s.productId && s.owned).map((s) => s.productId),
  )

  let totalCost = Array.from(uniqueNewProductIds).reduce((sum, id) => sum + (findProduct(id)?.price ?? 0), 0)
  const ownedCost = Array.from(uniqueOwnedProductIds).reduce((sum, id) => sum + (findProduct(id)?.price ?? 0), 0)

  // Budget optimisation: if over budget, swap the most expensive new item for the trial-size alternative when available.
  let budgetStatus: Routine['budgetStatus'] = totalCost === budget ? 'at' : totalCost > budget ? 'over' : 'under'

  if (budgetStatus === 'over') {
    const sample = findProduct('sample-serum-hydration')
    const serumStep = [...morning, ...evening].find((s) => s.productId === serumPick?.id && !s.owned)
    if (sample && serumStep && concerns.includes('Dryness')) {
      const savings = (serumPick?.price ?? 0) - sample.price
      const projected = totalCost - savings
      if (projected <= budget) {
        for (const step of [morning, evening]) {
          const s = step.find((st) => st.productId === serumPick?.id)
          if (s) {
            s.productId = sample.id
            s.productName = sample.name
            s.price = sample.price
            s.reason = 'Swapped in a trial-size hydration serum to fit your budget while still closing the gap.'
          }
        }
        totalCost = projected
        budgetStatus = totalCost === budget ? 'at' : totalCost > budget ? 'over' : 'under'
      }
    }
  }

  const ownedCount = [...morning, ...evening].filter((s) => s.productId && s.owned).length
  const totalSlots = [...morning, ...evening].filter((s) => s.productId).length
  const dedupedOwnedCount = uniqueOwnedProductIds.size
  const dedupedTotal = uniqueOwnedProductIds.size + uniqueNewProductIds.size

  const goalLabel = concerns.slice(0, 2).join(' & ').toLowerCase()
  const explanation =
    dedupedOwnedCount === dedupedTotal
      ? `You already have what you need. Every product in this routine is already on your shelf — nothing to buy right now.`
      : `Your existing products already cover part of this routine. ${dedupedTotal - dedupedOwnedCount === 1 ? 'One product' : `${dedupedTotal - dedupedOwnedCount} products`} ${dedupedTotal - dedupedOwnedCount === 1 ? 'was' : 'were'} identified as missing for ${goalLabel || 'your goal'}.`

  return {
    id: `routine-${Date.now()}`,
    name: `Your ${concerns[0] ?? 'Personalised'} Routine`,
    goal: `Address ${concerns.join(', ').toLowerCase()}`,
    createdAt: new Date().toISOString(),
    morning,
    evening,
    totalCost,
    ownedCost,
    budgetStatus,
    explanation,
  }
}

export const SUGGESTED_PROMPTS = [
  'My skin feels dry.',
  'I want a night routine.',
  "I'm preparing for an event.",
  'My skin looks dull.',
  'Build me a routine using what I already own.',
  'I have $30 to spend.',
]
