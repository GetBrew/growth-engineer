import { getCatalog } from '@/lib/catalog/catalog'
import { SITE_ORIGIN } from '@/lib/env'
import {
  ERROR,
  handleMessage,
  type JsonRpcResponse,
  PROTOCOL_VERSIONS,
} from '@/lib/mcp/server'

/**
 * `/mcp` — the catalog as an MCP server, over the Streamable HTTP transport
 * in its stateless form: every POST carries JSON-RPC and gets JSON back, no
 * session, no stream, no auth. The site's one dynamic route: every PAGE is
 * prerendered, but a tool call is a request by nature. The JSON-RPC itself
 * is lib/mcp/server.ts.
 *
 * CORS is open because the data is public, and the one tool that sends
 * anything, `submit_feedback`, posts to a feedback URL anyone can post to;
 * browser-based clients (the MCP Inspector, web agents) need it. Batches are
 * still accepted for 2025-03-26 clients; an empty one is invalid.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
}

function json(body: JsonRpcResponse | Array<JsonRpcResponse>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function invalid(code: number, message: string) {
  return json({ jsonrpc: '2.0', id: null, error: { code, message } }, 400)
}

const MAX_BATCH = 16

export async function POST(request: Request) {
  // A client names the protocol it speaks; one we don't know is refused.
  const version = request.headers.get('mcp-protocol-version')
  if (
    version &&
    !(PROTOCOL_VERSIONS as ReadonlyArray<string>).includes(version)
  ) {
    return invalid(
      ERROR.invalidRequest,
      `Unsupported MCP-Protocol-Version ${version}; this server speaks ${PROTOCOL_VERSIONS.join(', ')}`
    )
  }
  let message: unknown
  try {
    message = await request.json()
  } catch {
    return invalid(ERROR.parse, 'Parse error: the body is not JSON')
  }
  if (Array.isArray(message) && message.length === 0) {
    return invalid(ERROR.invalidRequest, 'Invalid Request: an empty batch')
  }
  // Every message costs a search, a lookup or a post; one request buys a few.
  if (Array.isArray(message) && message.length > MAX_BATCH) {
    return invalid(
      ERROR.invalidRequest,
      `Invalid Request: at most ${MAX_BATCH} messages in a batch`
    )
  }

  const context = {
    catalog: getCatalog(),
    origin: SITE_ORIGIN,
    agentClient: request.headers.get('user-agent') ?? undefined,
  }
  const messages = Array.isArray(message) ? message : [message]
  const responses = (
    await Promise.all(messages.map((entry) => handleMessage(entry, context)))
  ).filter((response): response is JsonRpcResponse => response !== null)

  if (responses.length === 0) {
    // Only notifications or replies: accepted, nothing to say.
    return new Response(null, { status: 202, headers: CORS })
  }
  return json(
    Array.isArray(message) ? responses : (responses[0] as JsonRpcResponse)
  )
}

/** No server-to-client stream: the transport's answer is 405. */
export function GET() {
  return new Response('This MCP server takes JSON-RPC over POST.', {
    status: 405,
    headers: { ...CORS, Allow: 'POST, OPTIONS' },
  })
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}
