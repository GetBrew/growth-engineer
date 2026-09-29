import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  BRIEF_ITEM,
  BRIEF_LIST,
  BRIEF_MARKER,
  BRIEF_PRIMARY,
  BRIEF_SECONDARY,
  PANEL_HEADING,
} from '@/components/detail/styles'
import type { Workflow } from '@/lib/types/catalog'

/**
 * The top of a workflow's page, read before anything else: what the user has
 * when the run ends, and what the agent will ask them for. Both come straight
 * from the workflow's own file, so the page and the file say the same thing.
 */

export function WorkflowOutcome({ outcome }: { outcome: Workflow['outcome'] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={PANEL_HEADING}>Outcome</h2>
      <ul className={BRIEF_LIST}>
        {outcome.map((item) => (
          <li className={BRIEF_ITEM} key={item}>
            <span aria-hidden="true" className={BRIEF_MARKER}>
              <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
            </span>
            <p className={BRIEF_PRIMARY}>{item}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * What the agent asks for, as a person reads it: the question, then an
 * example. The input names are for the agent; the file carries them.
 */
export function WorkflowInputs({ inputs }: { inputs: Workflow['inputs'] }) {
  if (inputs.length === 0) {
    return null
  }
  return (
    <section
      className="flex scroll-mt-[calc(var(--header-height)+2rem)] flex-col gap-3"
      id="asked-for"
    >
      <h2 className={PANEL_HEADING}>You'll be asked for</h2>
      <ul className={BRIEF_LIST}>
        {inputs.map((input) => (
          <li className={BRIEF_ITEM} key={input.name}>
            <span aria-hidden="true" className={BRIEF_MARKER}>
              <span className="size-1.5 rounded-full bg-current" />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className={BRIEF_PRIMARY}>
                {input.description.charAt(0).toUpperCase()}
                {input.description.slice(1)}
              </p>
              {input.example ? (
                <p className={BRIEF_SECONDARY}>e.g. {input.example}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
