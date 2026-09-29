import { ACCESS_LABEL, ACCESS_ORDER } from '@/lib/constants/catalog'
import type { AccessType } from '@/lib/types/catalog'

export function accessTypeLabels(
  access: ReadonlyArray<AccessType>
): Array<string> {
  const types = new Set(access)
  return ACCESS_ORDER.filter((type) => types.has(type)).map(
    (type) => ACCESS_LABEL[type]
  )
}

export function accessTypeLabel(type: AccessType): string {
  return ACCESS_LABEL[type]
}
