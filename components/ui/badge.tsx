import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'type-meta inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full border px-2.5',
  {
    variants: {
      variant: {
        outline: 'border-border bg-background text-faint',
        soft: 'border-transparent bg-hover text-soft',
        solid: 'border-foreground bg-foreground text-background',
        company: 'border-company/40 bg-company/5 text-company',
        tool: 'border-tool/40 bg-tool/5 text-tool',
      },
    },
    defaultVariants: { variant: 'outline' },
  }
)

export type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  )
}
