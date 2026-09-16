/**
 * Convex reads this at deploy time to learn which JWT issuers to accept.
 * Without it, `ctx.auth.getUserIdentity()` returns `null` FOREVER — even with
 * a perfectly valid Clerk session in the browser — and every guarded function
 * refuses. It is the single most common "auth is broken and nothing is
 * logged" cause in a Convex + Clerk app.
 *
 * `domain` is the Clerk FRONTEND API URL for the deployment. It is encoded in
 * your publishable key: drop the `pk_test_` / `pk_live_` prefix, base64-decode
 * the rest, strip the trailing `$`. It lives in a Convex env var so dev,
 * preview and production each carry their own issuer without editing code:
 *
 *     npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your>.clerk.accounts.dev
 *
 * `applicationID` is the Clerk JWT TEMPLATE NAME, and it must match the `aud`
 * claim in that template. The client asks for this template by name
 * (components/convex-client-provider.tsx), so the Clerk dashboard must contain
 * a template literally called `convex`:
 *
 *     Clerk -> JWT Templates -> New template -> Name: convex
 *     {
 *       "aud": "convex",
 *       "orgId": "{{org.id}}",
 *       "orgRole": "{{org.role}}"
 *     }
 *
 * AUTHORIZATION CLAIMS ONLY. `orgId` / `orgRole` are what every org-scoped
 * guard reads; a template missing them does not error, it silently authorizes
 * nobody. Display data (name, email, avatar) belongs in the `users` mirror the
 * Clerk webhook writes, not in a token every request carries.
 */
const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
}

export default authConfig
