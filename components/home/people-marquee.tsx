import Image from 'next/image'
import type { CSSProperties } from 'react'
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
    // Illustrations, not portraits of real users: decoration, so it is hidden
    // from screen readers rather than labelled as people.
    <ul aria-hidden="true" className="flex items-center">
      {PEOPLE.map((person, index) => (
        <li
          className={`${styles.item} -ml-3 first:ml-0`}
          key={person.id}
          style={{ '--index': index } as CSSProperties}
        >
          <span
            className={`${styles.avatar} relative block size-10 overflow-hidden rounded-full border-2 border-background bg-muted shadow-xs sm:size-12`}
          >
            <Image
              alt=""
              className="object-cover"
              fill
              loading="eager"
              sizes="48px"
              src={person.src}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}
