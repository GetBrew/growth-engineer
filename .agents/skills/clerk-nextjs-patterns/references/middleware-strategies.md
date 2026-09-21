# Middleware Strategies

> **Filename:** `proxy.ts` (Next.js <=15: `middleware.ts`). The code is identical; only the filename changes.

## Public-First (marketing sites, blogs)

Protect specific routes, allow everything else:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/settings(.*)',
  '/api/private(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## Protected-First (internal tools, dashboards)

Block everything, allow specific public routes:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});
```

## Permission-Gated Routes

For B2B apps where some routes require a specific permission or role, pass a callback to `auth.protect()`. Clerk returns a 404 if the check fails:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isInvoiceRoute = createRouteMatcher(['/invoices(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isInvoiceRoute(req)) {
    await auth.protect((has) => has({ permission: 'org:invoices:create' }));
  }
  if (isAdminRoute(req)) {
    await auth.protect((has) =>
      has({ role: 'org:admin' }) || has({ role: 'org:billing_manager' })
    );
  }
});
```

Prefer permissions over roles — permissions are more granular and easier to reassign across roles in the Dashboard.

> **Core 2 ONLY (skip if current SDK):** Middleware uses synchronous `clerkMiddleware((auth, req) => { auth().protect((has) => ...) })`. Note `auth()` is called as a function (not `auth.protect`) and the callback signature is the same.

## Token-Based Protection (Machine APIs)

For routes that accept different token types (OAuth tokens, machine-to-machine tokens, API keys), pass a `token` option to `auth.protect()`:

```typescript
const isMachineApi = createRouteMatcher(['/api/machine(.*)']);
const isPublicApi = createRouteMatcher(['/api/public(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isMachineApi(req)) await auth.protect({ token: 'm2m_token' });
  if (isPublicApi(req)) await auth.protect({ token: 'any' });
});
```

Token types: `'session_token'` (default, browser sessions), `'oauth_token'`, `'api_key'`, `'m2m_token'`, `'any'` (accept any valid token).

> **Core 2 ONLY (skip if current SDK):** Token-type protection requires Core 3. In Core 2, `auth().protect()` only accepts a callback (no `token` option) and only validates session tokens.

## Session Tasks

When session tasks are enabled (e.g., forced password reset, MFA setup), users may have a `pending` session status. You can handle this in middleware:

```typescript
export default clerkMiddleware(async (auth, req) => {
  const { sessionStatus } = await auth();

  // Redirect pending sessions to task completion page
  if (sessionStatus === 'pending') {
    return NextResponse.redirect(new URL('/sign-in/tasks', req.url));
  }

  if (isProtectedRoute(req)) await auth.protect();
});
```

> **Core 2 ONLY (skip if current SDK):** `sessionStatus` is not available. Session tasks do not exist in Core 2.

[Docs](https://clerk.com/docs/reference/nextjs/clerk-middleware)
