# Validation and the dev loop

## Proportional validation

Run the smallest check that can catch the mistake you just made. The full gate
exists, but running it after every patch is how people stop running it.

| When | Command | Cost |
| --- | --- | --- |
| While editing | `pnpm exec biome check --write <all touched files>` | ~2s, whole-project load |
| While editing | `pnpm test:run tests/<exact file>` | ~1s |
| Once per unit of work | `pnpm check` (Biome + `tsgo`) | seconds |
| Final handoff | `pnpm tsc` then `pnpm lint` | a minute or two |
| Touched `companies/`, `workflows/` or `tags.yml` | `pnpm content:check`: every problem with its file path | ~1s |
| Touched the renderer | `pnpm test:run tests/render-markdown.test.ts`: the goldens, byte for byte | ~1s |
| Docs only | `pnpm docs:check` | instant |
| Everything | `pnpm validate` | minutes |

**Batch the Biome call.** Every `biome check` loads the whole project, about
2 GB of memory, whether you pass it one file or forty. Calling it once per file
in a loop does the same work forty times.

## The heavy lock

`check`, every `tsc*`, `build`, `test:run` and `knip` run under
`scripts/heavy-lock.mjs`: one at a time per repository, across every git
worktree of it.

Each of those commands loads the entire project, several gigabytes apiece.
Two at once on a laptop means swapping; three can get a process killed for
running out of memory, which looks like a test that failed with no output.
With one developer in one checkout you can avoid that by hand. With three
worktrees and a coding agent running checks in each, you can't.

A second command waits in line instead of failing, and the message names the
command holding the lock. **A timeout means the queue was too long, not that
the check failed.**

Never call the underlying tools directly (`tsc`, `vitest`, `next build`,
`knip`); that skips the lock. It's also why `pnpm test:run` accepts a file
filter. `CI=1` or `HEAVY_LOCK_DISABLE=1` skips the lock; CI sets it because a
runner is already one job on one machine.

## Dev servers

Always `pnpm dev`, never `npx next dev`. The wrapper does three things the bare
command doesn't:

1. **Prunes the Turbopack dev cache** above 3 GB. One long session writes about
   2 GB, and several worktrees can quietly fill tens of gigabytes.
2. **Caps the heap** at 3 GB, so a runaway compile fails instead of taking
   the machine with it.
3. **Stops the exit flusher.** Next starts a detached telemetry flusher every
   time a dev server shuts down, even with telemetry disabled. It loads
   `next.config.ts`, and if anything in that graph starts a long-lived
   service, the flusher never exits: a few hundred MB each, parented to init,
   easy to miss. Stop four dev servers in an afternoon and the machine starts
   swapping for no visible reason.

Stop every server, watcher and browser you start before you hand work off.

## Multiple worktrees

Git worktrees are the cheapest way to run several branches, or several coding
agents, at once. What runs out is memory, not git.

- The heavy lock is shared by every worktree of the repository, on purpose:
  the budget is the machine, not the checkout.
- Keep at most two dev servers running on the machine.
- `.next` is disposable. `pnpm cache:prune` reclaims the dev cache; never
  delete it from under a running server.
- Environment files are copied into a new worktree, never symlinked. With a
  symlink, editing one worktree's `.env.local` silently changes another's.

## Tests

- The unit suite (`tests/`) runs in the `node` environment: no DOM, no
  network. A file opts into a DOM with `// @vitest-environment jsdom`.
- The content suite (`tests/content.test.ts`) builds the real tree under
  `companies/`, `workflows/` and `tags.yml` and asks every question a page
  asks; extend it when you add a read. `tests/content-schema.test.ts` holds
  the negative cases, one per rule the build enforces, on in-memory fixtures.
- The suite needs no environment at all, so a fresh clone passes with no
  credentials, and CI runners and cloud agents need no setup.
- **A guard isn't done until you've seen it fail.** Delete what your new test
  protects and watch it go red. A test that passes against broken code only
  costs CI minutes.
