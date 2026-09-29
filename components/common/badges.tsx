import { ACCESS_LABEL } from '@/lib/constants/catalog'
import type { AccessType } from '@/lib/types/catalog'

export function accessTypeLabel(type: AccessType): string {
  return ACCESS_LABEL[type]
}
