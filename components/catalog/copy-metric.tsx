import {
  COPY_ANGLES,
  type CopyAngle,
  formatCount,
  formatExact,
} from '@/lib/usage/stats'

/**
 * A row's count on one angle, at its right edge: "1.2K" copies, or "+34"
 * this week on Hot. Nothing for 0 — an empty slot, never a made-up number.
 */
export function CopyMetric({
  value,
  angle,
}: {
  value: number
  angle: CopyAngle
}) {
  if (value <= 0) {
    return null
  }
  return (
    <span className="type-control shrink-0 text-soft tabular-nums">
      <span aria-hidden="true">
        {angle === 'hot' ? '+' : ''}
        {formatCount(value)}
      </span>
      <span className="sr-only">
        , {formatExact(value)} {COPY_ANGLES[angle].unit}
      </span>
    </span>
  )
}
