import {
  DETAIL_ACTION_ICON,
  HEADER_ACTION_COLLAPSING,
} from '@/components/detail/styles'
import { MaskIcon } from '@/components/layout/mask-icon'
import type { EntityType } from '@/lib/catalog/keys'
import { sourceFileUrl } from '@/lib/github'

type Props = { type: EntityType; entityKey: string } | { href: string }

export function ViewSourceButton(props: Props) {
  const href =
    'href' in props
      ? props.href
      : sourceFileUrl({ type: props.type, key: props.entityKey })

  return (
    <a
      className={HEADER_ACTION_COLLAPSING}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <MaskIcon size={DETAIL_ACTION_ICON} src="/social/github.svg" />
      <span className="max-sm:sr-only">View on GitHub</span>
    </a>
  )
}
