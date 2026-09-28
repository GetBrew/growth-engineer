# Validation and the dev loop

## Proportional validation

Run the smallest check that can find the mistake you just made. The full gate
exists; running it after every patch is how people stop running it at all.

| When | Command | Cost |
| --- | --- | --- |
| While editing | `pnpm exec biome check --write <all touched files>` | ~2s, whole-project load |
| While editing | `pnpm test:run tests/<exact file>` | ~1s |
| Once per unit of work | `pnpm check` (Biome + `tsgo`) | seconds |
| Final handoff | `pnpm tsc` then `pnpm lint` | a minute or two |
| Touched `companies/`, `workflows/` or `tags.yml` | `pnpm content:check` — every problem with its file path | ~1s |
| Touched the renderer | `pnpm test:run tests/render-markdown.test.ts` — the goldens, byte for byte | ~1s |
| Docs only | `pnpm docs:check` | instant |
| Everything | `pnpm validate` | minutes |

**Batch the Biome call.** Every `biome check` invocation loads the whole
project layer — about 2GB of resident memory — whether you pass it one file or
forty. Calling it per file in a loop is the same work, forty times.

## The heavy lock

`check`, every `tsc*`, `build`, `test:run`, `content:check` and `knip` run under
`scripts/heavy-lock.mjs`: ONE at a time, per repository, across every git
worktree of it.

This is not politeness. Each of those loads the entire project — gigabytes
apiece. Two at once on a laptop is swap; three is a kernel OOM kill, which
arrives as a test that "failed" with no output and sends you debugging the
wrong thing. With one developer in one checkout you can avoid that by hand.
With three worktrees and a coding agent running checks in each, you cannot.

A waiter QUEUES rather than failing, and the message names the holder. **A
timeout is a queue timeout, not a check failure.**

Never call the underlying binary directly (`tsc`, `vitest`, `next build`,
`knip`) — that is exactly the bypass the lock exists to prevent, and it is why
`pnpm test:run` accepts a file filter instead of sending you to `vitest`.
`CI=1` or `HEAVY_LOCK_DISABLE=1` skips the lock; CI sets it because a runner is
already one job on one machine.

## Dev servers

Always `pnpm dev`. Never `npx next dev`.

The wrapper does three things the bare command cannot:

1. **Prunes the Turbopack dev cache** above 3GB. One broad session writes
   ~2GB; several worktrees quietly consume tens of GB.
2. **Caps the heap** at 3GB so a runaway compile fails instead of taking the
   machine with it.
3. **Reaps the exit flusher.** Next spawns a DETACHED telemetry flusher on
   every dev-server shutdown, even with telemetry disabled. It loads
   `next.config.ts`; if anything in that graph starts a long-lived service, the
   flusher never exits — a few hundred MB, parented to init, invisible in any
   process list you would think to check. Stop four dev servers over an
   afternoon and the machine swaps for reasons nothing explains.

Stop every server, watcher and browser you start, before you hand work off.

## Multiple worktrees

Git worktrees are the cheapest way to run several branches — or several coding
agents — at once, and the failure mode is always memory, never git.

- The heavy lock is shared across every worktree of one repository. That is the
  design: the budget is the machine, not the checkout.
- Keep at most two dev servers running machine-wide.
- `.next` is disposable. `pnpm cache:prune` reclaims the dev cache; never
  delete one out from under a running server.
- Environment files are COPIED into a new worktree, never symlinked — a
  symlink means one worktree's `.env.local` edit silently changes another's.

## Tests

- The unit suite (`tests/`) runs in the `node` environment: no DOM, no
  network. A file opts into a DOM with `// @vitest-environment jsdom`.
- The content suite (`tests/content.test.ts`) builds the real tree under
  `companies/`, `workflows/` and `tags.yml` and asks every question a page asks;
  extend it when you add a read. `tests/content-schema.test.ts` holds the
  negatives — one per rule the build enforces — on in-memory fixtures.
- The suite needs no environment at all, which is what makes a fresh clone
  hermetic: green with no credentials, so CI runners and cloud agents need
  zero setup.
- **A guard is not done until it has failed.** Delete the thing your new test
  protects and watch it go red. A test that passes against the broken code is
  not a test; it is a comment that costs CI minutes.
