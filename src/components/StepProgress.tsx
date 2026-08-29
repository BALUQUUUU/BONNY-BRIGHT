import React from 'react'

const StepProgress: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <div className="mx-auto w-full max-w-md">
    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-forest-500">
      <span>
        Step {step} / {total}
      </span>
      <span>{Math.round((step / total) * 100)}%</span>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-forest/10">
      <div className="h-full rounded-full bg-forest transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
    </div>
  </div>
)

export default StepProgress
