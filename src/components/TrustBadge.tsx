import React from 'react'
import { VerificationStatus } from '../types'

const CONFIG: Record<VerificationStatus, { label: string; symbol: string; classes: string }> = {
  verified: { label: 'Verified', symbol: '\u2713', classes: 'bg-forest-700 text-cream-100 border-forest-700' },
  partial: { label: 'Partially verified', symbol: '!', classes: 'bg-gold/15 text-gold-dark border-gold/40' },
  unavailable: { label: 'Verification unavailable', symbol: '?', classes: 'bg-charcoal/5 text-charcoal/60 border-charcoal/15' },
}

const TrustBadge: React.FC<{ status: VerificationStatus; label?: string; className?: string }> = ({ status, label, className }) => {
  const c = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${c.classes} ${className ?? ''}`}>
      <span aria-hidden="true">{c.symbol}</span>
      {label ?? c.label}
    </span>
  )
}

export default TrustBadge
