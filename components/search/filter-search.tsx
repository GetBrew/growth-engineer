'use client'

import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Form from 'next/form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type KeyboardEvent, useEffect, useId, useState } from 'react'
import { badgeVariants } from '@/components/ui/badge'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  type FilterOption,
  type FilterSuggestion,
  suggestFilters,
} from '@/lib/catalog/filter-suggestions'
import { cn } from '@/lib/utils/cn'

const KIND_LABEL: Record<FilterOption['kind'], string> = {
  motion: 'Motion',
  channel: 'Channel',
  company: 'Company',
  capability: 'Job',
  category: 'Category',
  has: 'Way in',
}

/**
 * A listing's search box that knows its filters: typing "outbound" offers the
 * Outbound motion, and picking it turns the word into a chip in the box. It is
 * still the GET form (the URL is the state; it works with no JavaScript): a
 * pick or a chip's × is a link to the URL with that filter, and Enter with
 * nothing picked searches the words.
 */
export function FilterSearch({
  action,
  label,
  placeholder,
  defaultValue,
  params,
  options,
  active,
  pickHref,
  removeHref,
  clearHref,
  empty,
  className,
}: {
  action: string
  label: string
  placeholder: string
  defaultValue: string
  /** The rest of the query, kept by a word search. */
  params: Record<string, string | undefined>
  options: ReadonlyArray<FilterOption>
  /** The filters the URL has on, shown as chips. */
  active: ReadonlyArray<FilterOption>
  pickHref: (option: FilterOption, q: string) => string
  removeHref: (option: FilterOption) => string
  /** The listing with no words and no filters. */
  clearHref: string
  /** What the box offers before anything is typed. */
  empty?: { kinds: ReadonlyArray<FilterOption['kind']>; limit?: number }
  className?: string
}) {
  const router = useRouter()
  const inputId = useId()
  const listId = useId()
  const [text, setText] = useState(defaultValue)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // The space typed after a word, or left by a pick, is kept.
  useEffect(() => {
    setText((current) =>
      current.trim() === defaultValue ? current : defaultValue
    )
  }, [defaultValue])

  const suggestions = isOpen
    ? suggestFilters(options, text, {
        active: active.map((option) => option.key),
        ...(empty ? { empty } : {}),
      })
    : []
  const highlighted = suggestions[activeIndex]

  function update(value: string) {
    setText(value)
    setIsOpen(true)
    // Enter picks for you only on an exact name: "email" is the channel,
    // but "enrich" may be a word to search for.
    const next = suggestFilters(options, value, {
      active: active.map((option) => option.key),
      ...(empty ? { empty } : {}),
    })
    setActiveIndex(next[0]?.isExact ? 0 : -1)
  }

  function pick(suggestion: FilterSuggestion) {
    setText(suggestion.rest ? `${suggestion.rest} ` : '')
    setIsOpen(false)
    setActiveIndex(-1)
    router.push(pickHref(suggestion.option, suggestion.rest), {
      scroll: false,
    })
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) {
      return
    }
    const last = active.at(-1)
    if (event.key === 'Backspace' && text === '' && last) {
      event.preventDefault()
      router.push(removeHref(last), { scroll: false })
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    } else if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault()
      setActiveIndex(
        (current) => (current - 1 + suggestions.length) % suggestions.length
      )
    } else if (event.key === 'Enter' && highlighted) {
      event.preventDefault()
      pick(highlighted)
    }
  }

  return (
    <Form
      action={action}
      className={cn('relative w-full', className)}
      onSubmit={() => setIsOpen(false)}
    >
      {Object.entries(params).map(([name, value]) =>
        value ? (
          <input key={name} name={name} type="hidden" value={value} />
        ) : null
      )}
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <InputGroup>
        <InputGroupAddon className="pl-4">
          <HugeiconsIcon
            aria-hidden="true"
            className="text-subtle"
            icon={Search01Icon}
            size={18}
            strokeWidth={1.8}
          />
        </InputGroupAddon>
        {active.length > 0 ? (
          <div className="flex shrink-0 items-center gap-1 pl-1.5">
            {active.map((option) => (
              <Link
                aria-label={`Remove the ${option.label} filter`}
                className={badgeVariants({
                  variant: 'soft',
                  size: 'label',
                  interactive: true,
                })}
                href={removeHref(option)}
                key={option.key}
                scroll={false}
              >
                {option.label}
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={Cancel01Icon}
                  size={12}
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        ) : null}
        <InputGroupInput
          aria-activedescendant={
            highlighted ? `${listId}-${highlighted.option.key}` : undefined
          }
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={suggestions.length > 0}
          autoComplete="off"
          // The browser's own clear button is hidden: it clears the words
          // but not the chips, and it is not drawn in the site's style.
          className="min-w-16 text-foreground [&::-webkit-search-cancel-button]:appearance-none"
          id={inputId}
          name="q"
          onBlur={() => setIsOpen(false)}
          onChange={(event) => update(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={active.length > 0 ? 'Add words or filters' : placeholder}
          role="combobox"
          type="search"
          value={text}
        />
        {text !== '' || active.length > 0 ? (
          <InputGroupAddon align="inline-end" className="pr-2">
            <Link
              aria-label="Clear the search and filters"
              className="focus-ring flex size-7 items-center justify-center rounded-full text-subtle transition-colors duration-200 hover:bg-hover hover:text-foreground"
              href={clearHref}
              onClick={() => setText('')}
              scroll={false}
            >
              <HugeiconsIcon
                aria-hidden="true"
                icon={Cancel01Icon}
                size={16}
                strokeWidth={1.8}
              />
            </Link>
          </InputGroupAddon>
        ) : null}
      </InputGroup>

      <div
        className={cn(
          'floating-panel absolute inset-x-0 top-full z-20 mt-2 p-1.5',
          suggestions.length === 0 && 'hidden'
        )}
        id={listId}
        role="listbox"
      >
        {text.trim() === '' ? (
          <p className="eyebrow px-3 pt-2 pb-1 uppercase">Filter by</p>
        ) : null}
        {suggestions.map((suggestion, index) => (
          <Link
            aria-selected={index === activeIndex}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left',
              index === activeIndex && 'bg-muted'
            )}
            href={pickHref(suggestion.option, suggestion.rest)}
            id={`${listId}-${suggestion.option.key}`}
            key={suggestion.option.key}
            onClick={(event) => {
              event.preventDefault()
              pick(suggestion)
            }}
            // Keeps the input focused, so the blur does not close the list
            // before the click lands.
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={() => setActiveIndex(index)}
            role="option"
            scroll={false}
            tabIndex={-1}
          >
            <span className="type-control min-w-0 flex-1 truncate text-foreground">
              {suggestion.option.label}
            </span>
            <span className="type-meta shrink-0">
              {KIND_LABEL[suggestion.option.kind]} · {suggestion.option.count}
            </span>
          </Link>
        ))}
      </div>
    </Form>
  )
}
