import { NoResults } from '@/components/common/no-results'

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return <NoResults description={hint} title={title} variant="card" />
}
