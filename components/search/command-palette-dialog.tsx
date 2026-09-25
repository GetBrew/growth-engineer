'use client'

import {
  ArrowRight01Icon,
  Building03Icon,
  Search01Icon,
  WorkflowSquare01Icon,
  Wrench01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Sheet,
  SheetBackdrop,
  SheetDescription,
  SheetPopup,
  SheetPortal,
  SheetTitle,
} from '@/components/ui/sheet'
import type { EntityType } from '@/lib/catalog/keys'
import { searchPaletteItems } from '@/lib/catalog/search'
import { SECTIONS } from '@/lib/constants/sections'
import {
  setCommandPaletteOpen,
  toggleCommandPalette,
  useCommandPaletteOpen,
} from '@/lib/stores/command-palette'
import type { PaletteItem } from '@/lib/types/catalog'
import { cn } from '@/lib/utils/cn'

const MAX_RESULTS = 15

const KIND_ICON = {
  workflow: WorkflowSquare01Icon,
  tool: Wrench01Icon,
  company: Building03Icon,
} as const

const GROUPS: ReadonlyArray<{ kind: EntityType; label: string }> = [
  { kind: 'workflow', label: 'Workflows' },
  { kind: 'tool', label: 'Tools' },
  { kind: 'company', label: 'Companies' },
]

const SUGGESTIONS = ['outbound', 'enrich', 'mcp', 'lifecycle'] as const

export function CommandPaletteDialog({
  items,
}: {
  items: ReadonlyArray<PaletteItem>
}) {
  const isOpen = useCommandPaletteOpen()
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(
    () =>
      query.trim()
        ? searchPaletteItems(items, { q: query, limit: MAX_RESULTS })
        : [],
    [items, query]
  )

  const flat = useMemo(
    () =>
      GROUPS.flatMap((group) => results.filter((r) => r.kind === group.kind)),
    [results]
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) {
        return
      }

      if (event.key?.toLowerCase() === 'k') {
        event.preventDefault()
        toggleCommandPalette()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  const go = useCallback(
    (href: string) => {
      setCommandPaletteOpen(false)
      router.push(href)
    },
    [router]
  )

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (flat.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % flat.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => (current - 1 + flat.length) % flat.length)
      return
    }

    if (event.key === 'Enter') {
      const item = flat[activeIndex]
      if (item) {
        event.preventDefault()
        go(item.href)
      }
    }
  }

  return (
    <Sheet onOpenChange={setCommandPaletteOpen} open={isOpen}>
      <SheetPortal>
        <SheetBackdrop className="bg-background/60 backdrop-blur-sm" />
        <SheetPopup className="floating-panel fixed top-[12vh] left-1/2 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden">
          <SheetTitle className="sr-only">Search the catalog</SheetTitle>
          <SheetDescription className="sr-only">
            Find a workflow, a tool or a company. Use the arrow keys to move
            through results and Enter to open one.
          </SheetDescription>

          <div className="flex items-center gap-3 border-b px-5">
            <HugeiconsIcon
              aria-hidden="true"
              className="shrink-0 text-subtle"
              icon={Search01Icon}
              size={20}
              strokeWidth={1.8}
            />
            <input
              aria-label="Search workflows, tools and companies"
              autoComplete="off"
              className="type-control h-14 min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-faint"
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search workflows, tools and companies"
              ref={inputRef}
              type="text"
              value={query}
            />
          </div>

          <div className="max-h-[min(24rem,52vh)] overflow-y-auto p-2">
            {query.trim() ? (
              <Results
                activeItem={flat[activeIndex]}
                onSelect={go}
                results={results}
              />
            ) : (
              <EmptyState onSelect={go} onSuggest={setQuery} />
            )}
          </div>

          <Hints />
        </SheetPopup>
      </SheetPortal>
    </Sheet>
  )
}

function Results({
  activeItem,
  onSelect,
  results,
}: {
  activeItem: PaletteItem | undefined
  onSelect: (href: string) => void
  results: ReadonlyArray<PaletteItem>
}) {
  if (results.length === 0) {
    return (
      <p className="type-body px-3 py-10 text-center">
        Nothing matches that yet.
      </p>
    )
  }

  return GROUPS.map((group) => {
    const rows = results.filter((item) => item.kind === group.kind)
    if (rows.length === 0) {
      return null
    }

    return (
      <div className="pb-1" key={group.kind}>
        <p className="eyebrow px-3 pt-3 pb-1 uppercase">{group.label}</p>
        {rows.map((item) => (
          <Row
            icon={KIND_ICON[item.kind]}
            isActive={item === activeItem}
            key={`${item.kind}:${item.key}`}
            onSelect={() => onSelect(item.href)}
            subtitle={item.subtitle}
            title={item.title}
          />
        ))}
      </div>
    )
  })
}

function EmptyState({
  onSelect,
  onSuggest,
}: {
  onSelect: (href: string) => void
  onSuggest: (query: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 py-1">
      <div>
        <p className="eyebrow px-3 pt-2 pb-1 uppercase">Jump to</p>
        {SECTIONS.map((index) => (
          <Row
            icon={KIND_ICON[index.entity]}
            isActive={false}
            key={index.href}
            onSelect={() => onSelect(index.href)}
            showArrow
            title={index.label}
          />
        ))}
      </div>

      <div>
        <p className="eyebrow px-3 pb-2 uppercase">Try searching</p>
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              className="focus-ring type-label rounded-full border px-3 py-1.5 text-faint transition-colors duration-200 hover:bg-hover hover:text-foreground"
              key={suggestion}
              onClick={() => onSuggest(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({
  icon,
  isActive,
  onSelect,
  showArrow = false,
  subtitle,
  title,
}: {
  icon: typeof Search01Icon
  isActive: boolean
  onSelect: () => void
  showArrow?: boolean
  subtitle?: string
  title: string
}) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isActive])

  return (
    <button
      className={cn(
        'focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200',
        isActive ? 'bg-muted' : 'hover:bg-muted'
      )}
      onClick={onSelect}
      ref={ref}
      type="button"
    >
      <HugeiconsIcon
        aria-hidden="true"
        className="shrink-0 text-subtle"
        icon={icon}
        size={18}
        strokeWidth={1.8}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-control truncate">{title}</span>
        {subtitle ? (
          <span className="type-meta truncate">{subtitle}</span>
        ) : null}
      </span>
      {showArrow ? (
        <HugeiconsIcon
          aria-hidden="true"
          className="shrink-0 text-subtle"
          icon={ArrowRight01Icon}
          size={16}
          strokeWidth={1.8}
        />
      ) : null}
    </button>
  )
}

function Hints() {
  return (
    <div className="type-meta flex items-center gap-4 border-t px-5 py-2.5">
      <span className="flex items-center gap-1.5">
        <Key>↑</Key>
        <Key>↓</Key>
        Navigate
      </span>
      <span className="flex items-center gap-1.5">
        <Key>↵</Key>
        Open
      </span>
      <span className="ml-auto flex items-center gap-1.5">
        <Key>esc</Key>
        Close
      </span>
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="type-label rounded-sm border px-1.5 py-0.5">{children}</kbd>
  )
}
