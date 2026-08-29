import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useApp } from '../context/AppContext'

const Profile: React.FC = () => {
  const { user, skinProfile, logOut, updateBudget } = useApp()
  const navigate = useNavigate()
  const [notifRoutine, setNotifRoutine] = useState(true)
  const [notifJourney, setNotifJourney] = useState(true)
  const [notifSub, setNotifSub] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <AppShell>
      <div className="container-page max-w-3xl py-8 sm:py-12">
        <p className="eyebrow">Profile &amp; Settings</p>
        <h1 className="mt-1 font-display text-3xl text-forest-800">Hi, {user?.name ?? 'there'}.</h1>

        <SectionCard title="My Account">
          <Row label="Name" value={user?.name ?? '—'} />
          <Row label="Email" value={user?.email ?? '—'} />
          <Row label="Age range" value={user?.ageRange || '—'} />
          <Row label="Gender" value={user?.gender || '—'} />
        </SectionCard>

        <SectionCard title="Skin Profile" action={{ label: 'Edit', onClick: () => navigate('/skin-profile') }}>
          <Row label="Skin type" value={skinProfile.skinType || '—'} />
          <Row label="Concerns" value={skinProfile.concerns.join(', ') || '—'} />
          <Row label="Goals" value={skinProfile.goals.join(', ') || '—'} />
        </SectionCard>

        <SectionCard title="Budget">
          <div className="flex items-center justify-between">
            <span className="text-sm text-charcoal/60">Monthly budget</span>
            <input
              type="number"
              className="input w-28 text-right"
              value={user?.monthlyBudget ?? 0}
              onChange={(e) => updateBudget(Number(e.target.value))}
              min={0}
            />
          </div>
        </SectionCard>

        <SectionCard title="Preferences">
          {(user?.ethicalPreferences ?? []).length ? (
            <div className="flex flex-wrap gap-2">
              {user!.ethicalPreferences.map((p) => (
                <span key={p.value} className="chip">
                  {p.value} · {p.priority}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal/50">No ethical preferences set.</p>
          )}
        </SectionCard>

        <SectionCard title="My Data">
          <Row label="Skin photos" value={`${skinProfile.scans.filter((s) => s.imageDataUrl).length} saved`} />
          <Row label="Routine history" value="View in Routine Builder" />
          <Row label="Preference history" value="Used to shape recommendations" />
        </SectionCard>

        <SectionCard title="Privacy">
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary text-xs">Download my data</button>
            <button className="btn-secondary text-xs">Manage photo permissions</button>
            <button className="btn-secondary text-xs text-clay" onClick={() => setConfirmDelete(true)}>
              Delete my account
            </button>
          </div>
          {confirmDelete && (
            <p className="mt-3 rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay">
              Account deletion isn't wired up in this prototype — in production this would permanently remove your data.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Notifications">
          <Toggle label="Routine reminders" checked={notifRoutine} onChange={setNotifRoutine} />
          <Toggle label="Skin journey reminders" checked={notifJourney} onChange={setNotifJourney} />
          <Toggle label="Subscription notifications" checked={notifSub} onChange={setNotifSub} />
        </SectionCard>

        <SectionCard title="Find Bonny & Bright" action={{ label: 'View stores', onClick: () => navigate('/stores') }}>
          <p className="text-sm text-charcoal/60">Connect your online routine with our stores and Fine Foods partner locations.</p>
        </SectionCard>

        <button
          className="btn-secondary mt-8 w-full text-clay"
          onClick={() => {
            logOut()
            navigate('/')
          }}
        >
          Log out
        </button>
      </div>
    </AppShell>
  )
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; action?: { label: string; onClick: () => void } }> = ({
  title,
  children,
  action,
}) => (
  <div className="card mt-5 p-6">
    <div className="mb-3 flex items-center justify-between">
      <p className="eyebrow">{title}</p>
      {action && (
        <button onClick={action.onClick} className="text-xs font-semibold text-forest-600 hover:underline">
          {action.label}
        </button>
      )}
    </div>
    <div className="space-y-2">{children}</div>
  </div>
)

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-charcoal/50">{label}</span>
    <span className="font-medium text-charcoal">{value}</span>
  </div>
)

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between text-sm">
    <span className="text-charcoal/70">{label}</span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-forest-700" />
  </label>
)

export default Profile
