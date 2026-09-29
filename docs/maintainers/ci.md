# CI

Six jobs, each checking something a reviewer can't reliably check by reading
a diff, plus `test`, the one required check, which needs all six. They run on
every pull request, including one from a fork: no job needs a secret, and the
token is read-only.

| Job | Checks |
| --- | --- |
| `lint` | Biome: style, formatting and import cycles |
| `typecheck (×2)` | Each TypeScript program (app, tests) compiles, in parallel |
| `build` | The production build works on the pull request: every catalog page and file prerenders, and no route's client JavaScript grew past its budget |
| `test (unit)` | The hermetic unit suite, including the content suite over the real tree |
| `hygiene` | Docs links, the content tree, dead code, duplicate dependencies |
| `logos` | Every company's logo is on cdn.growth.engineer with the bytes its URL names, and none is waiting for upload |

## Why the typecheck is a matrix

`pnpm tsc` checks two programs, app and tests. Run one after the other, the
job takes as long as both together; as matrix legs it takes as long as the
slower one, and a failure names its program in the job title.

The programs are split so that `next build` and the fast check never compile
the thousands of test and script files no runtime depends on.

## Why `build` runs in CI

Vercel builds on deploy, which is after the merge. Without this job, a broken
build or a client bundle regression would reach `main` first. This job builds
the pull request instead.

It needs no environment: the catalog is built from the checkout, and every
variable in `lib/env.ts` is optional. Without `GITHUB_TOKEN` the header's star
count may be missing from the CI build, which changes nothing it checks.

The bundle budget step reads this build's manifests, so it runs in this job.
See [`performance.md`](performance.md).

## Why the content suite runs twice

`pnpm test:run` includes `tests/content.test.ts`, and `hygiene` runs
`pnpm content:check` as its own step. The second run is for contributors: a
pull request that only adds a company gets a step named after what it
changed, with every problem listed, instead of a failed unit-test job.

## Why `logos` fails a contributor's new logo

A contributor can't upload to the CDN, so a new company arrives with its logo
as a file beside `company.md`. `pnpm content:check` checks the file itself.
The `logos` job then fails until a maintainer runs `pnpm logos:upload` on the
branch, which moves the file to the CDN and writes its URL into
`company.md`. That keeps a logo from merging as a file the site never shows.
The job reads the public CDN and needs no secret. The flow is in
[`logos.md`](logos.md).

## Why hygiene uses `continue-on-error`

The hygiene gates are independent, but steps run in order and a failure stops
the rest. Without `continue-on-error`, each run would report one problem: fix
it, push, wait, and find the next.

`continue-on-error` records the step's outcome as a failure and lets the job
continue. The last step reads every outcome and fails the job if any gate
failed, so one run lists every problem.

## Why `test` is a separate job

`test` is the one check to require in branch protection. It `needs` every
other job (lint, both typecheck legs, the build and its bundle budget, the
unit suite, hygiene and the logos), so one name covers them all and a new job only has
to join that list. `if: always()` matters: without it, a failed job makes
`test` skipped, and branch protection lets a skipped required check through.
To require it: Settings → Branches → add a rule for `main` → require status
checks to pass → `test`.

## Why `runs-on` reads a variable

`${{ vars.CI_RUNNER_LARGE || 'ubuntu-latest' }}` is the rollback plan. If the
project moves to a faster runner fleet and that fleet has an incident, a pull
request changing `runs-on` back would need the CI that is down. Setting the
repository variables (`CI_RUNNER_LARGE` for the build, `CI_RUNNER_SMALL` for
the rest) moves every job at once, with no commit.

## Least privilege

`permissions: contents: read` is set for the whole workflow, because nothing
in CI writes to the repository. Without it, the token inherits the
organization default, often read-write, and every third-party action and
install script would get a token that can push.

`persist-credentials: false` on checkout keeps the token out of `.git/config`
for the rest of the job.

## Dependabot, for Actions only

Every `uses:` pins a floating major tag, so nothing announces a new major, a
deprecation or a security fix in an action. Dependabot opens one grouped pull
request a month for them. npm dependencies are managed through the lockfile;
adding them here would open dozens of pull requests a week.
