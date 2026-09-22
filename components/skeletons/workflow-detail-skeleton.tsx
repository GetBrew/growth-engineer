import { DetailPageSkeleton } from './detail-page-skeleton'

/** `/workflows/[owner]/[name]` — a workflow's summary usually runs two lines. */
export function WorkflowDetailSkeleton() {
  return <DetailPageSkeleton summaryLines={2} />
}
