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

/**
 * A dialog centred on the screen, as every one on the site is: a blurred
 * backdrop, a floating panel 1rem clear of a phone's edges, and a short fade
 * and scale. The caller sets its width (`max-w-lg`…) and padding.
 */
const DIALOG_BACKDROP =
  'bg-background/60 backdrop-blur-sm transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none'

const DIALOG_POPUP =
  'floating-panel fixed top-1/2 left-1/2 w-[calc(100vw-2rem)] origin-center -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-[opacity,scale] duration-200 ease-out data-ending-style:scale-[0.97] data-starting-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none'

export {
  DIALOG_BACKDROP,
  DIALOG_POPUP,
  Sheet,
  SheetBackdrop,
  SheetClose,
  SheetDescription,
  SheetPopup,
  SheetPortal,
  SheetTitle,
}
