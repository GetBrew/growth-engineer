'use client'

import {
  ArrowDown01Icon,
  Copy01Icon,
  Download01Icon,
  LinkSquare02Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCopy } from '@/lib/hooks/use-copy'
import { cn } from '@/lib/utils/cn'

export function OpenInAgentMenu({
  markdown,
  filePath,
  title,
}: {
  markdown: string
  filePath: string
  title: string
}) {
  const { copy } = useCopy()
  const prompt = encodeURIComponent(
    `Set up and run this for me:\n\n${markdown}`
  )
  const agents = [
    { label: 'Open in ChatGPT', href: `https://chatgpt.com/?q=${prompt}` },
    { label: 'Open in Claude', href: `https://claude.ai/new?q=${prompt}` },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ size: 'pill' }),
          // On phones the primary action takes the rest of the row.
          'group/explore max-sm:flex-1'
        )}
      >
        <HugeiconsIcon
          aria-hidden="true"
          className="size-4"
          icon={SparklesIcon}
        />
        Explore with AI
        <HugeiconsIcon
          aria-hidden="true"
          className="size-3.5 transition-transform group-data-popup-open/explore:rotate-180"
          icon={ArrowDown01Icon}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72" sideOffset={12}>
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.label}
            render={<a href={agent.href} rel="noreferrer" target="_blank" />}
          >
            <HugeiconsIcon aria-hidden="true" icon={LinkSquare02Icon} />
            {agent.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => copy(markdown)}>
          <HugeiconsIcon aria-hidden="true" icon={Copy01Icon} />
          Copy for any agent
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <a
              download={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`}
              href={filePath}
            />
          }
        >
          <HugeiconsIcon aria-hidden="true" icon={Download01Icon} />
          Download .md
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
