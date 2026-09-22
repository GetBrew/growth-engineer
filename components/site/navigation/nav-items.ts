import {
  Building03Icon,
  WorkflowSquare01Icon,
  Wrench01Icon,
} from '@hugeicons/core-free-icons'

export const NAV_ITEMS = [
  { href: '/workflows', label: 'Workflows', icon: WorkflowSquare01Icon },
  { href: '/tools', label: 'Tools', icon: Wrench01Icon },
  { href: '/companies', label: 'Companies', icon: Building03Icon },
] as const
