import type * as React from 'react'

import { cn } from '@/lib/utils/cn'

/** shadcn's Kbd, drawn the site's way: a thin outline and label type. */
function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'type-label pointer-events-none inline-flex w-fit select-none items-center justify-center gap-1 rounded-sm border px-1.5 py-0.5',
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
