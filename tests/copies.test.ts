import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import { getCatalog } from '@/lib/catalog/catalog'

/**
 * The copy counter: a workflow's "Uses", and the Hot and Popular angles. The
 * store is Upstash Redis over REST; here a throwaway local server speaks the
 * same protocol, so the suite stays hermetic. Without a store the counter is
 * off — every count is `null` and the pages hide it — and that is the state
 * of every fresh clone.
 */

// Next's request-time APIs only work inside a render; here they are inert.
vi.mock('next/cache', () => ({ cacheLife: () => undefined }))
vi.mock('next/server', () => ({ connection: async () => undefined }))

const ENV_KEYS = [
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'KV_REST_API_READ_ONLY_TOKEN',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'VERCEL_ENV',
] as const
const saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]))

const TOKEN = 'write-token'
const READ_TOKEN = 'read-token'
const WORKFLOW = [...getCatalog().workflows.keys()][0] as string
const OTHER = [...getCatalog().workflows.keys()][1] as string

/** The fake store: every hash and string, and every command with its token. */
let hashes = new Map<string, Map<string, number>>()
let strings = new Map<string, string>()
let sent: Array<{ token: string; command: Array<string | number> }> = []
let isDown = false

const WRITES = new Set(['hincrby', 'expire', 'set'])

function run(token: string, command: Array<string | number>): unknown {
  sent.push({ token, command })
  const [name, key, ...args] = command
  const verb = String(name).toLowerCase()
  if (WRITES.has(verb) && token !== TOKEN) {
    throw new Error('NOPERM')
  }
  const hash = hashes.get(String(key)) ?? new Map<string, number>()
  if (verb === 'hgetall') {
    return [...hash].flatMap(([field, value]) => [field, String(value)])
  }
  if (verb === 'hincrby') {
    hashes.set(String(key), hash)
    const next = (hash.get(String(args[0])) ?? 0) + Number(args[1])
    hash.set(String(args[0]), next)
    return next
  }
  if (verb === 'expire') {
    return 1
  }
  if (verb === 'set') {
    const isOnlyNew = args.some((arg) => String(arg).toLowerCase() === 'nx')
    if (isOnlyNew && strings.has(String(key))) {
      return null
    }
    strings.set(String(key), String(args[0]))
    return 'OK'
  }
  throw new Error(`unsupported ${verb}`)
}

/** Upstash answers base64 strings when the client asks for them, as it does. */
function encode(value: unknown): unknown {
  if (typeof value === 'string') {
    return Buffer.from(value).toString('base64')
  }
  return Array.isArray(value) ? value.map(encode) : value
}

let server: Server
let storeUrl: string

beforeAll(async () => {
  server = createServer((request, response) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      const token = (request.headers.authorization ?? '').replace('Bearer ', '')
      if (isDown || ![TOKEN, READ_TOKEN].includes(token)) {
        response.writeHead(isDown ? 500 : 401).end('{"error":"no"}')
        return
      }
      const parsed = JSON.parse(body)
      try {
        const reply = request.url?.startsWith('/pipeline')
          ? parsed.map((command: Array<string>) => ({
              result: encode(run(token, command)),
            }))
          : { result: encode(run(token, parsed)) }
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(reply))
      } catch (error) {
        response.writeHead(400).end(JSON.stringify({ error: String(error) }))
      }
    })
  })
  await new Promise<void>((resolve) => server.listen(0, resolve))
  storeUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

beforeEach(() => {
  hashes = new Map()
  strings = new Map()
  sent = []
  isDown = false
  for (const key of ENV_KEYS) {
    delete process.env[key]
  }
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllEnvs()
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = saved[key]
    }
  }
})

function withStore({ readOnly = true } = {}) {
  process.env.KV_REST_API_URL = storeUrl
  process.env.KV_REST_API_TOKEN = TOKEN
  if (readOnly) {
    process.env.KV_REST_API_READ_ONLY_TOKEN = READ_TOKEN
  }
}

function day(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
}

function seed(key: string, counts: Record<string, number>) {
  hashes.set(key, new Map(Object.entries(counts)))
}

const VISITOR = { 'x-real-ip': '203.0.113.7' }

async function post(
  name: string,
  headers: Record<string, string> = VISITOR
): Promise<{ status: number; counted?: boolean }> {
  const { POST } = await import('@/app/api/workflows/[name]/copies/route')
  const response = await POST(
    new Request(`http://localhost/api/workflows/${name}/copies`, {
      method: 'POST',
      headers,
    }),
    { params: Promise.resolve({ name }) }
  )
  const body = response.headers.get('content-type')?.includes('json')
    ? ((await response.json()) as { counted: boolean })
    : {}
  return { status: response.status, ...body }
}

function total(key = WORKFLOW): number | undefined {
  return hashes.get('development:workflow:copies')?.get(key)
}

