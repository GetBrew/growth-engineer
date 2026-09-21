import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

const PROOF_POINTS = [
  {
    value: '1',
    label: 'Runnable file',
    body: 'Each workflow is one portable Markdown file with its setup, inputs, steps, and rules in one place.',
  },
  {
    value: '3',
    label: 'Access paths',
    body: 'See whether a tool works through MCP, a command-line interface, or a direct API before you choose it.',
  },
  {
    value: 'Public',
    label: 'Catalog access',
    body: 'People and agents can inspect the catalog and fetch its files without creating an account first.',
  },
  {
    value: 'Stable',
    label: 'Resource keys',
    body: 'Predictable references make every tool and workflow easy to share, revisit, and run again.',
  },
] as const

const DOTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const

export function FounderProof() {
  return (
    <section className="page-container py-20 sm:py-24">
      <div className="mb-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="type-label text-muted-foreground">For founders</p>
          <h2 className="type-display mt-3">
            Proven workflows, with the access details up front.
          </h2>
        </div>
        <div className="flex max-w-md flex-col items-start gap-5 md:items-end md:text-right">
          <p className="type-body text-subtle">
            Know what an agent can run, how it connects, and exactly what you
            are handing it before your team commits.
          </p>
          <Link
            className={buttonVariants({ variant: 'outline', size: 'pill' })}
            href="/workflows"
          >
            Explore proven workflows
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PROOF_POINTS.map((point) => (
          <article
            className="relative min-h-80 overflow-hidden rounded-2xl bg-foreground p-7 text-background"
            key={point.label}
          >
            <DotMark />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white/5 to-transparent" />
            <div className="relative flex h-full flex-col justify-end pt-28">
              <p className="text-5xl leading-none tracking-tighter sm:text-6xl lg:text-5xl xl:text-6xl">
                {point.value}
              </p>
              <p className="type-label mt-4 text-white/55">{point.label}</p>
              <p className="type-body mt-6 text-white/65">{point.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function DotMark() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-8 left-8 grid grid-cols-3 gap-2"
    >
      {DOTS.map((dot) => (
        <span className="size-1.5 rounded-full bg-white/80" key={dot} />
      ))}
    </div>
  )
}
