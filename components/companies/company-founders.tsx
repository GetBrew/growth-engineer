import { Linkedin01Icon, NewTwitterIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Founder = {
  name: string
  role: string
  avatar?: string
  linkedin?: string
  x?: string
}

/**
 * Placeholder until companies record their people: every company shows the
 * same two founders for now.
 */
const PLACEHOLDER_FOUNDERS: ReadonlyArray<Founder> = [
  {
    name: 'John Doe',
    role: 'Co-founder & CEO',
    avatar: '/one.svg',
    linkedin: 'https://www.linkedin.com',
    x: 'https://x.com',
  },
  {
    name: 'John Doe 2',
    role: 'Co-founder & CTO',
    avatar: '/two.svg',
    linkedin: 'https://www.linkedin.com',
    x: 'https://x.com',
  },
]

const SOCIAL =
  'focus-ring grid size-7 place-items-center rounded-full text-subtle transition-colors hover:bg-hover hover:text-foreground'

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
}

/** The people behind a company, with where to find them. */
export function CompanyFounders({
  founders = PLACEHOLDER_FOUNDERS,
}: {
  founders?: ReadonlyArray<Founder>
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="type-subsection">Active founders</h3>
      <ul className="flex max-w-2xl flex-col gap-2">
        {founders.map((founder) => (
          <li className="flex items-center gap-3 py-2" key={founder.name}>
            <Avatar className="size-10 rounded-xl border bg-black/3 after:rounded-xl">
              {founder.avatar ? (
                <AvatarImage
                  alt=""
                  className="rounded-xl object-cover"
                  src={founder.avatar}
                />
              ) : null}
              <AvatarFallback className="type-label rounded-xl bg-black/3 text-faint">
                {initials(founder.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="type-control">{founder.name}</p>
              <p className="text-subtle">{founder.role}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {founder.linkedin ? (
                <a
                  aria-label={`${founder.name} on LinkedIn`}
                  className={SOCIAL}
                  href={founder.linkedin}
                  rel="noreferrer"
                  target="_blank"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={Linkedin01Icon}
                    size={15}
                    strokeWidth={1.8}
                  />
                </a>
              ) : null}
              {founder.x ? (
                <a
                  aria-label={`${founder.name} on X`}
                  className={SOCIAL}
                  href={founder.x}
                  rel="noreferrer"
                  target="_blank"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={NewTwitterIcon}
                    size={14}
                    strokeWidth={1.8}
                  />
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
