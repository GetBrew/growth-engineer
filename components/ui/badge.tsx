import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 font-normal text-[11px] leading-none',
  {
    variants: {
      variant: {
        outline: 'border-border bg-background text-foreground/60',
        soft: 'border-transparent bg-black/[0.04] text-foreground/70',
        solid: 'border-foreground bg-foreground text-background',
        company: 'border-company/40 bg-company/5 text-company',
        tool: 'border-tool/40 bg-tool/5 text-tool',
        workflow: 'border-workflow/40 bg-workflow/5 text-workflow',
        tag: 'border-tag/40 bg-tag/5 text-tag',
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
