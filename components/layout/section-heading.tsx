import type { ReactNode } from 'react'

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as: Heading = 'h2',
}: {
  eyebrow?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  as?: 'h1' | 'h2'
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col">
        {eyebrow ? <p className="type-body mb-1">{eyebrow}</p> : null}
        <Heading className="type-page-title">{title}</Heading>
        {description ? (
          <p className="type-body mt-2 max-w-xl">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
