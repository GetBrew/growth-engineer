import { SearchAreaIcon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { NoResults } from '@/components/common/no-results'
import { Page } from '@/components/layout/page'
import { buttonVariants } from '@/components/ui/button'
import { SECTIONS } from '@/lib/constants/sections'

export default function NotFound() {
  return (
    <Page>
      <NoResults
        description="No company, tool or workflow lives at this address."
        icon={SearchAreaIcon}
        title="Not found"
      >
        <div className="flex flex-wrap justify-center gap-2">
          {SECTIONS.map((section) => (
            <Link
              className={buttonVariants({ variant: 'outline', size: 'pill' })}
              href={section.href}
              key={section.href}
            >
              {section.label}
            </Link>
          ))}
        </div>
      </NoResults>
    </Page>
  )
}
