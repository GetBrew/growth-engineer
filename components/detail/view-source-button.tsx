import { DETAIL_ACTION, DETAIL_ACTION_ICON } from '@/components/detail/styles'
import { MaskIcon } from '@/components/layout/mask-icon'
import type { EntityType } from '@/lib/catalog/keys'
import { sourceFileUrl } from '@/lib/github'

export function ViewSourceButton({
  type,
  entityKey,
}: {
  type: EntityType
  entityKey: string
}) {
  return (
    <a
      className={DETAIL_ACTION}
      href={sourceFileUrl({ type, key: entityKey })}
      rel="noreferrer"
      target="_blank"
    >
      <MaskIcon size={DETAIL_ACTION_ICON} src="/social/github.svg" />
      View on GitHub
    </a>
  )
}
