import { SITE } from '@/lib/catalog/definitions'
import type { Catalog } from '@/lib/content/build-catalog'
import { instructions, registry } from './tools'

/**
 * The catalog over MCP: a read-only, stateless server with two tools —
 * `search` and `get` (./tools.ts) — over the Streamable HTTP transport
 * (app/mcp/route.ts carries the HTTP; this module is the JSON-RPC). Every
 * answer comes from the same in-memory catalog the pages and the `.md` URLs
 * read, passed in, so tests can hand it a fixture catalog.
 *
 * No sessions, no auth, no side effects: the files are public, and nothing a
 * client sends can change anything. A malformed message is a JSON-RPC
 * error; a mistake inside a tool call is a result with `isError` the agent
 * can act on.
 */

type JsonRpcId = string | number
export type JsonRpcResponse =
  | { jsonrpc: '2.0'; id: JsonRpcId | null; result: unknown }
  | {
      jsonrpc: '2.0'
      id: JsonRpcId | null
      error: { code: number; message: string }
    }

type Context = { catalog: Catalog; origin: string }

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
  internal: -32_603,
} as const

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function failure(
  id: JsonRpcId | null,
  code: number,
  message: string
): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message } }
}

function idOf(message: Record<string, unknown>): JsonRpcId | null {
  const { id } = message
  return typeof id === 'string' || typeof id === 'number' ? id : null
}

function answer(
  method: string,
  id: JsonRpcId,
  params: Record<string, unknown>,
  context: Context
): JsonRpcResponse {
  switch (method) {
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
            version: '2.0.0',
            websiteUrl: context.origin,
          },
          instructions: instructions(),
        },
      }
    }
    case 'ping':
      return { jsonrpc: '2.0', id, result: {} }
    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: registry(context.catalog).tools },
      }
    case 'tools/call': {
      const { name, arguments: args } = params
      if (typeof name !== 'string') {
        return failure(id, ERROR.invalidParams, '`name` must be a tool name')
      }
      if (args !== undefined && !isObject(args)) {
        return failure(id, ERROR.invalidParams, '`arguments` must be an object')
      }
      const result = registry(context.catalog).call(
        name,
        args ?? {},
        context.origin
      )
      return result
        ? { jsonrpc: '2.0', id, result }
        : failure(id, ERROR.invalidParams, `Unknown tool: ${name}`)
    }
    default:
      return failure(id, ERROR.methodNotFound, `Method not found: ${method}`)
  }
}

/**
 * One JSON-RPC message → its response, or null for a notification or a
 * client's reply (neither gets one back).
 */
export function handleMessage(
  message: unknown,
  context: Context
): JsonRpcResponse | null {
  if (!isObject(message)) {
    return failure(null, ERROR.invalidRequest, 'Not a JSON-RPC request')
  }
  if (!('method' in message)) {
    // A client's reply to a server request; this server sends none.
    return 'result' in message || 'error' in message
      ? null
      : failure(idOf(message), ERROR.invalidRequest, 'Not a JSON-RPC request')
  }
  const { method } = message
  if (message.jsonrpc !== '2.0' || typeof method !== 'string') {
    return failure(
      idOf(message),
      ERROR.invalidRequest,
      'Not a JSON-RPC request'
    )
  }
  if (!('id' in message)) {
    return null
  }
  const id = idOf(message)
  if (id === null) {
    return failure(
      null,
      ERROR.invalidRequest,
      'A request id is a string or a number'
    )
  }
  const params = message.params ?? {}
  if (!isObject(params)) {
    return failure(id, ERROR.invalidParams, '`params` must be an object')
  }
  try {
    return answer(method, id, params, context)
  } catch (error) {
    // A server fault reaches the logs, never the client as an HTML page.
    console.error('[mcp]', error)
    return failure(id, ERROR.internal, 'Internal error')
  }
}
