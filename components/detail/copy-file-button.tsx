'use client'

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { CompanyAvatar } from '@/components/common/company-avatars'
import { CopiedMark } from '@/components/detail/copied-mark'
import { useRecordCopy } from '@/components/detail/copy-count'
import { buttonVariants } from '@/components/ui/button'
import { toastManager } from '@/components/ui/toast-manager'
import { useCopy } from '@/lib/hooks/use-copy'
import { cn } from '@/lib/utils/cn'

export function showFileCopiedToast(
  noun: string,
  companies?: ReadonlyArray<CompanyAvatar>
) {
  toastManager.add({
    title: `${noun} copied`,
    description: 'Paste it into your agent.',
    media: <CopiedMark companies={companies} />,
  })
}

export function CopyFileButton({
  markdown,
  label,
  noun,
  companies,
  className,
}: {
  markdown: string
  label: string
  noun: string
  companies?: ReadonlyArray<CompanyAvatar>
  className?: string
}) {
  const { copied, copy } = useCopy()
  const recordCopy = useRecordCopy()
  return (
    <button
      className={cn(
        buttonVariants({ size: 'pill' }),
        'max-sm:flex-1',
        className
      )}
      onClick={async () => {
        if (await copy(markdown)) {
          showFileCopiedToast(noun, companies)
          recordCopy?.()
        }
      }}
      type="button"
    >
      <HugeiconsIcon
        aria-hidden="true"
        className="size-4"
        icon={copied ? Tick02Icon : Copy01Icon}
      />
      <span className="grid justify-items-start text-left">
        <span className={cn('col-start-1 row-start-1', copied && 'invisible')}>
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn('col-start-1 row-start-1', !copied && 'invisible')}
        >
          Copied!
        </span>
      </span>
    </button>
  )
}
