/**
 * What a tool call returns. A mistake the agent can fix — a bad argument, a
 * ref that isn't there — is a RESULT with `isError`, carrying a sentence that
 * says what to do, so the model can correct itself (the MCP spec's "tool
 * execution error"). Only a malformed call is a JSON-RPC error.
 */
export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>
  structuredContent?: Record<string, unknown>
  isError?: boolean
}

export function toolError(text: string): ToolResult {
  return { content: [{ type: 'text', text }], isError: true }
}
