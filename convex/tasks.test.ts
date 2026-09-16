import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

/**
 * Authorization tests, not feature tests.
 *
 * The happy path is what you will notice broken in five seconds of clicking.
 * THE NEGATIVE CASES ARE THE POINT: an anonymous caller refused, and one
 * user unable to touch another's row. Those are the two failures that ship
 * quietly, work perfectly in every demo, and are found by someone else.
 *
 * A guard is not done until it has FAILED: delete the ownership check in
 * `tasks.setCompleted` and the third test here must go red. If it does not,
 * the test is asserting nothing.
 */

// `import.meta.glob` must be passed in from a file beside convex/ — this is
// why Convex function tests live here rather than under tests/.
const modules = import.meta.glob('./**/*.*s')

const ALICE = { subject: 'user_alice', issuer: 'https://clerk.example.com' }
const BOB = { subject: 'user_bob', issuer: 'https://clerk.example.com' }

describe('tasks authorization', () => {
  test('an anonymous caller cannot list tasks', async () => {
    const t = convexTest(schema, modules)
    await expect(t.query(api.tasks.list, {})).rejects.toThrow()
  })

  test('a signed-in user sees only their own tasks', async () => {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(ALICE)
    const bob = t.withIdentity(BOB)

    await alice.mutation(api.tasks.create, { title: "alice's task" })
    await bob.mutation(api.tasks.create, { title: "bob's task" })

    const aliceTasks = await alice.query(api.tasks.list, {})
    expect(aliceTasks).toHaveLength(1)
    expect(aliceTasks[0]?.title).toBe("alice's task")
  })

  test("a user cannot complete another user's task", async () => {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(ALICE)
    const bob = t.withIdentity(BOB)

    const taskId = await alice.mutation(api.tasks.create, { title: 'private' })

    await expect(
      bob.mutation(api.tasks.setCompleted, { taskId, isCompleted: true })
    ).rejects.toThrow()

    const [task] = await alice.query(api.tasks.list, {})
    expect(task?.isCompleted).toBe(false)
  })

  test('a forged service token buys nothing', async () => {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(ALICE)
    const taskId = await alice.mutation(api.tasks.create, { title: 'private' })

    await expect(
      t.mutation(api.tasks.setCompleted, {
        taskId,
        isCompleted: true,
        serviceToken: 'not-the-real-token',
        actingUserId: ALICE.subject,
      })
    ).rejects.toThrow()
  })

  test('the real service token acts as the user it names', async () => {
    // The positive half, and the reason the negative test above means
    // anything: with NO token configured every token is refused, so a suite
    // that only asserts refusal passes against a backend that trusts nobody.
    // This is also what makes `.env.test` load-bearing rather than decorative.
    const serviceToken = process.env.CONVEX_SERVICE_TOKEN
    expect(
      serviceToken,
      'CONVEX_SERVICE_TOKEN must be set (see .env.test) or this test proves nothing.'
    ).toBeTruthy()

    const t = convexTest(schema, modules)
    const alice = t.withIdentity(ALICE)
    const taskId = await alice.mutation(api.tasks.create, { title: 'server' })

    await t.mutation(api.tasks.setCompleted, {
      taskId,
      isCompleted: true,
      serviceToken,
      actingUserId: ALICE.subject,
    })

    const [task] = await alice.query(api.tasks.list, {})
    expect(task?.isCompleted).toBe(true)
  })

  test('a service token still cannot act across users', async () => {
    // Transport trust is not authority over a person: the token proves the
    // call came from our own server, and the ownership check on the row still
    // decides what the named user may touch.
    const serviceToken = process.env.CONVEX_SERVICE_TOKEN
    const t = convexTest(schema, modules)
    const alice = t.withIdentity(ALICE)
    const taskId = await alice.mutation(api.tasks.create, { title: 'private' })

    await expect(
      t.mutation(api.tasks.setCompleted, {
        taskId,
        isCompleted: true,
        serviceToken,
        actingUserId: BOB.subject,
      })
    ).rejects.toThrow()
  })
})
