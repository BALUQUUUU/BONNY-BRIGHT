import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepProgress from '../../components/StepProgress'
import ForestBackdrop from '../../components/ForestBackdrop'
import { useApp } from '../../context/AppContext'
import { EthicalPreference, EthicalValue, PriorityLevel, ScanResult, SkinConcern, SkinGoal, SkinType } from '../../types'

const TOTAL_STEPS = 6

const SKIN_TYPES: SkinType[] = ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive', 'Not sure']
const CONCERNS: SkinConcern[] = ['Acne-prone', 'Dryness', 'Redness', 'Dullness', 'Pigmentation', 'Uneven texture', 'Sensitivity', 'Signs of ageing']
const GOALS: SkinGoal[] = [
  'Clearer skin',
  'Hydration',
  'Brighter appearance',
  'Calmer skin',
  'Smoother texture',
  'Night routine',
  'Event preparation',
  'General maintenance',
]
const ETHICAL_VALUES: EthicalValue[] = [
  'Cruelty-free',
  'Sustainable packaging',
  'Independent certification',
  'Natural ingredients',
  'Organic certification',
  'Ingredient transparency',
]

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

function generateScanSummary(skinType: SkinType, concerns: SkinConcern[]): string {
  const concernPhrase = concerns.length
    ? `with visible ${concerns.slice(0, 2).join(' and ').toLowerCase()}`
    : 'with a generally even appearance'
  const typePhrase = skinType === 'Not sure' ? 'a combination leaning profile' : `a ${skinType.toLowerCase()} leaning profile`
  return `Your skin appears to show ${typePhrase} ${concernPhrase}. This is an AI-assisted first read, not a diagnosis.`
}

