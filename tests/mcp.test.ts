import { createServer, type IncomingMessage, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { GET, OPTIONS, POST } from '@/app/mcp/route'
import { getCatalog } from '@/lib/catalog/catalog'
import { SITE_ORIGIN } from '@/lib/env'
import { PROTOCOL_VERSIONS } from '@/lib/mcp/server'

/**
 * `/mcp` spoken to by the official MCP SDK client, over real HTTP: the route
 * handlers are mounted on a throwaway node server, so what passes here is what
 * Claude, ChatGPT or Cursor would see. Then the raw protocol edges the SDK
 * never exercises: notifications, batches, garbage.
 */

async function body(request: IncomingMessage): Promise<string> {
  const chunks: Array<Buffer> = []
  for await (const chunk of request) {
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
}

const HANDLERS: Record<
  string,
  (request: Request) => Response | Promise<Response>
> = { GET, POST, OPTIONS }

let server: Server
let endpoint: URL

beforeAll(async () => {
  server = createServer(async (incoming, outgoing) => {
    const method = incoming.method ?? 'GET'
    const text = method === 'POST' ? await body(incoming) : undefined
    const request = new Request(`http://localhost${incoming.url ?? '/'}`, {
      method,
      headers: incoming.headers as Record<string, string>,
      ...(text === undefined ? {} : { body: text }),
    })
    const handler: (request: Request) => Response | Promise<Response> =
      HANDLERS[method] ?? GET
    const response = await handler(request)
    outgoing.writeHead(response.status, Object.fromEntries(response.headers))
    outgoing.end(Buffer.from(await response.arrayBuffer()))
  })
  await new Promise<void>((resolve) => server.listen(0, resolve))
  const { port } = server.address() as AddressInfo
  endpoint = new URL(`http://127.0.0.1:${port}/mcp`)
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

async function rpc(
  payload: unknown,
  headers: Record<string, string> = {}
): Promise<Response> {
  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...headers,
    },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  })
}

async function errorCode(response: Response): Promise<number | undefined> {
  return ((await response.json()) as { error?: { code: number } }).error?.code
}

describe('/mcp with the MCP SDK client', () => {
  test('connects, lists the two read-only tools, searches and gets a file', async () => {
    const client = new Client({ name: 'test', version: '1.0.0' })
    await client.connect(new StreamableHTTPClientTransport(endpoint))
    try {
      expect(client.getServerVersion()?.name).toBe('growth.engineer')

      const { tools } = await client.listTools()
      expect(tools.map((tool) => tool.name).sort()).toEqual(['get', 'search'])
      for (const tool of tools) {
        expect(tool.annotations?.readOnlyHint).toBe(true)
      }

      const found = await client.callTool({
        name: 'search',
        arguments: { query: 'enrich contacts', type: 'tool', limit: 3 },
      })
      const results = (
        found.structuredContent as {
          results: Array<{ ref: string; url: string }>
        }
      ).results
      expect(results.length).toBeGreaterThan(0)
      expect(results.length).toBeLessThanOrEqual(3)
      expect(results.every((result) => result.ref.startsWith('tool:'))).toBe(
        true
      )
      expect(results[0]?.url.startsWith(`${SITE_ORIGIN}/tools/`)).toBe(true)

      const ref = results[0]?.ref ?? ''
      const file = await client.callTool({ name: 'get', arguments: { ref } })
      const [content] = file.content as Array<{ type: string; text: string }>
      expect(file.isError).toBeFalsy()
      expect(content?.text).toBe(getCatalog().documents.get(ref)?.markdown)
    } finally {
      await client.close()
    }
  })

  test('`get` takes a page URL or a .md path, and says so when nothing is there', async () => {
    const client = new Client({ name: 'test', version: '1.0.0' })
    await client.connect(new StreamableHTTPClientTransport(endpoint))
    try {
      const [workflow] = [...getCatalog().workflows.values()]
      const key = workflow?.key ?? ''
      const refs = [
        `${SITE_ORIGIN}/workflows/${key}`,
        `/workflows/${key}.md`,
        `workflow:${key}`,
      ]
      const files = await Promise.all(
        refs.map((ref) => client.callTool({ name: 'get', arguments: { ref } }))
      )
      for (const [index, file] of files.entries()) {
        expect(file.isError, refs[index]).toBeFalsy()
      }
      const missing = await client.callTool({
        name: 'get',
        arguments: { ref: 'workflow:no-such-workflow' },
      })
      expect(missing.isError).toBe(true)
      // Versions are gone: a pinned ref is not a ref.
      const pinned = await client.callTool({
        name: 'get',
        arguments: { ref: `workflow:${key}@1` },
      })
      expect(pinned.isError).toBe(true)
    } finally {
      await client.close()
    }
  })
})

describe('/mcp protocol edges', () => {
  test('answers the version asked for when it knows it, else its newest', async () => {
    const cases = [
      ['2025-03-26', '2025-03-26'],
      ['1999-01-01', PROTOCOL_VERSIONS[0]],
    ] as const
    const answers = await Promise.all(
      cases.map(async ([asked]) => {
        const response = await rpc({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: { protocolVersion: asked, capabilities: {} },
        })
        expect(response.status).toBe(200)
        const json = (await response.json()) as {
          result: { protocolVersion: string }
        }
        return json.result.protocolVersion
      })
    )
    expect(answers).toEqual(cases.map(([, expected]) => expected))
  })

  test('a notification gets 202 and no body', async () => {
    const response = await rpc({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    })
    expect(response.status).toBe(202)
    expect(await response.text()).toBe('')
  })

  test('a batch gets a batch, notifications left out', async () => {
    const response = await rpc([
      { jsonrpc: '2.0', id: 'a', method: 'ping' },
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      { jsonrpc: '2.0', id: 'b', method: 'nope' },
    ])
    const json = (await response.json()) as Array<{
      id: string
      error?: { code: number }
    }>
    expect(json.map((entry) => entry.id)).toEqual(['a', 'b'])
    expect(json[1]?.error?.code).toBe(-32_601)
  })

  test('garbage is a parse error; GET is 405; preflight is allowed', async () => {
    const garbage = await rpc('{not json')
    expect(garbage.status).toBe(400)
    expect(
      ((await garbage.json()) as { error: { code: number } }).error.code
    ).toBe(-32_700)

    const get = await fetch(endpoint)
    expect(get.status).toBe(405)

    const preflight = await fetch(endpoint, { method: 'OPTIONS' })
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe('*')
  })

  test('an unknown tool is invalid params', async () => {
    const response = await rpc({
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: { name: 'delete-everything', arguments: {} },
    })
    const json = (await response.json()) as { error: { code: number } }
    expect(json.error.code).toBe(-32_602)
  })

  test('an empty batch is an invalid request', async () => {
    const response = await rpc([])
    expect(response.status).toBe(400)
    expect(await errorCode(response)).toBe(-32_600)
  })

  test('a request id is a string or a number, never null', async () => {
    const response = await rpc({ jsonrpc: '2.0', id: null, method: 'ping' })
    expect(await errorCode(response)).toBe(-32_600)
  })

  test('a protocol version this server does not speak is refused', async () => {
    const unknown = await rpc(
      { jsonrpc: '2.0', id: 1, method: 'ping' },
      { 'MCP-Protocol-Version': '1999-01-01' }
    )
    expect(unknown.status).toBe(400)
    const known = await rpc(
      { jsonrpc: '2.0', id: 1, method: 'ping' },
      { 'MCP-Protocol-Version': PROTOCOL_VERSIONS[0] }
    )
    expect(known.status).toBe(200)
  })

  test('a malformed tools/call is invalid params; a bad argument is a tool error', async () => {
    const noName = await rpc({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { arguments: {} },
    })
    expect(await errorCode(noName)).toBe(-32_602)
    const listArguments = await rpc({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'search', arguments: [] },
    })
    expect(await errorCode(listArguments)).toBe(-32_602)
    const badLimit = await rpc({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'search', arguments: { limit: 0 } },
    })
    const json = (await badLimit.json()) as { result: { isError: boolean } }
    expect(json.result.isError).toBe(true)
  })

  test('tools/list: strict inputs, the vocabulary in the schema, a size budget', async () => {
    const response = await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
    const text = await response.text()
    const { result } = JSON.parse(text) as {
      result: {
        tools: Array<{
          name: string
          inputSchema: {
            additionalProperties?: boolean
            properties: Record<string, { items?: { enum?: Array<string> } }>
          }
          outputSchema: Record<string, unknown>
        }>
      }
    }
    const search = result.tools.find((tool) => tool.name === 'search')
    expect(search?.inputSchema.additionalProperties).toBe(false)
    expect(search?.inputSchema.properties.tags?.items?.enum).toEqual(
      [...getCatalog().tags.keys()].sort()
    )
    for (const tool of result.tools) {
      expect(tool.outputSchema, tool.name).toBeDefined()
    }
    // The list rides every session; the vocabulary must not bloat it.
    expect(text.length).toBeLessThan(12_000)
  })
})
