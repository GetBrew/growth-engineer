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
    <ul aria-hidden="true" className="flex items-center">
      {PEOPLE.map((person, index) => (
        <li
          className={`${styles.item} -ml-2.5 first:ml-0`}
          key={person.id}
          style={{ '--index': index } as CSSProperties}
        >
          <span
            className={`${styles.avatar} relative block size-11 overflow-hidden rounded-full border border-border bg-muted shadow-xs`}
          >
            <Image
              alt=""
              className="object-cover"
              fill
              loading="eager"
              sizes="44px"
              src={person.src}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}
