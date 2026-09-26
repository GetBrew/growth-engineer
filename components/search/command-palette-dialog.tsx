'use client'

import { ArrowRight01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { EntityIcon } from '@/components/common/entity-icon'
import {
  Sheet,
  SheetBackdrop,
  SheetDescription,
  SheetPopup,
  SheetPortal,
  SheetTitle,
} from '@/components/ui/sheet'
import { searchPaletteItems } from '@/lib/catalog/search'
import { SECTIONS, type Section } from '@/lib/constants/sections'
import {
  setCommandPaletteOpen,
  toggleCommandPalette,
  useCommandPaletteOpen,
} from '@/lib/stores/command-palette'
import type { PaletteItem } from '@/lib/types/catalog'
import { cn } from '@/lib/utils/cn'

/** Rows per kind before the group ends in "See all". */
const PER_GROUP = 5

/** One navigable row: a result, a "see all" link, or a section to jump to. */
type Option = {
  id: string
  href: string
  title: string
  subtitle?: string
  entity: Section['entity']
  isMore?: boolean
}

type Group = { section: Section; options: Array<Option> }

/**
 * Results grouped by kind, the groups in the order of their best match — so
 * the first row, the one Enter opens, is the best match overall.
 */
function groupResults(
  ranked: ReadonlyArray<PaletteItem>,
  query: string
): Array<Group> {
  const byKind = new Map<string, Array<PaletteItem>>()
  for (const item of ranked) {
    byKind.set(item.kind, [...(byKind.get(item.kind) ?? []), item])
  }
  return [...byKind.entries()].flatMap(([kind, items]) => {
    const section = SECTIONS.find((candidate) => candidate.entity === kind)
    if (!section) {
      return []
    }
    const options: Array<Option> = items.slice(0, PER_GROUP).map((item) => ({
      id: `${item.kind}:${item.key}`,
      href: item.href,
      title: item.title,
      subtitle: item.subtitle,
      entity: item.kind,
    }))
    if (items.length > PER_GROUP) {
      options.push({
        id: `more:${kind}`,
        href: `${section.href}?q=${encodeURIComponent(query.trim())}`,
        title: `See all ${items.length} ${section.label.toLowerCase()}`,
        entity: section.entity,
        isMore: true,
      })
    }
    return [{ section, options }]
  })
}

const JUMP_TO: ReadonlyArray<Option> = SECTIONS.map((section) => ({
  id: `section:${section.entity}`,
  href: section.href,
  title: section.label,
  entity: section.entity,
  isMore: true,
}))

/**
 * ⌘K. The index — every company, tool and workflow — is prerendered into the
 * page with the site chrome, so there is nothing to fetch: every keystroke is
 * answered in the browser from data already there.
 */
export function CommandPaletteDialog({
  items,
  suggestions,
}: {
  items: ReadonlyArray<PaletteItem>
  suggestions: ReadonlyArray<string>
}) {
  const isOpen = useCommandPaletteOpen()
  const router = useRouter()
  const listId = useId()

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasQuery = query.trim() !== ''
  const groups = useMemo(
    () =>
      hasQuery
        ? groupResults(searchPaletteItems(items, { q: query }), query)
        : [],
    [hasQuery, items, query]
  )
  const options = hasQuery
    ? groups.flatMap((group) => group.options)
    : [...JUMP_TO]
  const active = options[activeIndex]

  // ⌘K / Ctrl+K anywhere.
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key?.toLowerCase() === 'k'
      ) {
        event.preventDefault()
        toggleCommandPalette()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Back and Forward leave the page the palette was opened on.
  useEffect(() => {
    const onPopState = () => setCommandPaletteOpen(false)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  function close() {
    setCommandPaletteOpen(false)
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (options.length === 0 || event.nativeEvent.isComposing) {
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(
        (current) => (current - 1 + options.length) % options.length
      )
    } else if (event.key === 'Enter' && active) {
      event.preventDefault()
      close()
      router.push(active.href)
    }
  }

  function suggest(value: string) {
    setQuery(value)
    setActiveIndex(0)
    inputRef.current?.focus()
  }

  const optionId = (option: Option) => `${listId}-${option.id}`
  const row = (option: Option) => (
    <Row
      id={optionId(option)}
      isActive={option === active}
      key={option.id}
      onSelect={close}
      option={option}
    />
  )

  let body: ReactNode
  if (!hasQuery) {
    body = (
      <div className="flex flex-col gap-3 py-1">
        <div>
          <p className="eyebrow px-3 pt-2 pb-1 uppercase">Jump to</p>
          {JUMP_TO.map(row)}
        </div>
        <div>
          <p className="eyebrow px-3 pb-2 uppercase">Try searching</p>
          <div className="flex flex-wrap gap-2 px-3 pb-2">
            {suggestions.map((suggestion) => (
              <button
                className="focus-ring type-label rounded-full border px-3 py-1.5 text-faint transition-colors duration-200 hover:bg-hover hover:text-foreground"
                key={suggestion}
                onClick={() => suggest(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  } else if (groups.length === 0) {
    body = (
      <p className="type-body px-3 py-10 text-center">
        Nothing matches that yet.
      </p>
    )
  } else {
    body = groups.map((group) => (
      <div className="pb-1" key={group.section.entity}>
        <p className="eyebrow px-3 pt-3 pb-1 uppercase">
          {group.section.label}
        </p>
        {group.options.map(row)}
      </div>
    ))
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
              aria-activedescendant={active ? optionId(active) : undefined}
              aria-autocomplete="list"
              aria-controls={listId}
              aria-expanded={options.length > 0}
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
              role="combobox"
              type="text"
              value={query}
            />
          </div>

          <div
            className="max-h-[min(24rem,52vh)] overflow-y-auto p-2"
            id={listId}
            role="listbox"
          >
            {body}
          </div>

          <Hints />
        </SheetPopup>
      </SheetPortal>
    </Sheet>
  )
}

/**
 * A real link, so it prefetches and opens in a new tab like any other; the
 * input keeps focus and points at the highlighted row.
 */
function Row({
  id,
  isActive,
  onSelect,
  option,
}: {
  id: string
  isActive: boolean
  onSelect: () => void
  option: Option
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isActive])

  return (
    <Link
      aria-selected={isActive}
      className={cn(
        'focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200',
        isActive ? 'bg-muted' : 'hover:bg-muted'
      )}
      href={option.href}
      id={id}
      onClick={onSelect}
      ref={ref}
      role="option"
      tabIndex={-1}
    >
      <EntityIcon className="text-subtle" entity={option.entity} size={18} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-control truncate">{option.title}</span>
        {option.subtitle ? (
          <span className="type-meta truncate">{option.subtitle}</span>
        ) : null}
      </span>
      {option.isMore ? (
        <HugeiconsIcon
          aria-hidden="true"
          className="shrink-0 text-subtle"
          icon={ArrowRight01Icon}
          size={16}
          strokeWidth={1.8}
        />
      ) : null}
    </Link>
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

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="type-label rounded-sm border px-1.5 py-0.5">{children}</kbd>
  )
}
