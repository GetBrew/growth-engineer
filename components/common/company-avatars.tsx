import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'

export type CompanyAvatar = {
  key: string
  name: string
  logoUrl?: string
  href?: string
}

const SIZE = {
  md: { stack: '[&>*+*]:-ml-3', avatar: 'size-11', image: 'p-1.5' },
  sm: { stack: '[&>*+*]:-ml-1.5', avatar: 'size-7', image: 'p-1' },
} as const

const LIFT =
  'relative cursor-pointer rounded-full transition-transform duration-200 ease-out hover:z-10 hover:-translate-y-1 motion-reduce:transition-none'

function Logo({
  company,
  size,
}: {
  company: CompanyAvatar
  size: keyof typeof SIZE
}) {
  return (
    <Avatar
      className={cn(SIZE[size].avatar, 'bg-background ring-2 ring-background')}
    >
      <AvatarImage
        alt=""
        className={cn('object-contain', SIZE[size].image)}
        src={company.logoUrl}
      />
      <AvatarFallback className="type-label bg-background text-soft">
        {company.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}

function MoreChip({ label, size }: { label: string; size: keyof typeof SIZE }) {
  return (
    <span
      className={cn(
        'type-label relative grid place-items-center rounded-full bg-foreground px-2 text-background ring-2 ring-background',
        size === 'md' ? 'h-11 min-w-11' : 'h-7 min-w-7'
      )}
    >
      {label}
    </span>
  )
}

export function CompanyAvatars({
  companies,
  size = 'md',
  tooltips = true,
  links = true,
  more,
}: {
  companies: ReadonlyArray<CompanyAvatar>
  size?: keyof typeof SIZE
  tooltips?: boolean
  links?: boolean
  more?: string
}) {
  const stack = cn('relative z-10 flex shrink-0 items-center', SIZE[size].stack)

  if (!tooltips) {
    return (
      <div className={stack}>
        {companies.map((company) => (
          <span className="relative rounded-full" key={company.key}>
            <Logo company={company} size={size} />
          </span>
        ))}
        {more ? <MoreChip label={more} size={size} /> : null}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn(stack, 'items-start pt-1')}>
        {companies.map((company) => (
          <Tooltip key={company.key}>
            <TooltipTrigger
              render={
                links ? (
                  <Link
                    aria-label={company.name}
                    className={cn(
                      LIFT,
                      'focus-ring focus-visible:z-10 focus-visible:-translate-y-1'
                    )}
                    href={company.href ?? `/companies/${company.key}`}
                  />
                ) : (
                  <span className="relative rounded-full" />
                )
              }
            >
              <Logo company={company} size={size} />
            </TooltipTrigger>
            <TooltipContent>{company.name}</TooltipContent>
          </Tooltip>
        ))}
        {more ? <MoreChip label={more} size={size} /> : null}
      </div>
    </TooltipProvider>
  )
}
