import { formatCount, formatExact } from '@/lib/usage/stats'

export function UsageFigures({
  total,
  week,
  isUnderHeading = false,
}: {
  total: number
  week: number
  isUnderHeading?: boolean
}) {
  if (total === 0) {
    return null
  }
  let unit = total === 1 ? 'use' : 'uses'
  if (isUnderHeading) {
    unit = 'total'
  }
  return (
    <>
      <span className="type-stat text-foreground">
        {formatCount(total)} {unit}
      </span>
      {week > 0 ? (
        <span className="type-meta">+{formatExact(week)} this week</span>
      ) : null}
    </>
  )
}
