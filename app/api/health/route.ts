/**
 * Liveness probe. No identity, no data — it answers "is this deployment
 * serving?" and nothing else, which is why it is safe to list in
 * PUBLIC_API_ROUTE_PATTERNS.
 *
 * A health check that reads the database is a health check that reports your
 * database's outage as your app being down, and that takes the database down
 * harder under load-balancer retries.
 */
export function GET() {
  return Response.json(
    {
      status: 'ok',
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
