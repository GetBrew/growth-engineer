import Image from 'next/image'
import styles from './agent-marquee.module.css'

const AGENTS = [
  { name: 'Claude', logo: '/logos/anthropic.png' },
  { name: 'ChatGPT', logo: '/logos/openai.svg' },
  { name: 'Gemini', logo: '/logos/gemini.jpg' },
  { name: 'Copilot', logo: '/logos/copilot.png' },
  { name: 'Perplexity', logo: '/logos/perplexity.svg' },
  { name: 'Grok', logo: '/logos/grok.png' },
  { name: 'Mistral', logo: '/logos/mistral.jpg' },
  { name: 'DeepSeek', logo: '/logos/deepseek.png' },
  { name: 'Manus', logo: '/logos/manus.jpg' },
  { name: 'Lovable', logo: '/logos/lovable.jpg' },
  { name: 'Replit', logo: '/logos/replit.jpg' },
  { name: 'v0', logo: '/logos/v0.jpg' },
  { name: 'Bolt', logo: '/logos/bolt.jpg' },
] as const

export function AgentMarquee() {
  return (
    <section
      aria-label="Agents that read markdown files"
      className="mt-8 flex flex-col gap-4 border-y border-dashed py-5 sm:flex-row sm:items-center sm:gap-0"
    >
      <p className="type-label shrink-0 text-muted-foreground sm:w-44 sm:border-r sm:border-dashed sm:pr-6">
        Plain markdown: runs in any agent
      </p>

      <div className={`${styles.viewport} min-w-0 flex-1 overflow-hidden`}>
        <div className={`${styles.track} flex w-max`}>
          {[0, 1].map((copy) => (
            <ul
              aria-hidden={copy === 1 ? true : undefined}
              className="flex shrink-0 items-center"
              key={copy}
            >
              {AGENTS.map((agent) => (
                <li
                  className="flex shrink-0 items-center gap-2.5 px-6 opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                  key={agent.name}
                >
                  <Image
                    alt=""
                    className="size-6 rounded-md object-cover"
                    height={24}
                    src={agent.logo}
                    width={24}
                  />
                  <span className="type-item whitespace-nowrap">
                    {agent.name}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
