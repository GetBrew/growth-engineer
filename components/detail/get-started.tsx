import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import {
  BRIEF_ITEM,
  BRIEF_LIST,
  BRIEF_MARKER,
  BRIEF_PRIMARY,
  BRIEF_SECONDARY,
  SIDE_HEADING,
} from '@/components/detail/styles'

const LINK =
  'focus-ring rounded-sm text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground'

/** What comes before the item at `index`: "A, B and C". */
function separator(index: number, count: number): string {
  if (index === 0) {
    return ''
  }
  return index === count - 1 ? ' and ' : ', '
}

/** Each company as a link to its page, joined "A, B and C". */
function companyLinks(
  companies: ReadonlyArray<{ key: string; name: string }>
): ReactNode {
  return companies.map((company, index) => (
    <Fragment key={company.key}>
      {separator(index, companies.length)}
      <Link className={LINK} href={`/companies/${company.key}`}>
        {company.name}
      </Link>
    </Fragment>
  ))
}

/**
 * Where to start, beside the Copy button: connect the tools (each company's
 * page says how), copy the file, answer its questions. The note under it is
 * what every workflow file's Rules make the agent do, so it holds for any
 * workflow.
 */
export function GetStarted({
  companies,
  questions,
}: {
  /** The companies whose tools the steps use, in first-use order. */
  companies: ReadonlyArray<{ key: string; name: string }>
  /** How many inputs the agent asks for. */
  questions: number
}) {
  const steps: Array<{ key: string; content: ReactNode }> = [
    { key: 'connect', content: <>Connect {companyLinks(companies)}.</> },
    { key: 'copy', content: 'Copy the workflow into your agent.' },
    ...(questions > 0
      ? [
          {
            key: 'answer',
            content: (
              <>
                Answer its{' '}
                <a className={LINK} href="#asked-for">
                  {questions} {questions === 1 ? 'question' : 'questions'}
                </a>
                .
              </>
            ),
          },
        ]
      : []),
  ]
  return (
    <section className="flex flex-col gap-3">
      <h2 className={SIDE_HEADING}>Get started</h2>
      <ol className={BRIEF_LIST}>
        {steps.map((step, index) => (
          <li className={BRIEF_ITEM} key={step.key}>
            <span className={BRIEF_MARKER}>{index + 1}</span>
            <p className={BRIEF_PRIMARY}>{step.content}</p>
          </li>
        ))}
      </ol>
      {/* On the steps' text line: 20px marker column + 12px gutter. */}
      <p className={`${BRIEF_SECONDARY} pl-8`}>
        It asks before it sends, spends or changes anything.
      </p>
    </section>
  )
}
