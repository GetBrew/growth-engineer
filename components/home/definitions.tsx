import { SectionHeading } from '@/components/layout/section-heading'
import { AGENT_ACCESS, DEFINITIONS } from '@/lib/catalog/definitions'

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
      aria-label="Definitions"
      className="page-container pt-(--space-section)"
    >
      <SectionHeading
        description="Every page, file and search uses these the same way. A key is permanent: what you link today resolves next year."
        title="Four words, used precisely"
      />

      <dl className="mt-(--space-lg) grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DEFINITIONS.map((entry) => (
          <div
            className="flex flex-col gap-3 rounded-2xl border bg-surface p-5"
            key={entry.term}
          >
            <dt className="flex flex-col gap-2">
              <span className="type-item">{entry.term}</span>
              <code className="type-label w-fit break-all rounded-md bg-hover px-2 py-0.5 font-mono text-soft">
                {entry.example}
              </code>
            </dt>
            <dd className="flex flex-1 flex-col gap-2">
              <p className="type-body text-foreground">{entry.definition}</p>
              <p className="type-body text-soft">{entry.detail}</p>
              <p className="type-label mt-auto break-all pt-1 font-mono text-faint">
                {entry.path}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-(--space-md) flex flex-col gap-1.5">
        {AGENT_ACCESS.map((line) => (
          <li className="type-body text-soft" key={line}>
            {line.replace(BACKTICK, '')}
          </li>
        ))}
      </ul>
    </section>
  )
}