describe('the store', () => {
  test('is off when unset or blank', async () => {
    const { copyCounterEnv } = await import('@/lib/env')
    expect(copyCounterEnv()).toBeNull()
    process.env.KV_REST_API_URL = ''
    process.env.KV_REST_API_TOKEN = ''
    expect(copyCounterEnv()).toBeNull()
    process.env.KV_REST_API_URL = storeUrl
    expect(copyCounterEnv()).toBeNull()
  })

  test("takes Vercel's names and Upstash's own; reads with the read-only token", async () => {
    const { copyCounterEnv } = await import('@/lib/env')
    withStore()
    expect(copyCounterEnv()).toEqual({
      url: storeUrl,
      token: TOKEN,
      readToken: READ_TOKEN,
    })
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
    delete process.env.KV_REST_API_READ_ONLY_TOKEN
    process.env.UPSTASH_REDIS_REST_URL = storeUrl
    process.env.UPSTASH_REDIS_REST_TOKEN = TOKEN
    expect(copyCounterEnv()).toEqual({
      url: storeUrl,
      token: TOKEN,
      readToken: TOKEN,
    })
  })

  test('refuses a URL that is not one', async () => {
    const { copyCounterEnv } = await import('@/lib/env')
    process.env.KV_REST_API_URL = 'not a url'
    process.env.KV_REST_API_TOKEN = TOKEN
    expect(() => copyCounterEnv()).toThrow()
  })
})

describe('reading the stats', () => {
  test('is null with no store, so the pages hide every count', async () => {
    const { hasCopyCounter, loadCopyStats } = await import('@/lib/usage/copies')
    expect(hasCopyCounter()).toBe(false)
    expect(await loadCopyStats()).toBeNull()
    expect(sent).toEqual([])
  })

  test('totals all time, and this week and last from the day buckets', async () => {
    withStore()
    seed('development:workflow:copies', { [WORKFLOW]: 1234, [OTHER]: 5 })
    seed(`development:workflow:copies:${day(0)}`, { [WORKFLOW]: 3 })
    seed(`development:workflow:copies:${day(6)}`, { [WORKFLOW]: 4, [OTHER]: 1 })
    seed(`development:workflow:copies:${day(7)}`, { [WORKFLOW]: 10 })
    seed(`development:workflow:copies:${day(13)}`, { [OTHER]: 2 })
    // Older than two weeks: in neither window.
    seed(`development:workflow:copies:${day(14)}`, { [WORKFLOW]: 99 })
    const { loadCopyStats } = await import('@/lib/usage/copies')
    expect(await loadCopyStats()).toEqual({
      [WORKFLOW]: { total: 1234, week: 7, lastWeek: 10 },
      [OTHER]: { total: 5, week: 1, lastWeek: 2 },
    })
  })

  test('reads only with the read-only token, in one round trip', async () => {
    withStore()
    const { loadCopyStats } = await import('@/lib/usage/copies')
    await loadCopyStats()
    expect(sent.length).toBe(15)
    expect(new Set(sent.map(({ token }) => token))).toEqual(
      new Set([READ_TOKEN])
    )
  })

  test('is null when the store fails, never a made-up number', async () => {
    withStore()
    isDown = true
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { loadCopyStats } = await import('@/lib/usage/copies')
    expect(await loadCopyStats()).toBeNull()
    error.mockRestore()
  })
})

