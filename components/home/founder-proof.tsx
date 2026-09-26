import { ContributionMarquee } from '@/components/home/contribution-marquee'
import { GithubLink } from '@/components/layout/github-link'

/** The home page's close: the catalog is open source, and here is who adds to it. */
export function FounderProof() {
  return (
    <section className="page-container py-(--space-section)">
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="type-item">Open source</span>
            <p className="type-body mt-0.5 text-foreground/60">
              Contribute your own workflows and tools
            </p>
          </div>

          <GithubLink className="shrink-0" />
        </div>

        <div className="mt-8">
          <ContributionMarquee />
        </div>
      </div>
    </section>
  )
}
