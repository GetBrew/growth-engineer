import Link from 'next/link'
import { AgentMark } from '@/components/common/agent-mark'
import {
  type CompanyAvatar,
  CompanyLogo,
} from '@/components/common/company-avatars'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function StepMarker({
  company,
  label,
  isLast,
}: {
  company?: CompanyAvatar & { href: string }
  label: string
  isLast: boolean
}) {
  return (
    <span className="flex flex-col items-center">
      <Tooltip>
        <TooltipTrigger
          render={
            company ? (
              <Link
                aria-label={label}
                className="focus-ring rounded-full"
                href={company.href}
              />
            ) : (
              <span className="rounded-full" />
            )
          }
        >
          {company ? (
            <CompanyLogo company={company} size="sm" />
          ) : (
            <AgentMark />
          )}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      {isLast ? null : (
        <span aria-hidden="true" className="mt-1 w-px flex-1 bg-border" />
      )}
    </span>
  )
}
