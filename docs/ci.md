# CI

Six jobs, each proving something a human reviewer cannot reliably check by
reading a diff.

| Job | Proves |
| --- | --- |
| `lint` | Biome: style, formatting, AND no import cycles |
| `typecheck (×5)` | each TypeScript program compiles, in parallel |
| `build` | the production build works — on the PR — and no route's client JS grew past its budget |
| `test (unit)` | the hermetic unit suite |
| `test (convex)` | the authorization tests |
| `hygiene` | docs links, Convex codegen freshness, dead code, duplicate deps |

## Why the typecheck is a matrix

`pnpm tsc` chains five programs: app, tests, scripts, convex, convex-tests. Run
sequentially, wall time is the SUM. As matrix legs it is the slowest one — and
a failure names its program in the job title instead of making you read a log
to find out which of the five went red.

The split exists for the same reason the programs exist: `next build` and the
fast check should not compile thousands of test and script files that no
runtime depends on.

## Why `build` runs in CI at all

The hosting platform already builds on deploy — but that is AFTER merge. A
broken build and every client-bundle regression would reach main first and be
discovered by whoever merged next. This job runs on the pull request.

It builds with PLACEHOLDER environment values, never secrets: a pull request
from a fork must not see a credential, and the build only needs enough for
module-scope code to parse (a Convex URL, a syntactically valid Clerk
publishable key, a service token of the right shape).

The bundle budget step reads THIS build's manifests, so it has to live in this
job. See [`performance.md`](performance.md).

## Why hygiene uses `continue-on-error`

These gates are mutually independent, but steps run sequentially and a bare
failure aborts the rest. The job would then report exactly one problem per
run: fix one gate, push, wait five minutes, discover the docs are broken too,
push, wait again.

`continue-on-error` marks the step's OUTCOME as failure while letting the job
continue; the final step re-reads every outcome and fails the job if any gate
failed. One run, the complete list.

## Why `test` is a separate aggregator job

`test-unit` and `test-convex` run in parallel, and `test` is the name branch
protection requires. `if: always()` matters: without it, a sibling failure
makes `test` *skipped*, and a required check that is skipped is a required
check that a merge sails past.

## Why `runs-on` reads a variable

`${{ vars.CI_RUNNER_LARGE || 'ubuntu-latest' }}` is the rollback plan. If you
move to a faster runner fleet and that fleet has an incident, the obvious fix —
"open a PR changing `runs-on` back" — requires the CI you no longer have.
Setting a repository variable moves every job in seconds, with no commit, no
review, and no green build required.

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
