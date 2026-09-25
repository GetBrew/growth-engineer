'use client'

import { FavouriteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { AGENTS, showStepsFor, useSelectedAgent } from '@/lib/stores/agents'
import { cn } from '@/lib/utils/cn'
import styles from './agent-marquee.module.css'

export function AgentMarquee() {
  const selected = useSelectedAgent()

  return (
    <section
      aria-label="Supported agents"
      className="mt-8 flex flex-col gap-4 border-y border-dashed py-5 sm:flex-row sm:items-center sm:gap-0"
    >
      <p className="type-meta shrink-0 text-pretty sm:w-48 sm:border-r sm:border-dashed sm:pr-6">
        Connect over <span className="text-foreground">MCP</span> with the agent
        you already use{' '}
        <HugeiconsIcon
          aria-hidden="true"
          className={`${styles.heart} inline-block translate-y-[0.1em] fill-current text-heart`}
          icon={FavouriteIcon}
          size={14}
        />
      </p>

      <div className={`${styles.viewport} min-w-0 flex-1 overflow-hidden`}>
        <div className={`${styles.track} flex w-max`}>
          {[0, 1].map((copy) => (
            <ul
              aria-hidden={copy === 1 ? true : undefined}
              className="flex shrink-0 items-center"
              key={copy}
            >
              {AGENTS.map((agent) => {
                const isActive = agent.name === selected.name
                return (
                  <li key={agent.name}>
                    <button
                      aria-pressed={isActive}
                      className="focus-ring group/agent flex shrink-0 items-center gap-2.5 rounded-full px-5 py-1"
                      onClick={() => showStepsFor(agent)}
                      tabIndex={copy === 1 ? -1 : undefined}
                      type="button"
                    >
                      <span className="entity-shadow grid size-8 place-items-center overflow-hidden rounded-xl border bg-background">
                        <Image
                          alt=""
                          className={cn(
                            'size-5 object-contain transition-opacity duration-300 group-hover/agent:opacity-100',
                            isActive ? 'opacity-100' : 'opacity-75'
                          )}
                          height={20}
                          src={agent.logo}
                          width={20}
                        />
                      </span>
                      <span
                        className={cn(
                          'type-label whitespace-nowrap transition-colors duration-300 group-hover/agent:text-foreground',
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {agent.name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
