import { CodeText } from '@/components/common/code-text'
import { CopyButton } from '@/components/contribute/copy-button'
import type { ResolvedGuideStep } from '@/lib/constants/guide-steps'

/**
 * What to do, in order, with the example under each move. No cards and no
 * rail — a numbered heading, the explanation, and the sample it refers to.
 * Only the samples get a surface, because code has to be told apart from the
 * prose around it.
 */
export function GuideSteps({
  steps,
}: {
  steps: ReadonlyArray<ResolvedGuideStep>
}) {
  return (
    <section className="flex flex-col gap-(--space-md)">
      <h2 className="type-category">How to create</h2>

      <ol className="flex flex-col gap-(--space-lg)">
        {steps.map((step, index) => (
          <li
            className="flex max-w-3xl scroll-mt-[calc(var(--header-height)+2rem)] flex-col gap-2"
            id={step.key}
            key={step.key}
          >
            <h3 className="type-subsection">
              <span className="text-faint tabular-nums">{index + 1}. </span>
              {step.title}
            </h3>

            <p className="type-body">
              <CodeText text={step.detail} />
            </p>

            {step.sample ? (
              <figure className="mt-1 overflow-hidden rounded-xl border bg-surface">
                {/* Every sample names itself — the file it is quoted from, the
                    folder it lists, or "Terminal" — beside its copy button. */}
                <figcaption className="flex items-center justify-between gap-3 border-b py-1.5 pr-1.5 pl-4">
                  <span className="type-label min-w-0 truncate font-mono text-faint">
                    {step.sample.caption}
                  </span>
                  <CopyButton
                    label={step.sample.caption}
                    text={step.sample.code}
                  />
                </figcaption>
                {/* Long lines wrap instead of hiding past the edge; the copy
                    button still copies them as written. */}
                <pre className="type-label whitespace-pre-wrap break-words p-4 font-mono text-soft leading-6">
                  <code>{step.sample.code}</code>
                </pre>
              </figure>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
