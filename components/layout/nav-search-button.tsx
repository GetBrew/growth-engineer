'use client'

import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { openCommandPalette } from '@/components/search/command-palette-store'
import { Button } from '@/components/ui/button'

export function NavSearchButton() {
  return (
    <Button
      aria-keyshortcuts="Meta+K Control+K"
      onClick={openCommandPalette}
      size="icon-pill"
      variant="ghost"
    >
      <HugeiconsIcon
        aria-hidden="true"
        icon={Search01Icon}
        size={20}
        strokeWidth={1.8}
      />
      <span className="sr-only">Search the catalog</span>
    </Button>
  )
}
