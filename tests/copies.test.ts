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

/** The fake store: every hash, and every command with the token it came with. */
let hashes = new Map<string, Map<string, number>>()
let sent: Array<{ token: string; command: Array<string | number> }> = []
let isDown = false

const WRITES = new Set(['hincrby', 'expire'])

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

async function post(
  name: string,
  headers: Record<string, string> = {}
): Promise<number> {
  const { POST } = await import('@/app/api/workflows/[name]/copies/route')
  const response = await POST(
    new Request(`http://localhost/api/workflows/${name}/copies`, {
      method: 'POST',
      headers,
    }),
    { params: Promise.resolve({ name }) }
  )
  return response.status
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
  test('adds to the total and to today, which expires, with the write token', async () => {
    withStore()
    const { recordCopy } = await import('@/lib/usage/copies')
    expect(await recordCopy(WORKFLOW)).toBe(true)
    expect(sent.map(({ token, command }) => [token, ...command])).toEqual([
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

  test('a preview never touches production keys', async () => {
    withStore()
    process.env.VERCEL_ENV = 'preview'
    vi.stubEnv('NODE_ENV', 'production')
    const { recordCopy } = await import('@/lib/usage/copies')
    await recordCopy(WORKFLOW)
    const keys = sent.map(({ command }) => String(command[1]))
    expect(keys.every((key) => key.startsWith('preview:workflow:'))).toBe(true)
  })

  test('production owns the bare keys', async () => {
    withStore()
    process.env.VERCEL_ENV = 'production'
    vi.stubEnv('NODE_ENV', 'production')
    const { recordCopy } = await import('@/lib/usage/copies')
    await recordCopy(WORKFLOW)
    expect(sent[0]?.command[1]).toBe('workflow:copies')
  })
})

describe('POST /api/workflows/<name>/copies', () => {
  test('counts one copy of a workflow', async () => {
    withStore()
    expect(await post(WORKFLOW, { 'Sec-Fetch-Site': 'same-origin' })).toBe(204)
    expect(await post(WORKFLOW)).toBe(204)
    expect(hashes.get('development:workflow:copies')?.get(WORKFLOW)).toBe(2)
  })

  test('refuses a request another site made', async () => {
    withStore()
    expect(await post(WORKFLOW, { 'Sec-Fetch-Site': 'cross-site' })).toBe(403)
    expect(sent).toEqual([])
  })

  test('counts only a workflow that has a page', async () => {
    withStore()
    expect(await post('no-such-workflow')).toBe(404)
    expect(await post('Not A Key')).toBe(404)
    expect(sent).toEqual([])
  })

  test('says so when there is nowhere to count', async () => {
    expect(await post(WORKFLOW)).toBe(503)
  })
})
