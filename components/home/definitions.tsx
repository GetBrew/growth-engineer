import {
  AGENT_ACCESS,
  AGENT_LEVELS,
  DEFINITIONS,
} from '@/lib/catalog/definitions'

const BACKTICK = /`/g

/**
 * The four words the catalog is built from, defined once
 * (`lib/catalog/definitions.ts`) and shown here, in `/llms.txt` and in the
 * structured data alike — so a person, a crawler and an agent read the same
 * definition.
 */
export function Definitions() {
  return (
    <section
      aria-labelledby="definitions-heading"
      className="page-container py-20 sm:py-24"
    >
      <div className="mb-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="type-label text-muted-foreground">Definitions</p>
          <h2 className="type-display mt-3" id="definitions-heading">
            Four words, used precisely.
          </h2>
        </div>
        <p className="type-body max-w-md text-subtle md:text-right">
          Every page, file and search uses these the same way. A key is
          permanent: what you link today resolves next year.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DEFINITIONS.map((entry) => (
          <div
            className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6"
            key={entry.term}
          >
            <dt className="flex flex-col gap-2">
              <span className="type-item">{entry.term}</span>
              <code className="type-meta w-fit break-all rounded-md bg-hover px-2 py-1 font-mono text-foreground/70">
                {entry.example}
              </code>
            </dt>
            <dd className="flex flex-1 flex-col gap-3">
              <p className="type-body text-foreground">{entry.definition}</p>
              <p className="type-body text-subtle">{entry.detail}</p>
              <p className="type-meta mt-auto break-all pt-2 font-mono text-faint">
                {entry.path}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-8 rounded-2xl border border-border border-dashed p-6 sm:p-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-4">
          <h3 className="type-section">Agent readiness</h3>
          <dl className="flex flex-col gap-3">
            {AGENT_LEVELS.map((entry) => (
              <div className="flex flex-col gap-0.5" key={entry.level}>
                <dt className="type-item font-mono text-foreground/80">
                  agent: {entry.level}
                </dt>
                <dd className="type-body text-subtle">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="type-section">For agents</h3>
          <ul className="flex flex-col gap-3">
            {AGENT_ACCESS.map((line) => (
              <li className="type-body text-subtle" key={line}>
                {line.replace(BACKTICK, '')}
              </li>
            ))}
          </ul>
          <p className="type-body text-subtle">
            No sign-in, no rate limit, no key. The catalog is markdown in a
            public repository, built into this site.
          </p>
        </div>
      </div>
    </section>
  )
}
