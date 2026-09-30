import {
  BrickWallShieldIcon,
  BubbleChatQuestionIcon,
  CopyCheckIcon,
  Link04Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
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
  'focus-ring type-emphasis rounded-sm text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground'

function separator(index: number, count: number): string {
  if (index === 0) {
    return ''
  }
  return index === count - 1 ? ' and ' : ', '
}

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

export function GetStarted({
  companies,
  questions,
}: {
  companies: ReadonlyArray<{ key: string; name: string }>
  questions: number
}) {
  const rows: Array<{
    key: string
    icon: IconSvgElement
    content: ReactNode
    isNote?: boolean
  }> = [
    {
      key: 'connect',
      icon: Link04Icon,
      content: <>Connect {companyLinks(companies)}.</>,
    },
    {
      key: 'copy',
      icon: CopyCheckIcon,
      content: 'Copy the workflow into your agent.',
    },
    ...(questions > 0
      ? [
          {
            key: 'answer',
            icon: BubbleChatQuestionIcon,
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
    {
      key: 'safe',
      icon: BrickWallShieldIcon,
      content: 'It asks before it sends, spends or changes anything.',
      isNote: true,
    },
  ]
  return (
    <section className="flex flex-col gap-3">
      <h2 className={SIDE_HEADING}>Get started</h2>
      <ul className={BRIEF_LIST}>
        {rows.map((row) => (
          <li className={BRIEF_ITEM} key={row.key}>
            <span aria-hidden="true" className={BRIEF_MARKER}>
              <HugeiconsIcon icon={row.icon} size={16} strokeWidth={1.8} />
            </span>
            <p className={row.isNote ? BRIEF_SECONDARY : BRIEF_PRIMARY}>
              {row.content}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
