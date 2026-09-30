import { AgentMark } from '@/components/common/agent-mark'
import {
  type CompanyAvatar,
  CompanyAvatars,
} from '@/components/common/company-avatars'
import styles from './copied-mark.module.css'

const MAX_LOGOS = 3

export function CopiedMark({
  companies = [],
}: {
  companies?: ReadonlyArray<CompanyAvatar>
}) {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center gap-1">
      {companies.length > 0 ? (
        <>
          <span className={styles.logos}>
            <CompanyAvatars
              companies={companies.slice(0, MAX_LOGOS)}
              links={false}
              more={
                companies.length > MAX_LOGOS
                  ? `+${companies.length - MAX_LOGOS}`
                  : undefined
              }
              size="sm"
              tooltips={false}
            />
          </span>
          <span className={`flex items-center gap-0.5 ${styles.trail}`}>
            <span className="size-1 rounded-full bg-foreground/25" />
            <span className="size-1 rounded-full bg-foreground/40" />
            <span className="size-1 rounded-full bg-foreground/60" />
          </span>
        </>
      ) : null}
      <AgentMark className={styles.agent} />
    </span>
  )
}
