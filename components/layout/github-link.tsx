import { MaskIcon } from '@/components/layout/mask-icon'
import { buttonVariants } from '@/components/ui/button'
import { GITHUB_URL } from '@/lib/github'
import { cn } from '@/lib/utils/cn'

export function GithubLink({ className }: { className?: string }) {
  return (
    <a
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'pill' }),
        className
      )}
      href={GITHUB_URL}
      rel="noreferrer"
      target="_blank"
    >
      <MaskIcon size={16} src="/social/github.svg" />
      Contribute
    </a>
  )
}
