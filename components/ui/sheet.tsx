'use client'

import { Dialog as SheetPrimitive } from '@base-ui/react/dialog'
import { cn } from '@/lib/utils/cn'

/*
 * Thin wrappers over Base UI's Dialog. Transitions are the caller's, in CSS
 * on Base UI's `data-starting-style` / `data-ending-style` attributes, which
 * it holds until the exit finishes before unmounting.
 */

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetBackdrop({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      className={cn('fixed inset-0 z-50 bg-black/20', className)}
      data-slot="sheet-backdrop"
      {...props}
    />
  )
}

function SheetPopup({ className, ...props }: SheetPrimitive.Popup.Props) {
  return (
    <SheetPrimitive.Popup
      className={cn(
        'type-body fixed z-50 flex flex-col bg-popover text-popover-foreground outline-none',
        className
      )}
      data-slot="sheet-popup"
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      className={cn('type-body text-muted-foreground', className)}
      data-slot="sheet-description"
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      className={cn('type-subsection font-heading text-foreground', className)}
      data-slot="sheet-title"
      {...props}
    />
  )
}

export {
  Sheet,
  SheetBackdrop,
  SheetClose,
  SheetDescription,
  SheetPopup,
  SheetPortal,
  SheetTitle,
}
