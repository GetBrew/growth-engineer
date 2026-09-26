import { SITE_ORIGIN } from '@/lib/env'
import { ERROR, handleMessage, type JsonRpcResponse } from '@/lib/mcp/server'

/**
 * `/mcp` — the catalog as an MCP server, over the Streamable HTTP transport
 * in its stateless form: every POST carries JSON-RPC and gets JSON back, no
 * session, no stream, no auth. The site's one dynamic route: every PAGE is
 * prerendered, but a tool call is a request by nature. The JSON-RPC itself
 * is lib/mcp/server.ts.
 *
 * CORS is open because the data is public and read-only; browser-based
 * clients (the MCP Inspector, web agents) need it.
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

export async function POST(request: Request) {
  let message: unknown
  try {
    message = await request.json()
  } catch {
    return json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: ERROR.parse,
          message: 'Parse error: the body is not JSON',
        },
      },
      400
    )
  }

  // 2025-03-26 clients may batch; later protocol versions send one message.
  const messages = Array.isArray(message) ? message : [message]
  const responses = messages
    .map((entry) => handleMessage(entry, SITE_ORIGIN))
    .filter((response): response is JsonRpcResponse => response !== null)

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
