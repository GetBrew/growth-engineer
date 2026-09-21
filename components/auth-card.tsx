import { type ReactNode, Suspense } from 'react'

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Suspense
        fallback={
          <div
            aria-hidden
            className="h-120 w-100 max-w-full animate-pulse rounded-lg bg-muted"
          />
        }
      >
        {children}
      </Suspense>
    </main>
  )
}
