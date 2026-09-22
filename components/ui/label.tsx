'use client'

import type * as React from 'react'
import { cn } from '@/lib/utils/cn'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: callers provide htmlFor or nest the associated control.
    <label
      data-slot="label"
      className={cn(
        'type-label flex select-none items-center gap-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Label }
