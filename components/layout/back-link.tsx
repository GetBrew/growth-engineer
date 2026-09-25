import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="focus-ring type-control flex w-fit items-center gap-2 rounded-sm text-subtle transition-colors duration-200 hover:text-foreground"
      href={href}
    >
      <HugeiconsIcon
        aria-hidden="true"
        icon={ArrowLeft01Icon}
        size={16}
        strokeWidth={1.8}
      />
      {label}
    </Link>
  )
}
