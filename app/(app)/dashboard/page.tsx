import type { Metadata } from 'next'
import { Suspense } from 'react'
import { api } from '@/convex/_generated/api'
import { tenantQuery } from '@/lib/convex/gateway'
import { TaskList } from './task-list'

export const metadata: Metadata = { title: 'Dashboard' }

/**
 * THE CANONICAL CACHE COMPONENTS PAGE. Copy this shape for every route that
 * needs the session or per-request data.
 *
 * The default export is SYNCHRONOUS and returns a `<Suspense>` boundary. Every
 * request-time read — `auth()`, `cookies()`, `params`, a Convex query — lives
 * inside the async child. That split is what lets Next prerender the static
 * shell (heading, layout, skeleton) and stream the data into it.
 *
 * Make the default export `async` and `await` anything at the top, and the
 * whole route drops out of the prerender: the user stares at nothing until the
 * server has finished. `next dev` flags it as a blocking route
 * (`experimental.instantInsights`), which is why that setting is pinned on.
 *
 * The fallback must be DIMENSIONALLY STABLE — same box as the real content —
 * or the page lands and then jumps.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-tight">Tasks</h1>
        <p className="text-muted-foreground text-sm">
          Reads and writes go through Convex; every function verifies the
          caller.
        </p>
      </div>
      <Suspense fallback={<TasksSkeleton />}>
        <TasksLoader />
      </Suspense>
    </div>
  )
}

async function TasksLoader() {
  // `tenantQuery` attaches the signed-in user of THIS request, so the Convex
  // guard has an identity to verify. The initial rows are rendered on the
  // server; <TaskList /> then subscribes for live updates.
  const tasks = await tenantQuery(api.tasks.list, {})
  return <TaskList initialTasks={tasks} />
}

function TasksSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {[0, 1, 2].map((row) => (
        <div className="h-11 animate-pulse rounded-md bg-muted" key={row} />
      ))}
    </div>
  )
}
