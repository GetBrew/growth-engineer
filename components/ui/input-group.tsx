'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

const inputGroupVariants = cva(
  'group/input-group relative flex w-full min-w-0 items-center shadow-none outline-none transition-[color,border-color,background-color] duration-200 focus-within:ring-0 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-start]]:h-auto has-[>textarea]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:flex-col has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-0 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-start]]:[&>input]:pl-1.5',
  {
    variants: {
      variant: {
        default:
          'border-border bg-background focus-within:border-foreground/40 hover:border-foreground/20',
        muted:
          'border-transparent bg-surface focus-within:border-foreground/40 focus-within:bg-background hover:border-foreground/15',
      },
      controlSize: {
        default: 'h-12 rounded-full border',
        lg: 'h-14 rounded-full border',
      },
    },
    defaultVariants: {
      variant: 'default',
      controlSize: 'default',
    },
  }
)

function InputGroup({
  className,
  variant = 'default',
  controlSize = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupVariants>) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a styled wrapper, not a form section; <fieldset> would bring its own layout and disabled semantics
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        inputGroupVariants({ variant, controlSize }),
        'in-data-[slot=combobox-content]:focus-within:border-inherit',
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "type-control flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-muted-foreground **:data-[slot=kbd]:rounded-2xl **:data-[slot=kbd]:bg-muted-foreground/10 **:data-[slot=kbd]:px-1.5 group-data-[disabled=true]/input-group:opacity-50 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        'inline-start':
          'order-first pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]',
        'inline-end':
          'order-last pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]',
        'block-start':
          'order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2',
        'block-end':
          'order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
)

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: see InputGroup
    // biome-ignore lint/a11y/useKeyWithClickEvents: mouse convenience only; keyboard users reach the input directly
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: the click forwards focus to the input, it is not an action
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'h-full flex-1 px-0 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0',
        className
      )}
      variant="unstyled"
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupInput }
