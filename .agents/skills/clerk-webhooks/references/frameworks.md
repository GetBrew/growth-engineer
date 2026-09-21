# Framework-Specific Webhook Handlers

Each Clerk SDK package ships its own `verifyWebhook` adapter that reads the framework's native request type and uses `CLERK_WEBHOOK_SIGNING_SECRET` automatically. Use the framework-specific import; do not roll your own with raw `svix`.

Same `WebhookEvent` payload shape across all frameworks. See SKILL.md for payload field reference and the full event catalog.

## Express

```typescript
import { verifyWebhook } from '@clerk/express/webhooks'
import express from 'express'

const app = express()

// Use express.raw() not express.json() for the webhook route -
// signature verification requires the raw body bytes.
app.post('/api/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const evt = await verifyWebhook(req)

    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data
      const email = email_addresses[0]?.email_address
      console.log(`New user: ${first_name} ${last_name} (${email})`)
    }

    return res.send('Webhook received')
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return res.status(400).send('Error verifying webhook')
  }
})
```

## Astro

```typescript
// src/pages/api/webhooks.ts
import { verifyWebhook } from '@clerk/astro/webhooks'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const evt = await verifyWebhook(request, {
      signingSecret: import.meta.env.CLERK_WEBHOOK_SIGNING_SECRET,
    })

    if (evt.type === 'user.created') {
      const { id, email_addresses } = evt.data
      const email = email_addresses[0]?.email_address
      console.log(`New user: ${id} (${email})`)
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}
```

Astro requires explicit `signingSecret` since `import.meta.env` is not auto-read.

## Fastify

```typescript
import { verifyWebhook } from '@clerk/fastify/webhooks'
import Fastify from 'fastify'

const fastify = Fastify()

fastify.post('/api/webhooks', async (request, reply) => {
  try {
    const evt = await verifyWebhook(request)

    if (evt.type === 'user.created') {
      const { id } = evt.data
      console.log(`New user: ${id}`)
    }

    return 'Webhook received'
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return reply.code(400).send('Error verifying webhook')
  }
})
```

## Nuxt

```typescript
// server/api/webhooks.post.ts
import { verifyWebhook } from '@clerk/nuxt/webhooks'

export default defineEventHandler(async (event) => {
  try {
    const evt = await verifyWebhook(event)

    if (evt.type === 'user.created') {
      const { id } = evt.data
      console.log(`New user: ${id}`)
    }

    return 'Webhook received'
  } catch (err) {
    console.error('Error verifying webhook:', err)
    setResponseStatus(event, 400)
    return 'Error verifying webhook'
  }
})
```

Prefix the env var with `NUXT_` (i.e. `NUXT_CLERK_WEBHOOK_SIGNING_SECRET`) per Nuxt runtime config rules.

When tunneling via ngrok in dev, allow the host in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  vite: {
    server: {
      allowedHosts: ['fawn-two-nominally.ngrok-free.app'],
    },
  },
})
```

## React Router

```typescript
// app/routes/webhooks.ts
import { verifyWebhook } from '@clerk/react-router/webhooks'
import type { Route } from './+types/webhooks'

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const evt = await verifyWebhook(request)

    if (evt.type === 'user.created') {
      const { id } = evt.data
      console.log(`New user: ${id}`)
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}
```

Register the route in `router.ts`:

```typescript
import { type RouteConfig, route, index } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('api/webhooks', 'routes/webhooks.ts'),
] satisfies RouteConfig
```

When tunneling via ngrok in dev, allow the host in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    allowedHosts: ['fawn-two-nominally.ngrok-free.app'],
  },
})
```

## TanStack Start

```typescript
// app/routes/api/webhooks.ts
import { verifyWebhook } from '@clerk/tanstack-react-start/webhooks'
import { createServerFileRoute } from '@tanstack/react-start/server'

export const ServerRoute = createServerFileRoute().methods({
  POST: async ({ request }) => {
    try {
      const evt = await verifyWebhook(request)

      if (evt.type === 'user.created') {
        const { id } = evt.data
        console.log(`New user: ${id}`)
      }

      return new Response('Webhook received', { status: 200 })
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return new Response('Error verifying webhook', { status: 400 })
    }
  },
})
```

When tunneling via ngrok in dev, allow the host in `app.config.ts`:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: ['fawn-two-nominally.ngrok-free.app'],
  },
})
```

## Common Patterns Across Frameworks

- All `verifyWebhook` adapters return the same `WebhookEvent` discriminated union, so handler logic (`if (evt.type === ...)`) is identical.
- All adapters read `CLERK_WEBHOOK_SIGNING_SECRET` automatically except Astro (pass `signingSecret` option).
- All adapters require a public webhook route, exclude `/api/webhooks(.*)` from middleware protection.
- Vite-based frameworks (Nuxt, React Router, TanStack Start) need `allowedHosts` configured when tunneling localhost via ngrok in development.
- Express specifically needs `express.raw({ type: 'application/json' })` for the webhook route, raw body bytes are required for signature verification.
