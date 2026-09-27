import type { CSSProperties } from 'react'
import { BrewLink } from '@/components/layout/brew-link'
import { loadWorkflows } from '@/lib/catalog/loaders'
import { githubAvatarUrl, githubProfileUrl } from '@/lib/github'
import styles from './people-marquee.module.css'

const MAX_PEOPLE = 5

/**
 * The welcome line, and beside it the people who wrote the catalog's
 * workflows — real GitHub accounts, read from each workflow's `author`.
 * Nobody appears here who has not published a workflow.
 */
export function PeopleMarquee() {
  return (
    <div className="flex w-full max-w-[30rem] flex-col gap-4 lg:shrink-0">
      {/* Phones stack the avatars over the two lines: five side by side left
          no room, and both lines broke mid-phrase. */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Authors />

        <p className="flex min-w-0 flex-col">
          <span className="type-item whitespace-nowrap text-muted-foreground">
            Welcome to <span className="text-foreground">growth.engineer</span>
          </span>
          <span className="type-label flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
            Brought to you by
            <BrewLink />
          </span>
        </p>
      </div>
    </div>
  )
}

async function Authors() {
  const workflows = await loadWorkflows('featured', 200)
  const authors = [...new Set(workflows.map(({ workflow }) => workflow.author))]
  const people = authors.slice(0, MAX_PEOPLE)
  if (people.length === 0) {
    return null
  }
  return (
    <ul
      aria-label="People who wrote workflows here"
      className="flex items-center justify-center"
    >
      {people.map((login, index) => (
        <li
          className={`${styles.item} -ml-3 first:ml-0`}
          key={login}
          style={{ '--index': index } as CSSProperties}
        >
          <a
            className={`${styles.avatar} focus-ring relative block size-10 overflow-hidden rounded-full border-2 border-background bg-muted shadow-xs sm:size-12`}
            href={githubProfileUrl(login)}
            rel="noreferrer"
            target="_blank"
            title={`@${login}`}
          >
            {/* A GitHub photo: plain <img>, never the image optimizer. */}
            {/* biome-ignore lint/performance/noImgElement: remote avatar, deliberately unoptimized */}
            <img
              alt={`@${login}`}
              className="size-full object-cover"
              height={48}
              src={githubAvatarUrl(login)}
              width={48}
            />
          </a>
        </li>
      ))}
    </ul>
  )
}
