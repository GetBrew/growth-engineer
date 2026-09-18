import { permanentRedirect } from 'next/navigation'

/**
 * `/hacks` is gone, and this is why it is a 308 rather than a 404.
 *
 * A growth hack was once a separate thing — "a workflow with exactly one
 * tool" — with its own `format` projection and three listing indexes behind
 * it. It is not: a hack IS a workflow. The concept was removed, but the URL
 * was public and agents may hold it, and a permanent redirect is how a key
 * that stops meaning something keeps its promise (the same rule `keyAliases`
 * follows for a renamed entity).
 *
 * A route handler, not a page: a redirect decided inside a Suspense child
 * becomes a `<meta refresh>` that agents ignore.
 */
export function GET() {
  permanentRedirect('/workflows')
}
