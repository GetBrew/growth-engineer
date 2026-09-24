import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils/cn'

export function CatalogSearch({
  action,
  label,
  placeholder,
  defaultValue,
  params = {},
  size = 'default',
  className,
}: {
  action: string
  label: string
  placeholder: string
  defaultValue?: string
  params?: Record<string, string | undefined>
  size?: 'default' | 'lg'
  className?: string
}) {
  const id = `catalog-search${action.replaceAll('/', '-')}`
  const large = size === 'lg'

  return (
    <form action={action} className={cn('w-full', className)} method="get">
      {Object.entries(params).map(([name, value]) =>
        value ? (
          <input key={name} name={name} type="hidden" value={value} />
        ) : null
      )}
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <InputGroup controlSize={large ? 'lg' : 'default'}>
        <InputGroupAddon className={large ? 'pl-5' : 'pl-4'}>
          <HugeiconsIcon
            aria-hidden="true"
            className="text-subtle"
            icon={Search01Icon}
            size={18}
            strokeWidth={1.8}
          />
        </InputGroupAddon>
        <InputGroupInput
          autoComplete="off"
          className="text-foreground"
          defaultValue={defaultValue}
          id={id}
          key={defaultValue ?? ''}
          name="q"
          placeholder={placeholder}
          type="search"
        />
      </InputGroup>
    </form>
  )
}
