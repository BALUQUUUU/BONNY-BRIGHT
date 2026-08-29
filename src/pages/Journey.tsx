import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useApp } from '../context/AppContext'
import { JourneyEntry } from '../types'

const Journey: React.FC = () => {
  const { journey, addJourneyEntry, routines } = useApp()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const [checkInSaved, setCheckInSaved] = useState(false)

  const daysFollowed = Math.min(18, 25)
  const adherence = Math.round((daysFollowed / 25) * 100)

  const onFile = (file: File | null) => {
    if (!file) return
    setCheckInSaved(false)
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const submit = () => {
    if (!image && !note.trim()) return
    const entry: JourneyEntry = {
      id: `journey-${Date.now()}`,
      date: new Date().toISOString(),
      imageDataUrl: image,
      note: note.trim() || 'Check-in photo added.',
      routineName: routines[0]?.name ?? 'Current routine',
    }
    addJourneyEntry(entry)
    setNote('')
    setImage(undefined)
    setCheckInSaved(true)
  }

  return (
    <AppShell>
      <div className="container-page max-w-4xl py-8 sm:py-12">
        <p className="eyebrow">Your Skin Journey</p>
        <h1 className="mt-1 font-display text-3xl text-forest-800 sm:text-4xl">Track how your skin's appearance is changing.</h1>
        <p className="mt-2 max-w-xl text-sm text-charcoal/60">
          Visible appearance can shift with a consistent routine — this is an observational log, not a medical record.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card p-5 text-center">
            <p className="font-display text-3xl text-forest-800">{adherence}%</p>
            <p className="mt-1 text-xs text-charcoal/50">Routine adherence</p>
          </div>
          <div className="card p-5 text-center">
            <p className="font-display text-3xl text-forest-800">
              {daysFollowed} / 25
            </p>
            <p className="mt-1 text-xs text-charcoal/50">Days followed</p>
          </div>
          <div className="card p-5 text-center">
            <p className="font-display text-lg text-forest-800">{routines[0]?.name ?? 'Not started'}</p>
            <p className="mt-1 text-xs text-charcoal/50">Current routine</p>
          </div>
        </div>

        <div className="card mt-8 p-6">
          <p className="eyebrow mb-3">Add a check-in</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="btn-secondary cursor-pointer text-xs">
              Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>
            <input
              className="input"
              placeholder="How does your skin look/feel today?"
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                setCheckInSaved(false)
              }}
            />
            <button className="btn-primary shrink-0" onClick={submit}>
              Save entry
            </button>
          </div>
          {image && <img src={image} alt="Preview" className="mt-4 h-32 w-32 rounded-xl object-cover" />}
        </div>

        {checkInSaved && (
          <div className="completion-panel card mt-5 flex flex-col gap-4 border border-forest/15 bg-forest/5 p-5 sm:flex-row sm:items-center sm:justify-between" role="status">
            <div>
              <p className="eyebrow mb-1">Next step</p>
              <p className="font-semibold text-forest-800">Your check-in is saved.</p>
              <p className="mt-1 text-sm text-charcoal/65">Your progress log is ready whenever you want to compare your journey.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-primary"
                onClick={() => document.getElementById('journey-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Track My Progress
              </button>
              <button className="btn-secondary" onClick={() => navigate('/routine-builder')}>
                Continue My Routine
              </button>
            </div>
          </div>
        )}

        <div id="journey-history" className="mt-10 space-y-5 scroll-mt-24">
          {journey.length === 0 ? (
            <p className="rounded-xl border border-dashed border-forest/20 p-8 text-center text-sm text-charcoal/50">
              No check-ins yet — add your first photo or note above.
            </p>
          ) : (
            journey.map((entry, i) => (
              <div key={entry.id} className="card flex gap-4 p-4">
                {entry.imageDataUrl ? (
                  <img src={entry.imageDataUrl} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-xs text-forest-400">
                    Week {journey.length - i}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-forest-500">{new Date(entry.date).toLocaleDateString()}</p>
                  <p className="mt-1 text-sm text-charcoal/75">{entry.note}</p>
                  <p className="mt-1 text-xs text-charcoal/40">{entry.routineName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}

export default Journey
