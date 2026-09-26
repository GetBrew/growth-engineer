import { Input as InputPrimitive } from '@base-ui/react/input'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '@/lib/utils/cn'

const inputVariants = cva(
  'type-control file:type-label w-full min-w-0 rounded-full border px-4 shadow-none outline-none transition-[color,border-color,background-color] duration-200 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-foreground placeholder:text-faint disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-0',
  {
    variants: {
      variant: {
        default:
          'border-border bg-background hover:border-foreground/20 focus-visible:border-foreground/40',
        muted:
          'border-transparent bg-surface hover:border-foreground/15 focus-visible:border-foreground/40 focus-visible:bg-background',
        unstyled:
          'rounded-none border-transparent bg-transparent hover:border-transparent focus-visible:border-transparent',
      },
      controlSize: {
        default: 'h-10 py-2',
        lg: 'h-12 px-5 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      controlSize: 'default',
    },
  }
)

function Input({
  className,
  type,
  variant = 'default',
  controlSize = 'default',
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, controlSize }), className)}
      {...props}
    />
  )
}

export { Input }
