import { AccessTerminal } from '@/components/home/access-terminal'
import { ContributionMarquee } from '@/components/home/contribution-marquee'
import { GithubLink } from '@/components/layout/github-link'

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

          {/* Centred against the terminal beside it, so the two columns end
              together instead of the pills stopping short. */}
          <div className="mt-8 flex flex-1 flex-col justify-center">
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
