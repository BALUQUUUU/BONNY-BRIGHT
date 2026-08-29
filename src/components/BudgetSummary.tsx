import React from 'react'
import { Routine } from '../types'

const BudgetSummary: React.FC<{ routine: Routine; budget: number }> = ({ routine, budget }) => {
  const remaining = budget - routine.totalCost
  const statusCopy =
    routine.budgetStatus === 'under'
      ? `You still have $${remaining} available this month.`
      : routine.budgetStatus === 'at'
        ? 'Your routine uses your full monthly budget.'
        : `This routine is $${Math.abs(remaining)} over your budget.`

  const statusColor =
    routine.budgetStatus === 'over' ? 'text-clay' : routine.budgetStatus === 'at' ? 'text-gold-dark' : 'text-forest-700'

  return (
    <div className="card p-5">
      <p className="eyebrow mb-3">Budget engine</p>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-charcoal/60">New purchases</span>
        <span className="font-display text-2xl text-forest-800">${routine.totalCost}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between text-sm text-charcoal/60">
        <span>Monthly budget</span>
        <span>${budget}</span>
      </div>
      {routine.ownedCost > 0 && (
        <p className="mt-3 rounded-lg bg-forest/5 px-3 py-2 text-xs font-medium text-forest-700">
          You already own ${routine.ownedCost} worth of the products this routine needs.
        </p>
      )}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-forest/10">
        <div
          className={`h-full rounded-full transition-all ${routine.budgetStatus === 'over' ? 'bg-clay' : 'bg-forest'}`}
          style={{ width: `${Math.min(100, (routine.totalCost / Math.max(budget, 1)) * 100)}%` }}
        />
      </div>
      <p className={`mt-3 text-sm font-semibold ${statusColor}`}>{statusCopy}</p>
      {routine.budgetStatus === 'over' && (
        <button className="btn-secondary mt-3 w-full text-xs">Find a lower-cost alternative</button>
      )}
    </div>
  )
}

export default BudgetSummary
