import { describe, expect, test } from 'vitest'
import { readSourceFiles } from './helpers/source-files'

/**
 * Identity-scoped reactive queries MUST go through `useAuthedQuery`
 * (hooks/use-authed-query.ts).
 *
 * The Clerk JWT attaches to the Convex socket asynchronously AFTER mount. A
 * guarded query fired in that window throws and takes the React tree down —
 * intermittently, network-timing dependent, reproducible on nobody's laptop.
 * The wrapper holds the query until Convex reports an identity.
 *
 * `useMutation` is deliberately not covered: a mutation fires on user action,
 * long after auth attached.
 */

/** Files allowed to import the raw hooks, with the reason. */
const ALLOWLIST = new Set([
  // The wrapper itself — it is the thing that adds the gate.
  'hooks/use-authed-query.ts',
])

const RAW_QUERY_HOOK_IMPORT =
  /import\s*\{[^}]*\b(useQuery|usePaginatedQuery)\b[^}]*\}\s*from\s*['"](convex\/react|convex-helpers\/react\/cache\/hooks)['"]/

describe('client Convex query gating', () => {
  const files = ['app', 'components', 'hooks'].flatMap((dir) =>
    readSourceFiles(dir)
  )

  test('there are client files to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  test('no component imports useQuery / usePaginatedQuery directly', () => {
    const offenders = files
      .filter(({ relativePath }) => !ALLOWLIST.has(relativePath))
      .filter(({ source }) => RAW_QUERY_HOOK_IMPORT.test(source))
      .map(({ relativePath }) => relativePath)

    expect(
      offenders,
      'Use useAuthedQuery from @/hooks/use-authed-query. If the function is genuinely public (publicQuery), add the file to ALLOWLIST with a note saying which function and why.'
    ).toEqual([])
  })
})
