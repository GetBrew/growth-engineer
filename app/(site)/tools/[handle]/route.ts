import { isValidHandle } from '@/lib/catalog/keys'
import {
  loadCompany,
  loadToolsByCompany,
  resolveAlias,
} from '@/lib/catalog/loaders'
import { toolShortcutParams } from '@/lib/catalog/static-params'

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
