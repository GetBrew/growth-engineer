import { DetailPageSkeleton } from './detail-page-skeleton'

/** `/tools/[handle]/[name]` — a tool's summary is one sentence. */
export function ToolDetailSkeleton() {
  return <DetailPageSkeleton summaryLines={1} />
}
