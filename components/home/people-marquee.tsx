import Image from 'next/image'
import type { CSSProperties } from 'react'
import { BrewLink } from '@/components/layout/brew-link'
import styles from './people-marquee.module.css'

const PEOPLE = [
  { id: 'person-1', src: '/people/person1.svg' },
  { id: 'person-2', src: '/people/person2.svg' },
  { id: 'person-3', src: '/people/person3.svg' },
  { id: 'person-4', src: '/people/person4.svg' },
  { id: 'person-5', src: '/people/person5.svg' },
] as const

export function PeopleMarquee() {
  return (
    <div className="flex w-full max-w-[30rem] flex-col gap-4 lg:shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <ul
          aria-label="People building with growth.engineer"
          className={`${styles.stack} flex items-center justify-center`}
        >
          {PEOPLE.map((person, index) => (
            <li
              className={`${styles.item} -ml-3 first:ml-0`}
              key={person.id}
              style={{ '--index': index } as CSSProperties}
            >
              {/* A plain image, not an Avatar: these five SVGs ship with the
                  site and always resolve, so the Avatar's fallback only ever
                  flashed "1 2 3 4 5" over them on first paint. */}
              <span
                className={`${styles.avatar} relative block size-10 overflow-hidden rounded-full border-2 border-background bg-muted shadow-xs sm:size-12`}
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  priority
                  sizes="48px"
                  src={person.src}
                />
              </span>
            </li>
          ))}
        </ul>

        <p className="flex min-w-0 flex-col">
          <span className="type-item text-muted-foreground sm:whitespace-nowrap">
            Welcome to <span className="text-foreground">growth.engineer</span>
          </span>
          <span className="type-label flex items-center gap-1.5 text-muted-foreground">
            Brought to you by
            <BrewLink />
          </span>
        </p>
      </div>
    </div>
  )
}
