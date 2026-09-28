# CI

Five jobs, each proving something a human reviewer cannot reliably check by
reading a diff, and `test`, the one required check, which needs all of them.
They run on every pull request, including one from a fork: no job needs a
secret, and the token is read-only.

| Job | Proves |
| --- | --- |
| `lint` | Biome: style, formatting, AND no import cycles |
| `typecheck (×3)` | each TypeScript program compiles, in parallel |
| `build` | the production build works — on the PR — every catalog page and file prerenders, and no route's client JS grew past its budget |
| `test (unit)` | the hermetic unit suite, including the content suite over the real tree |
| `hygiene` | docs links, the content tree, dead code, duplicate deps |

## Why the typecheck is a matrix

`pnpm tsc` chains three programs: app, tests, scripts. Run sequentially, wall
time is the SUM. As matrix legs it is the slowest one — and a failure names
its program in the job title instead of making you read a log to find out
which one went red.

The split exists for the same reason the programs exist: `next build` and the
fast check should not compile thousands of test and script files that no
runtime depends on.

## Why `build` runs in CI at all

The hosting platform already builds on deploy — but that is AFTER merge. A
broken build and every client-bundle regression would reach main first and be
discovered by whoever merged next. This job runs on the pull request.

It needs no environment at all: the catalog is built from the checkout, and
`lib/env.ts` reads nothing secret. A variable appearing in that job means
`lib/env.ts` grew one.

The bundle budget step reads THIS build's manifests, so it has to live in this
job. See [`performance.md`](performance.md).

## Why the content suite runs twice

`pnpm test:run` includes `tests/content.test.ts`, and `hygiene` runs
`pnpm content:check` as its own step. The second run is for the contributor:
a pull request that only adds a company gets a step named after the thing it
changed, with every problem listed, instead of a failed unit-test job.

## Why hygiene uses `continue-on-error`

These gates are mutually independent, but steps run sequentially and a bare
failure aborts the rest. The job would then report exactly one problem per
run: fix one gate, push, wait five minutes, discover the docs are broken too,
push, wait again.

`continue-on-error` marks the step's OUTCOME as failure while letting the job
continue; the final step re-reads every outcome and fails the job if any gate
failed. One run, the complete list.

## Why `test` is a separate aggregator job

`test` is the ONE check branch protection requires, and it `needs` every
other job — lint, both typecheck legs, the build and its bundle budget,
the unit suite and hygiene — so one name covers them all and a new job only
has to be added to that list. `if: always()` matters: without it a failed
job makes `test` *skipped*, and a required check that is skipped is one a
merge sails past. Set it once the repository is public: Settings → Branches
→ require status checks → `test`.

## Why `runs-on` reads a variable

`${{ vars.CI_RUNNER_LARGE || 'ubuntu-latest' }}` is the rollback plan. If you
move to a faster runner fleet and that fleet has an incident, the obvious fix —
"open a PR changing `runs-on` back" — requires the CI you no longer have.
Setting the repository variables (`CI_RUNNER_LARGE` for the build,
`CI_RUNNER_SMALL` for the rest) moves every job in seconds, with no commit,
no review, and no green build required.

## Least privilege

`permissions: contents: read` at the workflow level. Nothing in CI writes to
the repository. Without that block the token inherits the organization default,
which is frequently read-WRITE — handing every third-party action and every
dependency install script a push-capable token.

`persist-credentials: false` on checkout, for the same reason: it stops the
token from sitting in `.git/config` for the rest of the job.

## Dependabot, actions only

Every `uses:` pins a floating major tag, so nothing tells you a v5 exists or
that an action shipped a security fix. That is the drift nobody notices until a
runner image change breaks a workflow. The npm tree is managed through the
lockfile with its own review flow — adding it here would open dozens of PRs a
week and the config would get muted within a month.