describe('counting a copy', () => {
  const headers = new Headers(VISITOR)

  test('claims the visitor for 24h, then adds to the total and today, with the write token', async () => {
    withStore()
    const { recordCopy } = await import('@/lib/usage/copies')
    expect(await recordCopy(WORKFLOW, headers)).toBe('counted')
    const [claim, ...writes] = sent.map(({ token, command }) => [
      token,
      ...command,
    ])
    expect(claim?.slice(0, 2)).toEqual([TOKEN, 'set'])
    expect(String(claim?.[2])).toMatch(
      new RegExp(`^development:workflow:copied:${WORKFLOW}:[0-9a-f]{32}$`)
    )
    expect(
      claim
        ?.slice(4)
        .map(String)
        .map((arg) => arg.toLowerCase())
    ).toEqual(expect.arrayContaining(['nx', 'ex', String(24 * 60 * 60)]))
    expect(writes).toEqual([
      [TOKEN, 'hincrby', 'development:workflow:copies', WORKFLOW, 1],
      [TOKEN, 'hincrby', `development:workflow:copies:${day(0)}`, WORKFLOW, 1],
      [
        TOKEN,
        'expire',
        `development:workflow:copies:${day(0)}`,
        60 * 24 * 60 * 60,
      ],
    ])
  })

  test('the same visitor again adds nothing', async () => {
    withStore()
    const { recordCopy } = await import('@/lib/usage/copies')
    // Twenty presses at once, as a spammed button sends them: one wins.
    const presses = await Promise.all(
      Array.from({ length: 20 }, () => recordCopy(WORKFLOW, headers))
    )
    expect(presses.filter((result) => result === 'counted')).toHaveLength(1)
    expect(await recordCopy(WORKFLOW, headers)).toBe('repeat')
    expect(total()).toBe(1)
    // Another workflow is another copy.
    expect(await recordCopy(OTHER, headers)).toBe('counted')
    expect(total(OTHER)).toBe(1)
  })

  test('never stores the address itself', async () => {
    withStore()
    const { recordCopy } = await import('@/lib/usage/copies')
    await recordCopy(WORKFLOW, headers)
    expect(JSON.stringify(sent)).not.toContain('203.0.113.7')
  })

  test('a preview never touches production keys', async () => {
    withStore()
    process.env.VERCEL_ENV = 'preview'
    vi.stubEnv('NODE_ENV', 'production')
    const { recordCopy } = await import('@/lib/usage/copies')
    await recordCopy(WORKFLOW, headers)
    const keys = sent.map(({ command }) => String(command[1]))
    expect(keys.every((key) => key.startsWith('preview:workflow:'))).toBe(true)
  })

  test('production owns the bare keys', async () => {
    withStore()
    process.env.VERCEL_ENV = 'production'
    vi.stubEnv('NODE_ENV', 'production')
    const { recordCopy } = await import('@/lib/usage/copies')
    await recordCopy(WORKFLOW, headers)
    expect(sent.map(({ command }) => String(command[1]))).toEqual([
      expect.stringMatching(/^workflow:copied:/),
      'workflow:copies',
      `workflow:copies:${day(0)}`,
      `workflow:copies:${day(0)}`,
    ])
  })
})

describe('who a visitor is', () => {
  test('an IPv4 address is itself; the first forwarded hop when there is no real IP', async () => {
    const { addressKey } = await import('@/lib/usage/visitor')
    expect(addressKey(new Headers({ 'x-real-ip': '203.0.113.7' }))).toBe(
      '203.0.113.7'
    )
    expect(
      addressKey(new Headers({ 'x-forwarded-for': '198.51.100.2, 10.0.0.1' }))
    ).toBe('198.51.100.2')
    expect(addressKey(new Headers())).toBe('unknown')
  })

  test('an IPv6 address is its /64, however it is written', async () => {
    const { addressKey } = await import('@/lib/usage/visitor')
    const prefix = (ip: string) => addressKey(new Headers({ 'x-real-ip': ip }))
    expect(prefix('2001:db8:abcd:12::1')).toBe('2001:db8:abcd:12')
    expect(prefix('2001:0db8:abcd:0012:ffff:1:2:3')).toBe('2001:db8:abcd:12')
    expect(prefix('2001:DB8::')).toBe('2001:db8:0:0')
    // Malformed is still a key, never a crash.
    expect(prefix('1:2:3:4:5:6:7:8:9::1')).toBe('1:2:3:4')
  })

  test('the id is opaque, and keyed by the secret', async () => {
    const { visitorId } = await import('@/lib/usage/visitor')
    const headers = new Headers({ 'x-real-ip': '203.0.113.7' })
    const id = visitorId(headers, 'one secret')
    expect(id).toMatch(/^[0-9a-f]{32}$/)
    expect(visitorId(headers, 'one secret')).toBe(id)
    expect(visitorId(headers, 'another secret')).not.toBe(id)
  })
})

describe('POST /api/workflows/<name>/copies', () => {
  test('counts a visitor once, however often the button is pressed', async () => {
    withStore()
    expect(await post(WORKFLOW)).toEqual({ status: 200, counted: true })
    expect(await post(WORKFLOW)).toEqual({ status: 200, counted: false })
    expect(await post(WORKFLOW)).toEqual({ status: 200, counted: false })
    expect(total()).toBe(1)
  })

  test('counts another visitor, but not a new address in the same IPv6 /64', async () => {
    withStore()
    await post(WORKFLOW, { 'x-real-ip': '2001:db8:1:2::a' })
    expect(await post(WORKFLOW, { 'x-real-ip': '2001:db8:1:2::b' })).toEqual({
      status: 200,
      counted: false,
    })
    expect(await post(WORKFLOW, { 'x-real-ip': '198.51.100.9' })).toEqual({
      status: 200,
      counted: true,
    })
    expect(total()).toBe(2)
  })

  test('refuses a request another site made', async () => {
    withStore()
    expect(
      await post(WORKFLOW, { ...VISITOR, 'Sec-Fetch-Site': 'cross-site' })
    ).toEqual({ status: 403 })
    expect(sent).toEqual([])
  })

  test('counts only a workflow that has a page', async () => {
    withStore()
    expect((await post('no-such-workflow')).status).toBe(404)
    expect((await post('Not A Key')).status).toBe(404)
    expect(sent).toEqual([])
  })

  test('says so when there is nowhere to count', async () => {
    expect((await post(WORKFLOW)).status).toBe(503)
  })
})
