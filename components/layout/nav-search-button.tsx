'use client'

import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { openCommandPalette } from '@/lib/stores/command-palette'
import { preloadSearchIndex } from '@/lib/stores/search-index'

export function NavSearchButton() {
  return (
    <Button
      aria-keyshortcuts="Meta+K Control+K"
      onClick={openCommandPalette}
      // Intent to search: start fetching the index before the click lands.
      onFocus={() => preloadSearchIndex()}
      onPointerEnter={() => preloadSearchIndex()}
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
