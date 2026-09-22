import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '@/lib/utils/cn'

const textareaVariants = cva(
  'type-control field-sizing-content flex min-h-24 w-full resize-none rounded-2xl border px-4 py-3 shadow-none outline-none transition-[color,border-color,background-color] duration-200 placeholder:text-faint disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-0',
  {
    variants: {
      variant: {
        default:
          'border-border bg-background hover:border-foreground/20 focus-visible:border-foreground/40',
        muted:
          'border-transparent bg-surface hover:border-foreground/15 focus-visible:border-foreground/40 focus-visible:bg-background',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Textarea({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea }
