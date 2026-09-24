import type { ReactNode } from 'react'

export function CategorySection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-(--space-md)">
      <div className="flex items-baseline gap-3">
        <h2 className="type-category">{title}</h2>
        <span className="type-meta">{count}</span>
      </div>
      <div className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
        {children}
      </div>
    </section>
  )
}
