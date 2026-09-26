import {
  Building03Icon,
  ToolsIcon,
  WorkflowSquare03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils/cn'

export type EntityKind = 'workflow' | 'tool' | 'company'

const ENTITY_ICONS = {
  workflow: WorkflowSquare03Icon,
  tool: ToolsIcon,
  company: Building03Icon,
} as const

export function EntityIcon({
  entity,
  size = 16,
  className,
}: {
  entity: EntityKind
  size?: number
  className?: string
}) {
  return (
    <HugeiconsIcon
      aria-hidden="true"
      className={cn('shrink-0', className)}
      icon={ENTITY_ICONS[entity]}
      size={size}
      strokeWidth={1.8}
    />
  )
}
