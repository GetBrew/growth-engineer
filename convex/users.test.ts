import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

/**
 * Authorization tests for the one write path a browser could reach if the
 * tier builders were wrong. The negative cases are the point.
 *
 * A guard is not done until it has FAILED: swap `serviceMutation` for
 * `authenticatedMutation` in convex/users.ts and the forged-token test here
 * must go red.
 */

const modules = import.meta.glob('./**/*.*s')
const ALICE = { subject: 'user_alice', issuer: 'https://clerk.example.com' }

describe('users', () => {
  test('an anonymous caller cannot read a profile', async () => {
    const t = convexTest(schema, modules)
    await expect(t.query(api.users.current, {})).rejects.toThrow()
  })

  test('the mirror is unreachable from a browser: a forged service token is refused', async () => {
    const t = convexTest(schema, modules)
    await expect(
      t.mutation(api.users.upsertFromClerk, {
        serviceToken: 'not-the-real-token',
        clerkUserId: ALICE.subject,
        email: 'alice@example.com',
      })
    ).rejects.toThrow()
    // Even a signed-in user cannot write their own row directly.
    await expect(
      t.withIdentity(ALICE).mutation(api.users.upsertFromClerk, {
        serviceToken: 'still-not-it',
        clerkUserId: ALICE.subject,
        email: 'alice@example.com',
      })
    ).rejects.toThrow()
  })

  test('the real service token writes the mirror, and the person can then read it', async () => {
    const serviceToken = process.env.CONVEX_SERVICE_TOKEN ?? ''
    expect(
      serviceToken,
      'CONVEX_SERVICE_TOKEN must be set (see .env.test)'
    ).toBeTruthy()

    const t = convexTest(schema, modules)
    const alice = t.withIdentity(ALICE)
    expect(await alice.query(api.users.current, {})).toBeNull()

    await t.mutation(api.users.upsertFromClerk, {
      serviceToken,
      clerkUserId: ALICE.subject,
      email: 'alice@example.com',
      name: 'Alice',
    })
    const row = await alice.query(api.users.current, {})
    expect(row?.email).toBe('alice@example.com')
    expect(row?.role).toBe('member')

    // Upsert, not insert: the same person again updates in place.
    await t.mutation(api.users.upsertFromClerk, {
      serviceToken,
      clerkUserId: ALICE.subject,
      email: 'alice@example.com',
      name: 'Alice Doe',
    })
    expect((await alice.query(api.users.current, {}))?.name).toBe('Alice Doe')
    const rows = await t.run(
      async (ctx) => await ctx.db.query('users').take(10)
    )
    expect(rows).toHaveLength(1)
  })

  test('a blank email claims nobody: two accounts without one stay two rows', async () => {
    const serviceToken = process.env.CONVEX_SERVICE_TOKEN ?? ''
    const t = convexTest(schema, modules)
    // Clerk sends no email for a phone-only account. Matching on '' would
    // hand the second person the first person's row.
    await t.mutation(api.users.upsertFromClerk, {
      serviceToken,
      clerkUserId: 'user_phone_one',
      email: '',
    })
    await t.mutation(api.users.upsertFromClerk, {
      serviceToken,
      clerkUserId: 'user_phone_two',
      email: '',
    })
    const rows = await t.run(
      async (ctx) => await ctx.db.query('users').take(10)
    )
    expect(rows).toHaveLength(2)
    expect(rows.map((row) => row.clerkUserId).sort()).toEqual([
      'user_phone_one',
      'user_phone_two',
    ])
  })

  test('an email already bound to another account is never re-bound', async () => {
    const serviceToken = process.env.CONVEX_SERVICE_TOKEN ?? ''
    const t = convexTest(schema, modules)
    await t.mutation(api.users.upsertFromClerk, {
      serviceToken,
      clerkUserId: ALICE.subject,
      email: 'shared@example.com',
      name: 'Alice',
    })
    await t.mutation(api.users.upsertFromClerk, {
      serviceToken,
      clerkUserId: 'user_mallory',
      email: 'shared@example.com',
      name: 'Mallory',
    })
    const rows = await t.run(
      async (ctx) => await ctx.db.query('users').take(10)
    )
    expect(rows).toHaveLength(2)
    // Alice's row still belongs to Alice.
    expect(
      (await t.withIdentity(ALICE).query(api.users.current, {}))?.name
    ).toBe('Alice')
  })

  test('a row an admin created by email IS claimed on first sign-in', async () => {
    const serviceToken = process.env.CONVEX_SERVICE_TOKEN ?? ''
    const t = convexTest(schema, modules)
    await t.run(async (ctx) => {
      await ctx.db.insert('users', {
        email: 'alice@example.com',
        role: 'moderator',
      })
    })
    await t.mutation(api.users.upsertFromClerk, {
      serviceToken,
      clerkUserId: ALICE.subject,
      email: 'alice@example.com',
      name: 'Alice',
    })
    const rows = await t.run(
      async (ctx) => await ctx.db.query('users').take(10)
    )
    expect(rows).toHaveLength(1)
    // The role an admin set survives the claim.
    expect(
      (await t.withIdentity(ALICE).query(api.users.current, {}))?.role
    ).toBe('moderator')
  })

  test('deleting the account deletes the row', async () => {
    const serviceToken = process.env.CONVEX_SERVICE_TOKEN ?? ''
    const t = convexTest(schema, modules)
    await t.mutation(api.users.upsertFromClerk, {
      serviceToken,
      clerkUserId: ALICE.subject,
      email: 'alice@example.com',
    })
    await t.mutation(api.users.deleteFromClerk, {
      serviceToken,
      clerkUserId: ALICE.subject,
    })
    expect(await t.withIdentity(ALICE).query(api.users.current, {})).toBeNull()
  })
})
