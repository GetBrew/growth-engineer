import { MaskIcon } from '@/components/layout/mask-icon'
import { buttonVariants } from '@/components/ui/button'
import { GITHUB_URL } from '@/lib/github'
import { cn } from '@/lib/utils/cn'

export function GithubLink({
  className,
  compact = false,
  onClick,
}: {
  className?: string
  compact?: boolean
  onClick?: () => void
}) {
  return (
    <a
      aria-label={compact ? 'Contribute on GitHub' : undefined}
      className={cn(
        buttonVariants({
          variant: 'ghost',
          size: compact ? 'icon-pill' : 'pill',
        }),
        compact && 'sm:h-10 sm:w-auto sm:gap-1.5 sm:px-4',
        className
      )}
      href={GITHUB_URL}
      onClick={onClick}
      rel="noreferrer"
      target="_blank"
    >
      <MaskIcon size={16} src="/social/github.svg" />
      <span className={compact ? 'hidden sm:inline' : undefined}>
        Contribute
      </span>
    </a>
  )
}
