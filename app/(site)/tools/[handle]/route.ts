import { isValidHandle } from '@/lib/catalog/keys'
import {
  loadCompany,
  loadToolsByCompany,
  resolveAlias,
} from '@/lib/catalog/loaders'
import { toolShortcutParams } from '@/lib/catalog/static-params'

/**
 * `/tools/clay` is a shortcut, never a page: a company with one tool goes to
 * that tool, any other company to its page, which already lists the tools.
 *
 * A ROUTE HANDLER, not a page, because a redirect cannot be streamed. Decided
 * inside a `<Suspense>` boundary it would arrive after the shell had flushed,
 * as a `<meta http-equiv="refresh">` that agents and crawlers do not follow;
 * decided in an async page shell it cannot prerender at all. Every company
 * handle and every old handle is a static param, so the build writes each
 * redirect once; the `Location` is relative because reading `request.url`
 * would make the route dynamic. An unknown handle renders on demand and is a
 * 404.
 */
export function generateStaticParams() {
  return toolShortcutParams()
}

function redirect(location: string) {
  return new Response(null, { status: 308, headers: { Location: location } })
}

export async function GET(
  _request: Request,
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
      ? redirect(`/tools/${alias.key}`)
      : new Response('Not found', { status: 404 })
  }
  const target =
    tools.length === 1 && tools[0]
      ? `/tools/${tools[0].key}`
      : `/companies/${company.key}`
  return redirect(target)
}
