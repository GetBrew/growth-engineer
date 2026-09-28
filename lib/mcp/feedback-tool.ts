import {
  buildFeedbackToolDescription,
  createFeedbackToolHandler,
  feedbackToolInputSchema,
  feedbackToolOutputSchema,
} from '@usenotra/geo/feedback'
import { z } from 'zod'
import { SITE } from '@/lib/catalog/definitions'
import type { ToolResult } from './tool-result'

/**
 * MCP `submit_feedback`: a bug, a wrong fact, a missing tool or workflow, a
 * question or praise, sent to the publisher's Notra inbox. It is the one tool
 * with a side effect and the only one that leaves this server. It changes
 * nothing in the catalog.
 *
 * The arguments, the description and the handler are @usenotra/geo's own.
 * Its `registerFeedbackTool` needs the MCP SDK's server, and this server
 * speaks JSON-RPC itself (./server.ts), so it takes the parts. The URL only
 * accepts feedback, so it is not a secret.
 */

export const FEEDBACK_URL = 'https://api.usenotra.com/v1/feedback/brew'

/** Notra rejects a longer `agentClient`. */
const AGENT_CLIENT_MAX = 200

export const feedbackArgs = z.strictObject(feedbackToolInputSchema)

export const feedbackOutput = z.strictObject(feedbackToolOutputSchema)

export const feedbackDescription = buildFeedbackToolDescription(
  SITE.publisher.name
)

/**
 * Sends one entry. `agentClient` is the MCP client's User-Agent: a stateless
 * server never sees the name the client gave in `initialize` again, and the
 * header is the next best thing for triage.
 */
export async function runFeedback(
  args: z.infer<typeof feedbackArgs>,
  agentClient: string | undefined
): Promise<ToolResult> {
  const client = agentClient?.slice(0, AGENT_CLIENT_MAX)
  const send = createFeedbackToolHandler({
    url: FEEDBACK_URL,
    ...(client ? { defaults: { agentClient: client } } : {}),
    onError: (error) => console.error('[mcp] submit_feedback', error),
  })
  const { structuredContent, ...result } = await send(args)
  return structuredContent
    ? { ...result, structuredContent: { ...structuredContent } }
    : result
}
