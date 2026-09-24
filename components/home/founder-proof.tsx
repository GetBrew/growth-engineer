import { AccessTerminal } from '@/components/home/access-terminal'
import { ContributionMarquee } from '@/components/home/contribution-marquee'
import { GithubLink } from '@/components/layout/github-link'

/**
 * One open panel rather than a bordered card: the wall of contributions is
 * already a shape on the page, and a box around it only adds a line to look
 * past. The heading sits above it, the way in sits beside the heading.
 */
export function FounderProof() {
  return (
    <section className="page-container py-(--space-section)">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
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

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-col">
            <span className="type-item">Three ways in</span>
            <p className="type-body mt-0.5 text-foreground/60">
              Every tool and workflow says how an agent reaches it
            </p>
          </div>

          <div className="mt-8">
            <AccessTerminal />
          </div>
        </div>
      </div>
    </section>
  )
}