const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, user } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const [name, setName] = useState(user?.name ?? '')
  const [ageRange, setAgeRange] = useState('')
  const [gender, setGender] = useState('')

  const [skinType, setSkinType] = useState<SkinType | ''>('')
  const [concerns, setConcerns] = useState<SkinConcern[]>([])

  const [goals, setGoals] = useState<SkinGoal[]>([])

  const [scanImage, setScanImage] = useState<string | undefined>(undefined)
  const [scanState, setScanState] = useState<'idle' | 'processing' | 'done'>('idle')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

  const [budget, setBudget] = useState(60)

  const [ethicalPrefs, setEthicalPrefs] = useState<Record<EthicalValue, PriorityLevel | undefined>>({} as any)

  const runScan = () => {
    setScanState('processing')
    window.setTimeout(() => {
      const result: ScanResult = {
        id: `scan-${Date.now()}`,
        date: new Date().toISOString(),
        imageDataUrl: scanImage,
        summary: generateScanSummary((skinType || 'Combination') as SkinType, concerns),
        detectedSkinType: (skinType || 'Combination') as SkinType,
        detectedConcerns: concerns.length ? concerns : ['Dullness', 'Uneven texture'],
        confidence: 78,
      }
      setScanResult(result)
      setScanState('done')
    }, 1600)
  }

  const onFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setScanImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const finish = () => {
    const finalScan: ScanResult =
      scanResult ?? {
        id: `scan-${Date.now()}`,
        date: new Date().toISOString(),
        summary: generateScanSummary((skinType || 'Combination') as SkinType, concerns),
        detectedSkinType: (skinType || 'Combination') as SkinType,
        detectedConcerns: concerns.length ? concerns : ['Dullness'],
        confidence: 70,
      }
    const preferences: EthicalPreference[] = Object.entries(ethicalPrefs)
      .filter(([, v]) => !!v)
      .map(([value, priority]) => ({ value: value as EthicalValue, priority: priority as PriorityLevel }))

    completeOnboarding({
      name: name || user?.name || 'there',
      ageRange,
      gender,
      skinType: (skinType || 'Not sure') as SkinType,
      concerns,
      goals,
      scan: finalScan,
      budget,
      ethicalPreferences: preferences,
    })
    navigate('/skin-profile', { state: { onboardingComplete: true } })
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return name.trim().length > 0 && ageRange !== '' && gender !== ''
      case 2:
        return skinType !== ''
      case 3:
        return goals.length > 0
      case 4:
        return true // scan is optional-friendly; can proceed without to avoid dead end
      case 5:
        return budget > 0
      case 6:
        return true
      default:
        return true
    }
  }

  return (
    <div className="forest-shell min-h-screen px-5 py-10 sm:py-16">
      <ForestBackdrop />
      <div className="relative z-10 mx-auto mb-7 max-w-md">
        <StepProgress step={step} total={TOTAL_STEPS} />
      </div>

      <div className="card relative z-10 mx-auto max-w-md animate-fadeUp p-6 sm:p-8">
        {step === 1 && (
          <section>
            <h2 className="font-display text-2xl text-forest-800">About you</h2>
            <p className="mt-1 text-sm text-charcoal/60">A little context to personalise everything that follows.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-forest-700">Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-forest-700">Age range</label>
                <div className="flex flex-wrap gap-2">
                  {['Under 18', '18–24', '25–34', '35–44', '45–54', '55+'].map((r) => (
                    <button key={r} onClick={() => setAgeRange(r)} className={`chip ${ageRange === r ? 'chip-active' : ''}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-forest-700">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {['Woman', 'Man', 'Non-binary', 'Prefer not to say'].map((g) => (
                    <button key={g} onClick={() => setGender(g)} className={`chip ${gender === g ? 'chip-active' : ''}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="font-display text-2xl text-forest-800">Your skin</h2>
            <p className="mt-1 text-sm text-charcoal/60">How would you describe your skin?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SKIN_TYPES.map((t) => (
                <button key={t} onClick={() => setSkinType(t)} className={`chip ${skinType === t ? 'chip-active' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
            <p className="mb-1.5 mt-6 text-sm font-semibold text-forest-700">Any concerns? Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map((c) => (
                <button key={c} onClick={() => setConcerns((prev) => toggle(prev, c))} className={`chip ${concerns.includes(c) ? 'chip-active' : ''}`}>
                  {c}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="font-display text-2xl text-forest-800">Your goals</h2>
            <p className="mt-1 text-sm text-charcoal/60">What are you hoping for? Select all that apply.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button key={g} onClick={() => setGoals((prev) => toggle(prev, g))} className={`chip ${goals.includes(g) ? 'chip-active' : ''}`}>
                  {g}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h2 className="font-display text-2xl text-forest-800">Skin scan</h2>
            <p className="mt-1 text-sm text-charcoal/60">Upload a clear facial photo for an AI-assisted first read.</p>
            <ul className="mt-3 space-y-1 text-xs text-charcoal/50">
              <li>• Natural lighting</li>
              <li>• No heavy makeup</li>
              <li>• Face clearly visible</li>
              <li>• Avoid filters</li>
            </ul>

            <div className="mt-5">
              {!scanImage && scanState === 'idle' && (
                <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-forest/25 bg-cream-100 text-center transition hover:border-forest/50">
                  <UploadIcon />
                  <span className="text-sm font-semibold text-forest-700">Upload Skin Photo</span>
                  <span className="text-xs text-charcoal/50">JPG or PNG</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
                </label>
              )}

              {scanImage && scanState === 'idle' && (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-forest/10">
                    <img src={scanImage} alt="Uploaded skin scan" className="h-full w-full object-cover" />
                  </div>
                  <button className="btn-primary w-full" onClick={runScan}>
                    Analyse my skin
                  </button>
                </div>
              )}

              {scanState === 'processing' && (
                <div className="relative flex aspect-square w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-forest/10 bg-forest-800">
                  {scanImage && <img src={scanImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-gold-light/60 to-transparent animate-scan" />
                  <p className="z-10 text-sm font-medium text-cream-100">Analysing your skin…</p>
                </div>
              )}

              {scanState === 'done' && scanResult && (
                <div className="space-y-4">
                  {scanImage && (
                    <div className="aspect-[3/2] w-full overflow-hidden rounded-2xl border border-forest/10">
                      <img src={scanImage} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="card p-5">
                    <p className="eyebrow mb-2">Initial Skin Profile</p>
                    <p className="text-sm leading-relaxed text-charcoal/80">{scanResult.summary}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest/10">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${scanResult.confidence}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-forest-500">{scanResult.confidence}% confidence</span>
                    </div>
                    <p className="mt-3 text-[11px] text-charcoal/45">
                      AI skin analysis provides general cosmetic guidance and is not medical advice or a diagnosis.
                    </p>
                  </div>
                </div>
              )}

              {!scanImage && scanState === 'idle' && (
                <button className="mt-4 w-full text-center text-xs font-semibold text-forest-500 hover:underline" onClick={() => setStep(5)}>
                  Skip for now — I'll scan later
                </button>
              )}
            </div>
          </section>
        )}

        {step === 5 && (
          <section>
            <h2 className="font-display text-2xl text-forest-800">Your budget</h2>
            <p className="mt-1 text-sm text-charcoal/60">How much do you want to spend on skincare each month?</p>
            <div className="mt-8 text-center">
              <span className="font-display text-5xl text-forest-800">${budget}</span>
              <span className="ml-1 text-sm text-charcoal/50">/month</span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-6 w-full accent-forest-700"
            />
            <div className="mt-1 flex justify-between text-xs text-charcoal/40">
              <span>$20</span>
              <span>$200</span>
            </div>
          </section>
        )}

        {step === 6 && (
          <section>
            <h2 className="font-display text-2xl text-forest-800">Your values</h2>
            <p className="mt-1 text-sm text-charcoal/60">What matters to you? Set a priority for each you select.</p>
            <div className="mt-5 space-y-3">
              {ETHICAL_VALUES.map((v) => (
                <div key={v} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-charcoal">{v}</span>
                  <div className="flex gap-1.5">
                    {(['Nice to have', 'Important', 'Essential'] as PriorityLevel[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setEthicalPrefs((prev) => ({ ...prev, [v]: prev[v] === p ? undefined : p }))}
                        className={`chip text-[11px] ${ethicalPrefs[v] === p ? 'chip-active' : ''}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          {step < TOTAL_STEPS ? (
            <button className="btn-primary" disabled={!canProceed()} onClick={() => setStep((s) => s + 1)}>
              Continue
            </button>
          ) : (
            <button className="btn-primary" onClick={finish}>
              Build My Skin Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-forest-500">
    <path d="M12 16V4M12 4 7 9M12 4l5 5" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
)

export default OnboardingFlow
