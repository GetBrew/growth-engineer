import 'server-only'

import { getCatalog } from '@/lib/catalog/catalog'
import { SITE } from '@/lib/catalog/definitions'
import {
  ENTITY_TYPES,
  type EntityType,
  filePathToRef,
  formatRef,
  parseRef,
  type Ref,
  refToFilePath,
} from '@/lib/catalog/keys'
import { paletteItems } from '@/lib/catalog/lists'
import { searchPaletteItems } from '@/lib/catalog/search'

/**
 * The catalog over MCP: a read-only, stateless server with two tools —
 * `search` finds files, `get` returns one — over the Streamable HTTP
 * transport (app/mcp/route.ts carries the HTTP; this module is the JSON-RPC).
 * Every answer comes from the same in-memory catalog the pages and the `.md`
 * URLs read, so an agent connected here sees exactly what the site shows.
 *
 * No sessions, no auth, no side effects: the files are public, and nothing a
 * client sends can change anything.
 */

type JsonRpcId = string | number | null
type JsonRpcRequest = {
  jsonrpc: '2.0'
  id?: JsonRpcId
  method: string
  params?: Record<string, unknown>
}
export type JsonRpcResponse =
  | { jsonrpc: '2.0'; id: JsonRpcId; result: unknown }
  | {
      jsonrpc: '2.0'
      id: JsonRpcId
      error: { code: number; message: string }
    }

/** Newest first: the one a client that asks for something else is offered. */
export const PROTOCOL_VERSIONS = [
  '2025-11-25',
  '2025-06-18',
  '2025-03-26',
  '2024-11-05',
] as const

export const ERROR = {
  parse: -32_700,
  invalidRequest: -32_600,
  methodNotFound: -32_601,
  invalidParams: -32_602,
} as const

const SEARCH_LIMIT = { default: 10, max: 50 }
const ABSOLUTE_URL = /^https?:\/\//

const TOOLS = [
  {
    name: 'search',
    title: 'Search the catalog',
    description:
      'Find companies, tools and workflows on growth.engineer by words (e.g. "enrich contacts", "clay", "outbound"). Returns each match with its ref, a one-line summary and the URL of its markdown file. Pass a ref to `get` to read the file.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Words to match against names, summaries and tags.',
        },
        type: {
          type: 'string',
          enum: [...ENTITY_TYPES],
          description: 'Only this kind of entry.',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: SEARCH_LIMIT.max,
          description: `At most this many results (default ${SEARCH_LIMIT.default}).`,
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get',
    title: 'Get a file',
    description:
      'Return one markdown file from growth.engineer: a tool or workflow file has everything an agent needs to run it — setup for every tool, the inputs to ask for, the steps and the rules. Accepts a ref like `workflow:funding-signal-outbound`, `tool:clay/enrich-contacts` or `company:clay`, or the URL of the page or its `.md` file.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: {
          type: 'string',
          description:
            'A ref from `search` (`tool:clay/enrich-contacts`), or a page or .md URL on the site.',
        },
      },
      required: ['ref'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
] as const

const INSTRUCTIONS =
  'growth.engineer is a catalog of go-to-market tools and workflows. Use `search` to find a workflow or tool for the job, then `get` its file and follow it: the file names every tool, how to set it up, the inputs to ask the user for, the steps and the rules.'

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>
  structuredContent?: Record<string, unknown>
  isError?: boolean
}

function toolError(text: string): ToolResult {
  return { content: [{ type: 'text', text }], isError: true }
}

/** A ref, a page path or URL, or a `.md` path or URL → a ref, or null. */
function refFrom(input: string, origin: string): Ref | null {
  const value = input.trim()
  const direct = parseRef(value)
  if (direct) {
    return direct
  }
  let path = value
  if (ABSOLUTE_URL.test(value)) {
    try {
      path = new URL(value).pathname
    } catch {
      return null
    }
  } else if (value.startsWith(origin)) {
    path = value.slice(origin.length)
  }
  if (!path.startsWith('/')) {
    return null
  }
  return filePathToRef(path.endsWith('.md') ? path : `${path}.md`)
}

