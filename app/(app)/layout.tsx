import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { type ReactNode, Suspense } from 'react'

/**
 * The signed-in shell. The proxy (proxy.ts) already refused anonymous visitors
 * before this rendered, so nothing here needs to re-check — and re-checking
 * would make the shell dynamic for no benefit.
 *
 * `<UserButton />` is a client component that reads the session in the
 * browser, so it costs the shell nothing.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <Link className="font-medium text-sm" href="/dashboard">
          Starter
        </Link>
        {/*
          `<UserButton />` reads request-time navigation state. Outside a
          boundary it would block this shell — which every signed-in route
          shares — from prerendering. The fallback is the same size as the
          avatar so the header does not shift when it mounts.
        */}
        <Suspense
          fallback={
            <div aria-hidden className="size-7 rounded-full bg-muted" />
          }
        >
          <UserButton />
        </Suspense>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
