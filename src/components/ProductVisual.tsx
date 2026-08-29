import React from 'react'

interface Props {
  shape: string
  accent: string
  className?: string
}

/**
 * Packaging is intentionally rendered as a restrained, brand-neutral
 * silhouette. Editorial photography belongs to section backdrops, not to a
 * catalog card that represents a specific Bonny & Bright product.
 */
const ProductVisual: React.FC<Props> = ({ shape, accent, className }) => (
  <div className={`product-visual relative grid place-items-center overflow-hidden rounded-2xl border border-white/60 bg-cream-100 shadow-inner ${className ?? ''}`}>
    <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 72% 18%, ${accent}28, transparent 38%), linear-gradient(145deg, #ffffff 0%, #f4ecde 100%)` }} />
    <div className="absolute inset-x-7 bottom-5 h-px bg-forest/10" />
    <PackageSilhouette shape={shape} accent={accent} />
  </div>
)

const PackageSilhouette: React.FC<{ shape: string; accent: string }> = ({ shape, accent }) => {
  const label = <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-forest-700/65">B&amp;B</span>
  const packageStyle = { borderColor: `${accent}80`, boxShadow: `0 16px 24px -18px ${accent}` }

  if (shape === 'dropper') {
    return (
      <div className="relative h-[72%] w-[38%]" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[18%] w-[26%] -translate-x-1/2 rounded-full border" style={{ ...packageStyle, backgroundColor: accent }} />
        <div className="absolute left-1/2 top-[14%] h-[16%] w-[42%] -translate-x-1/2 rounded-sm border bg-forest-800" style={packageStyle} />
        <div className="absolute inset-x-0 bottom-0 h-[62%] rounded-[18%_18%_25%_25%] border bg-cream-50" style={packageStyle}>{label}</div>
      </div>
    )
  }

  if (shape === 'bottle') {
    return (
      <div className="relative h-[70%] w-[42%]" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[14%] w-[58%] -translate-x-1/2 rounded-t-md border bg-forest-800" style={packageStyle} />
        <div className="absolute inset-x-0 bottom-0 h-[88%] rounded-[13%_13%_18%_18%] border bg-cream-50" style={packageStyle}>{label}</div>
      </div>
    )
  }

  if (shape === 'balm') {
    return (
      <div className="relative h-[43%] w-[68%]" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-[26%] rounded-full border bg-cream-50" style={packageStyle} />
        <div className="absolute inset-x-[3%] bottom-0 h-[76%] rounded-b-[38%] border bg-cream-50" style={packageStyle}>{label}</div>
      </div>
    )
  }

  return (
    <div className="relative h-[57%] w-[58%]" aria-hidden="true">
      <div className="absolute left-1/2 top-0 h-[13%] w-[76%] -translate-x-1/2 rounded-t-lg border bg-forest-800" style={packageStyle} />
      <div className="absolute inset-x-0 bottom-0 h-[88%] rounded-[25%_25%_18%_18%] border bg-cream-50" style={packageStyle}>{label}</div>
    </div>
  )
}

export default ProductVisual
