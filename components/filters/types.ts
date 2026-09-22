export type FilterOption = {
  key: string
  label: string
  /** Shown beside the label, and used to rank. Omit for a fixed order. */
  count?: number
  href: string
  active: boolean
  /** Shown, but not yet usable. */
  disabled?: boolean
}
