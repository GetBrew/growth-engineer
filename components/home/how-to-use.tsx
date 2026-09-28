/**
 * The product action, in three steps, under the home page's promise. A
 * workflow file carries its own setup and rules, so this is all a person
 * needs to know to get a result from one.
 */
const STEPS = [
  { title: 'Pick a workflow', detail: 'named for its result' },
  { title: 'Copy its file', detail: 'setup included' },
  { title: 'Paste it into your agent', detail: 'it asks before it acts' },
] as const

export function HowToUse() {
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-6">
      {STEPS.map((step, index) => (
        <li className="flex min-w-0 items-start gap-3" key={step.title}>
          <span className="type-meta grid size-6 shrink-0 place-items-center rounded-full border bg-background text-soft tabular-nums">
            {index + 1}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="type-label text-foreground">{step.title}</span>
            <span className="type-meta text-soft">{step.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
