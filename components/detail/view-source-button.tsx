import {
  DETAIL_ACTION_ICON,
  HEADER_ACTION_COLLAPSING,
} from '@/components/detail/styles'
import { MaskIcon } from '@/components/layout/mask-icon'
import type { EntityType } from '@/lib/catalog/keys'
import { sourceFileUrl } from '@/lib/github'

/**
 * A catalog entry knows its own source file, so it passes its key and the URL
 * is derived. A page with no entry behind it — a guide — passes the URL it
 * wants instead, rather than growing a second button that looks the same.
 */
type Props = { type: EntityType; entityKey: string } | { href: string }

export function ViewSourceButton(props: Props) {
  const href =
    'href' in props
      ? props.href
      : sourceFileUrl({ type: props.type, key: props.entityKey })

  return (
    // Phones show the mark alone, as a circle the size of Share's, so the
    // primary action beside them keeps its full label on one line.
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
