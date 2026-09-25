import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { EntityIcon, type EntityKind } from '@/components/common/entity-icon'
import { CatalogShell } from '@/components/home/catalog-shell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { CatalogListSkeleton } from './parts'

const TABS: ReadonlyArray<{ label: string; entity: EntityKind }> = [
  { label: 'Workflows', entity: 'workflow' },
  { label: 'Tools', entity: 'tool' },
  { label: 'Companies', entity: 'company' },
]

export function HomeSkeleton() {
  return (
    <CatalogShell>
      <div className="flex flex-col gap-8">
        <div
          aria-hidden="true"
          className="flex h-10 w-fit gap-1 rounded-full bg-hover p-1"
        >
          {TABS.map(({ label, entity }, index) => (
            <span
              className={cn(
                'type-control flex h-8 items-center gap-2 rounded-full border border-transparent px-4',
                index === 0
                  ? 'bg-background text-foreground ring-1 ring-border'
                  : 'text-subtle'
              )}
              key={label}
            >
              <EntityIcon entity={entity} size={16} />
              {label}
            </span>
          ))}
        </div>
        <div className="flex flex-col items-center gap-8">
          <div aria-hidden="true" className="w-full">
            <CatalogListSkeleton />
          </div>
          <Link
            className={buttonVariants({ variant: 'outline', size: 'pill' })}
            href="/workflows"
          >
            View all workflows
            <HugeiconsIcon
              aria-hidden="true"
              data-icon="inline-end"
              icon={ArrowRight02Icon}
              size={16}
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </div>
    </CatalogShell>
  )
}
