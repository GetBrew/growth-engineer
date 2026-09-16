import { verifyWebhook } from '@clerk/nextjs/webhooks'
import type { NextRequest } from 'next/server'
import { api } from '@/convex/_generated/api'
import { systemMutation } from '@/lib/convex/gateway'

/**
 * Clerk -> Convex user mirror.
 *
 * THREE THINGS THIS ROUTE GETS RIGHT, each of which is a real incident when
 * skipped:
 *
 *   1. THE SIGNATURE IS VERIFIED FIRST. This endpoint is public (it must be —
 *      Clerk has no session), so the Svix signature is the only thing standing
 *      between a stranger and your user table. `verifyWebhook` reads the raw
 *      body itself; parsing before verifying breaks the check.
 *
 *   2. IT CALLS CONVEX AS A MACHINE. `systemMutation` carries the service
 *      token and NO acting user, because no person triggered this. The target
 *      is a `serviceMutation`, so a browser cannot reach it at all.
 *
 *   3. IT RETURNS 200 ON AN EVENT IT DOES NOT HANDLE. A 4xx makes Clerk retry
 *      forever on an event type you simply do not care about.
 */
export async function POST(request: NextRequest) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>
  try {
    event = await verifyWebhook(request)
  } catch {
    // Do not echo the reason: it tells an attacker how close they got.
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'user.created':
    case 'user.updated': {
      // The primary address, else any address, else none at all — Clerk sends
      // no email for a phone-only account, and `users.upsertFromClerk` treats
      // a blank one as "matches nobody" rather than as a key.
      const primaryEmail =
        event.data.email_addresses.find(
          (address) => address.id === event.data.primary_email_address_id
        ) ?? event.data.email_addresses[0]
      await systemMutation(api.users.upsertFromClerk, {
        clerkUserId: event.data.id,
        email: primaryEmail?.email_address ?? '',
        name:
          [event.data.first_name, event.data.last_name]
            .filter(Boolean)
            .join(' ') || undefined,
        imageUrl: event.data.image_url ?? undefined,
      })
      break
    }
    case 'user.deleted': {
      if (event.data.id) {
        await systemMutation(api.users.deleteFromClerk, {
          clerkUserId: event.data.id,
        })
      }
      break
    }
    default:
      // Unhandled event types are fine. Acknowledge them.
      break
  }

  return new Response(null, { status: 204 })
}
