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
 * The copy counter: a workflow page's "Uses". The store is Upstash Redis over
 * REST; here a throwaway local server speaks the same protocol, so the suite
 * stays hermetic. Without a store the counter is off — the count is `null`
 * and the page hides it — and that is the state of every fresh clone.
 */

// `cacheLife` only works inside Next's `'use cache'`; the directive is inert here.
vi.mock('next/cache', () => ({ cacheLife: () => undefined }))

const ENV_KEYS = [
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
] as const
const saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]))

const TOKEN = 'test-token'
const COPIES = 'workflow:copies'
const WORKFLOW = [...getCatalog().workflows.keys()][0] as string

/** The hash the fake store holds, and every command it was sent. */
let hash = new Map<string, number>()
let commands: Array<Array<string | number>> = []
let isDown = false

function run([name, ...args]: Array<string | number>): unknown {
  commands.push([name as string, ...args])
  if (String(name).toLowerCase() === 'hgetall' && args[0] === COPIES) {
    return [...hash].flatMap(([field, value]) => [field, String(value)])
  }
  if (String(name).toLowerCase() === 'hincrby' && args[0] === COPIES) {
    const next = (hash.get(String(args[1])) ?? 0) + Number(args[2])
    hash.set(String(args[1]), next)
    return next
  }
  throw new Error(`unsupported ${String(name)}`)
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
      if (isDown || request.headers.authorization !== `Bearer ${TOKEN}`) {
        response.writeHead(isDown ? 500 : 401).end('{"error":"no"}')
        return
      }
      const parsed = JSON.parse(body)
      const reply = request.url?.startsWith('/pipeline')
        ? parsed.map((command: Array<string>) => ({
            result: encode(run(command)),
          }))
        : { result: encode(run(parsed)) }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(reply))
    })
  })
  await new Promise<void>((resolve) => server.listen(0, resolve))
  storeUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

beforeEach(() => {
  hash = new Map()
  commands = []
  isDown = false
  for (const key of ENV_KEYS) {
    delete process.env[key]
  }
  vi.resetModules()
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = saved[key]
    }
  }
})

function withStore() {
  process.env.KV_REST_API_URL = storeUrl
  process.env.KV_REST_API_TOKEN = TOKEN
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

  test("takes Vercel's names and Upstash's own", async () => {
    const { copyCounterEnv } = await import('@/lib/env')
    withStore()
    expect(copyCounterEnv()).toEqual({ url: storeUrl, token: TOKEN })
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
    process.env.UPSTASH_REDIS_REST_URL = storeUrl
    process.env.UPSTASH_REDIS_REST_TOKEN = TOKEN
    expect(copyCounterEnv()).toEqual({ url: storeUrl, token: TOKEN })
  })

  test('refuses a URL that is not one', async () => {
    const { copyCounterEnv } = await import('@/lib/env')
    process.env.KV_REST_API_URL = 'not a url'
    process.env.KV_REST_API_TOKEN = TOKEN
    expect(() => copyCounterEnv()).toThrow()
  })
})

describe('reading a count', () => {
  test('is null with no store, so the page hides it', async () => {
    const { loadCopyCount } = await import('@/lib/usage/copies')
    expect(await loadCopyCount(WORKFLOW)).toBeNull()
  })

  test('is the stored count, and 0 for a workflow never copied', async () => {
    withStore()
    hash.set(WORKFLOW, 1234)
    const { loadCopyCount } = await import('@/lib/usage/copies')
    expect(await loadCopyCount(WORKFLOW)).toBe(1234)
    expect(await loadCopyCount('never-copied')).toBe(0)
  })

  test('is null when the store fails, never a made-up number', async () => {
    withStore()
    isDown = true
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { loadCopyCount } = await import('@/lib/usage/copies')
    expect(await loadCopyCount(WORKFLOW)).toBeNull()
    error.mockRestore()
  })
})

describe('POST /api/workflows/<name>/copies', () => {
  test('counts one copy of a workflow', async () => {
    withStore()
    expect(await post(WORKFLOW, { 'Sec-Fetch-Site': 'same-origin' })).toBe(204)
    expect(await post(WORKFLOW)).toBe(204)
    expect(hash.get(WORKFLOW)).toBe(2)
  })

  test('refuses a request another site made', async () => {
    withStore()
    expect(await post(WORKFLOW, { 'Sec-Fetch-Site': 'cross-site' })).toBe(403)
    expect(commands).toEqual([])
  })

  test('counts only a workflow that has a page', async () => {
    withStore()
    expect(await post('no-such-workflow')).toBe(404)
    expect(await post('Not A Key')).toBe(404)
    expect(commands).toEqual([])
  })

  test('says so when there is nowhere to count', async () => {
    expect(await post(WORKFLOW)).toBe(503)
  })
})
