#!/usr/bin/env node
/**
 * A ratchet on the client JavaScript each route ships.
 *
 * WHY A BUDGET AND NOT A REVIEW: nobody adds 400 KB to a route. People add
 * 8 KB, twelve times, over a quarter, each one obviously fine in its own diff —
 * and the page that loaded in 1.2s now loads in 3. A budget makes the twelfth
 * one visible in the pull request that causes it, which is the only moment
 * anyone can cheaply choose differently.
 *
 * The policy is deliberately generous per change and strict in aggregate:
 * growth of 5% or 15 KB, whichever is SMALLER. A legitimate feature clears it;
 * a stray `import` of a charting library does not.
 *
 *   pnpm build && pnpm perf:bundle            # check (the CI gate)
 *   pnpm build && pnpm perf:bundle:snapshot   # re-baseline, on a green build
 *
 * Re-baselining is a deliberate act with a diff someone reads. That is the
 * point — a budget you can silently regenerate is not a budget.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const NEXT_ROOT = path.join(ROOT, '.next')
const BUDGET_PATH = path.join(ROOT, 'performance-budgets', 'client-js.json')
const MAX_PERCENT_GROWTH = 0.05
const MAX_ABSOLUTE_GROWTH = 15 * 1024
// A snapshot older than this predates routes that have since moved or split;
// it decays into false reds and missed regressions.
const STALE_AFTER_DAYS = 60

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, value = 'true'] = argument.replace(/^--/, '').split('=', 2)
    return [key, value]
  })
)
const MODE = args.get('mode') ?? 'check'

const routesManifestPath = path.join(NEXT_ROOT, 'app-path-routes-manifest.json')
const serverPathsManifestPath = path.join(
  NEXT_ROOT,
  'server/app-paths-manifest.json'
)
if (!(existsSync(routesManifestPath) && existsSync(serverPathsManifestPath))) {
  console.error(
    `Missing build manifests under ${NEXT_ROOT}. Run \`pnpm build\` first.`
  )
  process.exit(1)
}

const appPathRoutes = JSON.parse(readFileSync(routesManifestPath, 'utf8'))
const serverAppPaths = JSON.parse(readFileSync(serverPathsManifestPath, 'utf8'))

/** `/(app)/dashboard/page` → `/dashboard`: route GROUPS are not URL segments. */
function normalizeRoute(key) {
  const withoutGroups = key.replace(/\/(?:\([^/]+\))/g, '')
  return withoutGroups.replace(/\/page$/, '') || '/'
}

function fileBytes(file) {
  if (!file.endsWith('.js')) {
    return 0
  }
  const absolute = path.join(NEXT_ROOT, file.replace(/^\/_next\//, ''))
  return existsSync(absolute) ? readFileSync(absolute).byteLength : 0
}

/** Every client chunk a route loads: shared runtime + its own client components. */
function readRouteFiles(appPath) {
  const serverFile = serverAppPaths[appPath]
  if (!serverFile) {
    return []
  }
  const serverBase = path.join(NEXT_ROOT, 'server', serverFile)
  const files = new Set()

  const buildManifestPath = serverBase.replace(/\.js$/, '/build-manifest.json')
  if (existsSync(buildManifestPath)) {
    const buildManifest = JSON.parse(readFileSync(buildManifestPath, 'utf8'))
    for (const file of [
      ...(buildManifest.polyfillFiles ?? []),
      ...(buildManifest.rootMainFiles ?? []),
    ]) {
      files.add(file)
    }
  }

  const clientReferencePath = serverBase.replace(
    /\.js$/,
    '_client-reference-manifest.js'
  )
  if (existsSync(clientReferencePath)) {
    // The manifest is a JS assignment, not JSON — slice out the object literal.
    const source = readFileSync(clientReferencePath, 'utf8')
    const jsonStart = source.indexOf('{', source.indexOf('] = '))
    const jsonEnd = source.lastIndexOf('};')
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const clientReference = JSON.parse(source.slice(jsonStart, jsonEnd + 1))
      for (const routeFiles of Object.values(
        clientReference.entryJSFiles ?? {}
      )) {
        for (const file of routeFiles) {
          files.add(file)
        }
      }
    }
  }

  return [...files]
}

const routeBytes = Object.fromEntries(
  Object.entries(appPathRoutes)
    .filter(([appPath]) => appPath.endsWith('/page'))
    .map(([appPath, route]) => [
      normalizeRoute(route),
      readRouteFiles(appPath).reduce(
        (total, file) => total + fileBytes(file),
        0
      ),
    ])
    .filter(([, bytes]) => bytes > 0)
    .sort(([left], [right]) => left.localeCompare(right))
)

if (MODE === 'snapshot') {
  mkdirSync(path.dirname(BUDGET_PATH), { recursive: true })
  writeFileSync(
    BUDGET_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        policy: {
          maxPercentGrowth: MAX_PERCENT_GROWTH,
          maxAbsoluteGrowthBytes: MAX_ABSOLUTE_GROWTH,
          allowedGrowth: 'minimum of percentage and absolute thresholds',
        },
        routes: routeBytes,
      },
      null,
      2
    )}\n`
  )
  console.log(
    `Wrote ${Object.keys(routeBytes).length} route budgets to ${path.relative(ROOT, BUDGET_PATH)}`
  )
  process.exit(0)
}

if (!existsSync(BUDGET_PATH)) {
  console.error(
    `Missing committed budget snapshot: ${path.relative(ROOT, BUDGET_PATH)}. Create it with \`pnpm perf:bundle:snapshot\`.`
  )
  process.exit(1)
}

const budget = JSON.parse(readFileSync(BUDGET_PATH, 'utf8'))

const generatedAt = Date.parse(budget.generatedAt)
const ageDays = Number.isFinite(generatedAt)
  ? Math.floor((Date.now() - generatedAt) / 86_400_000)
  : Number.POSITIVE_INFINITY
if (ageDays > STALE_AFTER_DAYS) {
  // `::warning::` renders as a GitHub Actions annotation and as plain text
  // anywhere else. Advisory on purpose: the fix is a refreshed snapshot on a
  // green build, not a failed check.
  console.warn(
    `::warning file=performance-budgets/client-js.json::Budget snapshot is ${ageDays} days old (threshold ${STALE_AFTER_DAYS}). Refresh it with \`pnpm perf:bundle:snapshot\` on a green build.`
  )
}

const failures = []
for (const [route, baseline] of Object.entries(budget.routes)) {
  const current = routeBytes[route]
  if (current == null) {
    // A route in the budget but not in the build is usually a rename. Say so
    // rather than silently dropping coverage of it.
    failures.push(`${route}: in the budget but missing from this build`)
    continue
  }
  const limit =
    baseline +
    Math.min(Math.ceil(baseline * MAX_PERCENT_GROWTH), MAX_ABSOLUTE_GROWTH)
  if (current > limit) {
    failures.push(
      `${route}: ${current} bytes exceeds the ${limit} byte limit (${baseline} baseline, +${current - baseline})`
    )
  }
}

if (failures.length > 0) {
  console.error('client bundle budget FAILED:')
  for (const failure of failures) {
    console.error(`  - ${failure}`)
  }
  console.error(
    '\nEither trim the route (dynamic import, move work to the server) or re-baseline deliberately with `pnpm perf:bundle:snapshot`.'
  )
  process.exit(1)
}

console.log(
  `client bundle budget passed for ${Object.keys(budget.routes).length} routes.`
)
