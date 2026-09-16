import { type ReactNode, Suspense } from 'react'

/**
 * The shell both Clerk auth pages mount into.
 *
 * THE `<Suspense>` IS LOAD-BEARING, not decoration. Clerk's `<SignIn />` and
 * `<SignUp />` read `usePathname()` to know which step they are on — that is
 * request-time data. Under `cacheComponents` a client hook like that outside a
 * boundary fails the BUILD with `CLIENT_HOOK_DYNAMIC`, which is the good
 * outcome: the alternative is a silently un-prerendered page.
 *
 * The fallback reserves the card's box so the page does not jump when Clerk
 * mounts.
 */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Suspense
        fallback={
          <div
            aria-hidden
            className="h-[30rem] w-[25rem] max-w-full animate-pulse rounded-lg bg-muted"
          />
        }
      >
        {children}
      </Suspense>
    </main>
  )
}