function search(args: Record<string, unknown>, origin: string): ToolResult {
  const query = typeof args.query === 'string' ? args.query : ''
  const type =
    typeof args.type === 'string' &&
    (ENTITY_TYPES as ReadonlyArray<string>).includes(args.type)
      ? (args.type as EntityType)
      : undefined
  const requested = typeof args.limit === 'number' ? args.limit : Number.NaN
  const limit = Number.isInteger(requested)
    ? Math.min(Math.max(requested, 1), SEARCH_LIMIT.max)
    : SEARCH_LIMIT.default
  const items = paletteItems(getCatalog()).filter(
    (item) => type === undefined || item.kind === type
  )
  const results = searchPaletteItems(items, { q: query, limit }).map(
    (item) => ({
      ref: formatRef(item.kind, item.key),
      type: item.kind,
      title: item.title,
      summary: item.subtitle,
      url: `${origin}${refToFilePath({ type: item.kind, key: item.key })}`,
    })
  )
  const text =
    results.length === 0
      ? `No matches for "${query}". Try fewer or broader words.`
      : results
          .map(
            (result) =>
              `- ${result.ref} — ${result.title}: ${result.summary}\n  ${result.url}`
          )
          .join('\n')
  return { content: [{ type: 'text', text }], structuredContent: { results } }
}

function get(args: Record<string, unknown>, origin: string): ToolResult {
  const input = typeof args.ref === 'string' ? args.ref : ''
  const ref = refFrom(input, origin)
  if (!ref) {
    return toolError(
      `"${input}" is not a ref. Use one from search, like tool:clay/enrich-contacts or workflow:funding-signal-outbound.`
    )
  }
  const catalog = getCatalog()
  const current = catalog.aliases.get(formatRef(ref.type, ref.key)) ?? ref.key
  const document = catalog.documents.get(formatRef(ref.type, current))
  if (!document) {
    return toolError(
      `Nothing in the catalog at ${formatRef(ref.type, ref.key)}. Search for it instead.`
    )
  }
  return { content: [{ type: 'text', text: document.markdown }] }
}

function callTool(
  params: Record<string, unknown>,
  origin: string
): ToolResult | null {
  const args =
    params.arguments && typeof params.arguments === 'object'
      ? (params.arguments as Record<string, unknown>)
      : {}
  switch (params.name) {
    case 'search':
      return search(args, origin)
    case 'get':
      return get(args, origin)
    default:
      return null
  }
}

function isRequest(message: unknown): message is JsonRpcRequest {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { jsonrpc?: unknown }).jsonrpc === '2.0' &&
    typeof (message as { method?: unknown }).method === 'string'
  )
}

function idOf(message: unknown): JsonRpcId {
  const id = (message as { id?: unknown } | null)?.id
  return typeof id === 'string' || typeof id === 'number' ? id : null
}

function failure(
  id: JsonRpcId,
  code: number,
  message: string
): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message } }
}

/**
 * One JSON-RPC message → its response, or null for a notification or a
 * client's response (neither gets one back).
 */
export function handleMessage(
  message: unknown,
  origin: string
): JsonRpcResponse | null {
  if (!isRequest(message)) {
    // A client's reply to a server request has no method; we never send any.
    const isReply =
      typeof message === 'object' &&
      message !== null &&
      ('result' in message || 'error' in message)
    return isReply
      ? null
      : failure(idOf(message), ERROR.invalidRequest, 'Not a JSON-RPC request')
  }
  if (message.id === undefined || message.id === null) {
    return null
  }
  const { id } = message
  const params = message.params ?? {}
  switch (message.method) {
    case 'initialize': {
      const requested = params.protocolVersion
      const protocolVersion = (
        PROTOCOL_VERSIONS as ReadonlyArray<unknown>
      ).includes(requested)
        ? requested
        : PROTOCOL_VERSIONS[0]
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: {
            name: SITE.name,
            title: SITE.name,
            version: '1.0.0',
            websiteUrl: origin,
          },
          instructions: INSTRUCTIONS,
        },
      }
    }
    case 'ping':
      return { jsonrpc: '2.0', id, result: {} }
    case 'tools/list':
      return { jsonrpc: '2.0', id, result: { tools: TOOLS } }
    case 'tools/call': {
      const result = callTool(params, origin)
      return result
        ? { jsonrpc: '2.0', id, result }
        : failure(
            id,
            ERROR.invalidParams,
            `Unknown tool: ${String(params.name)}`
          )
    }
    default:
      return failure(
        id,
        ERROR.methodNotFound,
        `Method not found: ${message.method}`
      )
  }
}
