import { isValidHandle } from '@convex/model/keys'
import {
  loadCompany,
  loadToolsByCompany,
  resolveAlias,
} from '@/lib/catalog/loaders'

/**
 * `/tools/clay` is a shortcut, never a page: a company with one tool goes to
 * that tool, any other company to its page, which already lists the tools.
 *
 * A ROUTE HANDLER, not a page, because a redirect cannot be streamed. Decided
 * inside a `<Suspense>` boundary it would arrive after the shell had flushed,
 * as a `<meta http-equiv="refresh">` that agents and crawlers do not follow;
 * decided in an async page shell it cannot prerender at all. Nothing renders
 * here, so a handler costs nothing — and the 404 is plain text because this
 * URL is a shortcut, not a destination.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  if (!isValidHandle(handle)) {
    return new Response('Not found', { status: 404 })
  }
  const [company, tools] = await Promise.all([
    loadCompany(handle),
    loadToolsByCompany(handle),
  ])
  if (!company) {
    const alias = await resolveAlias('company', handle)
    return alias
      ? Response.redirect(new URL(`/tools/${alias.key}`, request.url), 308)
      : new Response('Not found', { status: 404 })
  }
  const target =
    tools.length === 1 && tools[0]
      ? `/tools/${tools[0].key}`
      : `/companies/${company.key}`
  return Response.redirect(new URL(target, request.url), 308)
}
