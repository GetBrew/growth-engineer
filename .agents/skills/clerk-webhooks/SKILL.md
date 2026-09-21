---
name: clerk-webhooks
description: Clerk webhooks for real-time events and data syncing. Verify with verifyWebhook
  from the framework-specific package. Handle user, session, organization, billing, and
  payment events. Build event-driven features like database sync, notifications, and
  integrations.
allowed-tools: WebFetch
license: MIT
metadata:
  author: clerk
  version: 1.2.0
compatibility: Requires CLERK_WEBHOOK_SIGNING_SECRET (svix signing secret from Clerk dashboard)
---

# Webhooks

Output complete, working webhook handlers with `verifyWebhook(req)` verification in every handler.

## When to Use Webhooks

Webhooks are **asynchronous and eventually consistent**. Delivery is fast but not guaranteed to be immediate, and may occasionally fail (Svix retries on a fixed schedule). Use them for:

- Database sync (a separate users / orgs table that follows Clerk)
- Notifications (welcome emails, Slack pings, internal alerts)
- Integrations triggered by lifecycle events

Do NOT rely on webhook delivery as part of a synchronous flow such as onboarding ("user signs up, then we read X from our DB"). For data the user just created, read it from the [Clerk session token](https://clerk.com/docs/guides/sessions/session-tokens) or call the Backend API directly. Webhooks fill the gap when you need data about *other* users or events the session token doesn't carry.

## Verify Every Webhook

Use `verifyWebhook(req)` from the framework-specific package (`@clerk/nextjs/webhooks`, `@clerk/express/webhooks`, etc.). It reads `CLERK_WEBHOOK_SIGNING_SECRET` automatically and throws on bad signatures. Skipping verification, even for notification-only handlers, exposes the endpoint to spoofed events.

## Make the Webhook Route Public

Webhook routes must be excluded from Clerk middleware protection. Without this, Clerk returns 401.

```typescript
// proxy.ts (Next.js <=15: middleware.ts)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect()
})
```

## Complete Webhook Handler (Next.js App Router)

```typescript
// app/api/webhooks/route.ts
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  // ALWAYS verify - never skip, even for notification-only handlers
  let evt
  try {
    evt = await verifyWebhook(req) // uses CLERK_WEBHOOK_SIGNING_SECRET automatically
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Verification failed', { status: 400 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses[0]?.email_address
    const name = `${first_name ?? ''} ${last_name ?? ''}`.trim()
    await db.users.create({ data: { clerkId: id, email, name } })
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses[0]?.email_address
    await db.users.update({ where: { clerkId: id }, data: { email, first_name, last_name } })
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data
    await db.users.delete({ where: { clerkId: id } })
  }

  if (evt.type === 'organizationMembership.created') {
    const { organization, public_user_data, role } = evt.data
    const orgId = organization.id
    const userId = public_user_data.user_id
    await db.teamMembers.create({ data: { orgId, userId, role } })
  }

  if (evt.type === 'organizationMembership.deleted') {
    const { organization, public_user_data } = evt.data
    const orgId = organization.id
    const userId = public_user_data.user_id
    await db.teamMembers.delete({ where: { orgId_userId: { orgId, userId } } })
  }

  return new Response('OK', { status: 200 })
}
```

## Full Example: Welcome Email (Resend) + Slack Notification on user.created

Notification-only handlers still verify the signature. Same pattern as the database-sync handler:

```typescript
// app/api/webhooks/route.ts
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  // Step 1: ALWAYS verify the webhook signature - NEVER skip this
  let evt
  try {
    evt = await verifyWebhook(req) // uses CLERK_WEBHOOK_SIGNING_SECRET env var
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Verification failed', { status: 400 })
  }

  // Step 2: Listen for user.created event
  if (evt.type === 'user.created') {
    // Step 3: Extract user email and name from webhook payload
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses[0]?.email_address
    const name = `${first_name ?? ''} ${last_name ?? ''}`.trim()

    // Step 4: Call Resend API to send welcome email
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Welcome!',
      html: `<p>Hi ${name}, welcome to our app!</p>`,
    })

    // Step 5: Post notification to Slack channel
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `New user signed up: ${name} (${email})`,
      }),
    })
  }

  // Always return 200 to acknowledge receipt
  return new Response('OK', { status: 200 })
}
```

**Also include proxy.ts (Next.js <=15: middleware.ts) to make the route public:**
```typescript
// proxy.ts (Next.js <=15: middleware.ts)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)'])
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect()
})
```

## Full Example: Organization Membership Sync to Database

```typescript
// app/api/webhooks/route.ts
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db' // your database client

export async function POST(req: NextRequest) {
  // ALWAYS verify signature - never skip, even for simple handlers
  let evt
  try {
    evt = await verifyWebhook(req) // uses CLERK_WEBHOOK_SIGNING_SECRET env var
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Verification failed', { status: 400 })
  }

  if (evt.type === 'organization.created') {
    const { id, name } = evt.data
    await db.workspaces.create({
      data: { orgId: id, name, createdAt: new Date() },
    })
  }

  if (evt.type === 'organizationMembership.created') {
    // Extract organization ID, user ID, and role from payload
    const { organization, public_user_data, role } = evt.data
    const orgId = organization.id
    const userId = public_user_data.user_id

    // Add to team_members table
    await db.team_members.create({
      data: { orgId, userId, role },
    })

    // Create workspace record for new member
    await db.workspaces.create({
      data: { orgId, userId, createdAt: new Date() },
    })
  }

  if (evt.type === 'organizationMembership.deleted') {
    // Extract organization ID and user ID from payload
    const { organization, public_user_data } = evt.data
    const orgId = organization.id
    const userId = public_user_data.user_id

    // Remove from team_members table
    await db.team_members.delete({
      where: { orgId, userId },
    })

    // Remove workspace record
    await db.workspaces.deleteMany({
      where: { orgId, userId },
    })
  }

  // Return 200 status on success
  return new Response('OK', { status: 200 })
}
```

## Other Frameworks

For Express, Astro, Fastify, Nuxt, React Router, and TanStack Start, use the framework-specific `verifyWebhook` adapter. Each Clerk SDK package ships its own (`@clerk/express/webhooks`, `@clerk/astro/webhooks`, `@clerk/fastify/webhooks`, etc.).

See `references/frameworks.md` for full handler examples per framework.

## Type Narrowing for `evt.data`

`verifyWebhook` returns `WebhookEvent`, a discriminated union of all event types. Narrow with `evt.type` to get type-safe access to `evt.data`:

```typescript
const evt = await verifyWebhook(req)

if (evt.type === 'user.created') {
  // evt.data is now UserJSON, autocompletes id, email_addresses, etc.
  console.log(evt.data.id)
}
```

For manual typing of nested payloads, import the JSON types from your framework's webhook subpath: `DeletedObjectJSON`, `EmailJSON`, `OrganizationInvitationJSON`, `OrganizationJSON`, `OrganizationMembershipJSON`, `SessionJSON`, `SMSMessageJSON`, `UserJSON`.

## Payload Field Reference

### User events (`user.created`, `user.updated`, `user.deleted`)
```typescript
const {
  id,                  // Clerk user ID
  email_addresses,     // array; [0].email_address is primary email
  first_name,
  last_name,
  image_url,
  public_metadata,
} = evt.data
```

### Organization events (`organization.created`, `organization.updated`, `organization.deleted`)
```typescript
const {
  id,    // org ID
  name,  // org name
  slug,
} = evt.data
```

### Organization Membership events (`organizationMembership.created`, `organizationMembership.updated`, `organizationMembership.deleted`)
```typescript
const {
  organization,        // { id, name, ... }
  public_user_data,    // { user_id, first_name, last_name, ... }
  role,                // e.g. 'org:admin', 'org:member'
} = evt.data
// Access: organization.id, public_user_data.user_id, role
```

## Supported Events (Full Catalog)

**User**: `user.created` `user.updated` `user.deleted`

**Session**: `session.created` `session.ended` `session.removed` `session.revoked`

**Organization**: `organization.created` `organization.updated` `organization.deleted`

**Organization Membership**: `organizationMembership.created` `organizationMembership.updated` `organizationMembership.deleted`

**Organization Domain**: `organizationDomain.created` `organizationDomain.updated` `organizationDomain.deleted`

**Organization Invitation**: `organizationInvitation.accepted` `organizationInvitation.created` `organizationInvitation.revoked`

**Communication**: `email.created` `sms.created`

**Waitlist**: `waitlistEntry.created` `waitlistEntry.updated`

**Permission**: `permission.created` `permission.updated` `permission.deleted`

**Role**: `role.created` `role.updated` `role.deleted`

**Subscription**: `subscription.created` `subscription.updated` `subscription.active` `subscription.pastDue`

**Subscription Item**: `subscriptionItem.created` `subscriptionItem.active` `subscriptionItem.updated` `subscriptionItem.canceled` `subscriptionItem.upcoming` `subscriptionItem.ended` `subscriptionItem.abandoned` `subscriptionItem.incomplete` `subscriptionItem.pastDue` `subscriptionItem.freeTrialEnding`

**Payment**: `paymentAttempt.created` `paymentAttempt.updated`

## Webhook Reliability

**Retries**: Svix retries failed webhooks on a set schedule (see [Svix Retry Schedule](https://docs.svix.com/retries)). Return 2xx to succeed, 4xx/5xx to retry. Use the `svix-id` header as an idempotency key to deduplicate retried events.

**Replay**: Failed webhooks can be replayed from Dashboard.

## Common Pitfalls

| Symptom | Cause | Fix |
|---------|-------|-----|
| Verification fails (Next.js) | Wrong import or usage | Use `@clerk/nextjs/webhooks`, pass `req` directly |
| Verification fails (Express) | Using `express.json()` | Use `express.raw({ type: 'application/json' })` for webhook route |
| Route not found (404) | Wrong path | Use `/api/webhooks` or preserve existing path |
| Not authorized (401) | Route is protected by middleware | Make route public in `clerkMiddleware()` |
| No data in DB | Async job pending | Wait/check logs |
| Duplicate entries | Only handling `user.created` | Also handle `user.updated` |
| Timeouts | Handler too slow | Queue async work, return 200 first |

## Testing & Deployment

**Local**: Use the Clerk CLI's first-party tunnel — no auth or linked project needed:

```sh
clerk webhooks listen --token "$(clerk webhooks token)" --forward-to http://localhost:3000/api/webhooks
```

Add the printed relay URL (`https://webhooks.clerk.com/in/c_.../`) as a webhook endpoint in the Dashboard — events don't flow until you do. `svix-*` headers are preserved, so `verifyWebhook()` works against that endpoint's signing secret as usual. Flags, offline signature checks (`clerk webhooks verify`), and agent-mode behavior are in the `clerk-cli` skill. Without the CLI, tunnel `localhost:3000` yourself (`ngrok`, `localtunnel`, `Cloudflare Tunnel`) and add the public URL to the Dashboard endpoint.

**Production**: Update webhook endpoint URL to production domain. Copy `CLERK_WEBHOOK_SIGNING_SECRET` to production env vars.

## References

| Reference | Description |
|-----------|-------------|
| `references/frameworks.md` | Webhook handler examples for Express, Astro, Fastify, Nuxt, React Router, TanStack Start |

## See Also

- `clerk-cli` - `clerk webhooks listen`/`verify` for local webhook testing
- `clerk-setup` - Initial Clerk install
- `clerk-orgs` - Org membership events
- `clerk-billing` - Subscription, subscription item, and payment attempt events
- `clerk-backend-api` - Sync via direct API calls