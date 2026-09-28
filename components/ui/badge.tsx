import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Every pill on a detail page: tags, "Ways in" chips, company facts.
 * `badgeVariants` is exported like `buttonVariants`, so a pill that is a link
 * (a tag that filters a listing) takes the same classes as one that is not.
 *
 * The type size is its own option, not part of the base: `type-meta` and
 * `type-label` are custom utilities `cn` cannot see conflict, so a className
 * override would leave both in the attribute.
 */
const badgeVariants = cva(
  'inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5',
  {
    variants: {
      variant: {
        outline: 'border-border bg-background text-faint',
        soft: 'border-transparent bg-hover text-soft',
        /** Border only; the text colour comes from the row around it. */
        plain: '',
        /** A plain pill singled out: a primary tag, "Deprecated". */
        emphasis: 'border-foreground/20 bg-hover text-soft',
        /** "Ways in: MCP / API". */
        access: 'bg-hover text-subtle',
        solid: 'border-foreground bg-foreground text-background',
        company: 'border-company/40 bg-company/5 text-company',
        tool: 'border-tool/40 bg-tool/5 text-tool',
      },
      size: {
        meta: 'type-meta',
        label: 'type-label',
      },
      /** A pill that is a link: a focus ring, and it darkens on hover. */
      interactive: {
        true: 'focus-ring transition-colors duration-200 hover:border-foreground/20 hover:text-foreground',
      },
    },
    defaultVariants: { variant: 'outline', size: 'meta' },
  }
)

export type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>

export function Badge({
  className,
  variant,
  size,
  interactive,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, interactive }), className)}
      {...props}
    />
  )
}

export { badgeVariants }
