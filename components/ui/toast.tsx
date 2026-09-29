'use client'

import { Toast as ToastPrimitive } from '@base-ui/react/toast'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type ReactNode, useEffect } from 'react'
import { connectToaster } from '@/components/ui/toast-manager'
import { cn } from '@/lib/utils/cn'

/**
 * shadcn's Base UI toast, trimmed to what the site uses: one at a time,
 * bottom right (full width at the bottom on a phone), gone after three
 * seconds. Toasts are raised through `toastManager` (./toast-manager); this
 * draws them, and the root layout loads it lazily (./lazy-toaster).
 */
const baseManager = ToastPrimitive.createToastManager()

/** What a toast may carry beyond its words: a picture on its left. */
type ToastData = { media?: ReactNode }

export function Toaster() {
  return (
    <ToastPrimitive.Provider
      limit={1}
      timeout={3000}
      toastManager={baseManager}
    >
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-sm">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  useEffect(
    () =>
      connectToaster(({ title, description, media }) =>
        baseManager.add({ title, description, data: { media } })
      ),
    []
  )
  return toasts.map((toast) => {
    const { media } = (toast.data ?? {}) as ToastData
    return (
      <ToastPrimitive.Root
        className={cn(
          'absolute inset-x-0 bottom-0 flex items-center gap-4 rounded-3xl bg-popover p-3 pr-4 text-popover-foreground shadow-lg outline-hidden ring-1 ring-foreground/5 transition-[opacity,translate,scale] duration-300 ease-out dark:ring-foreground/10',
          'data-[starting-style]:translate-y-4 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
          'data-[ending-style]:translate-y-2 data-[ending-style]:opacity-0',
          !media && 'pl-4'
        )}
        key={toast.id}
        toast={toast}
      >
        {media}
        <ToastPrimitive.Content className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastPrimitive.Title className="type-item" />
          <ToastPrimitive.Description className="type-label text-soft" />
        </ToastPrimitive.Content>
        <ToastPrimitive.Close
          aria-label="Close"
          className="focus-ring -mr-1 grid size-7 shrink-0 place-items-center self-start rounded-full text-faint transition-colors hover:bg-hover hover:text-foreground"
        >
          <HugeiconsIcon
            aria-hidden="true"
            icon={Cancel01Icon}
            size={14}
            strokeWidth={2}
          />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    )
  })
}
