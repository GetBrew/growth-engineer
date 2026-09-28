import { MaskIcon } from '@/components/layout/mask-icon'
import { buttonVariants } from '@/components/ui/button'
import { GITHUB_URL } from '@/lib/github'
import { formatStars, repoStars } from '@/lib/github-stars'
import { cn } from '@/lib/utils/cn'

/**
 * The header's link to the repository: GitHub's mark, "Star" and the star
 * count, like GitHub's own button. The count is fixed at build
 * (lib/github-stars.ts); when GitHub did not answer, the button shows without
 * it. Phones drop the word and keep the mark and the count.
 */
export function GithubStarButton() {
  const stars = repoStars()
  const label =
    stars === null
      ? 'Star on GitHub'
      : `Star on GitHub, ${stars.toLocaleString('en-US')} ${stars === 1 ? 'star' : 'stars'}`

  return (
    <a
      aria-label={label}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'pill' }),
        'px-3 sm:px-4'
      )}
      href={GITHUB_URL}
      rel="noreferrer"
      target="_blank"
    >
      <MaskIcon size={16} src="/social/github.svg" />
      <span className="hidden sm:inline">Star</span>
      {stars === null ? null : (
        <>
          <span
            aria-hidden="true"
            className="mx-0.5 hidden h-4 w-px bg-border sm:block"
          />
          <span className="text-soft tabular-nums">{formatStars(stars)}</span>
        </>
      )}
    </a>
  )
}
