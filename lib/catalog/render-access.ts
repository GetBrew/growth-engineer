import { ACCESS_RANK } from '@/lib/constants/catalog'
import type { Access } from '@/lib/types/catalog'

/**
 * How a WAY IN renders inside a file: the MCP block, the CLI install, the API
 * lines — and which ways in a file shows. Shared by the tool and workflow
 * renderers in ./render-markdown.ts.
 *
 * "Setup picks the best way in": official MCP, then CLI, then API, then the
 * community options in the same order. Tool files list every option;
 * workflow files show at most two per tool.
 *
 * EVERY WAY IN NAMES ITS OPERATION. A tool is one function, so setup is not
 * finished when the agent can reach the product — it is finished when the
 * agent knows the exact call. The operation line is what turns "you have Clay
 * connected" into "call `clay_enrich_person`".
 *
 * PURE MODULE: type-only imports.
 */

const WHITESPACE = /\s+/

/** Official first, then community; within each, MCP, CLI, API. */
export function orderAccess(access: ReadonlyArray<Access>): Array<Access> {
  return [...access].sort(
    (a, b) =>
      Number(b.official) - Number(a.official) ||
      ACCESS_RANK[a.type] - ACCESS_RANK[b.type]
  )
}

/** A workflow shows each tool's best two ways in. */
export function selectWorkflowAccess(
  access: ReadonlyArray<Access>
): Array<Access> {
  return orderAccess(access).slice(0, 2)
}

/**
 * The server name in the `mcpServers` block: the COMPANY, not the function.
 *
 * A tool is one function, but an MCP server is the whole product — you add
 * Clay's server once and then call `clay_enrich_contacts` or
 * `clay_find_work_emails` on it. Keying the block by the function would tell
 * a user to register the same server several times under different names,
 * and a second workflow step would silently overwrite the first.
 */
function serverSlug(toolKey: string): string {
  return toolKey.split('/')[0] ?? toolKey
}

/**
 * Every value goes through `JSON.stringify`, never straight into the string.
 * The bytes are identical for an ordinary URL or command — and a value
 * carrying a quote cannot end the string early and write its own JSON into a
 * file people paste into an agent. Curated data is safe today; community
 * submissions are the point of the pipeline.
 */
function mcpConfig(access: Extract<Access, { type: 'mcp' }>, toolKey: string) {
  const slug = JSON.stringify(serverSlug(toolKey))
  if (access.transport === 'remote' && access.url) {
    return `{ "mcpServers": { ${slug}: { "url": ${JSON.stringify(access.url)} } } }`
  }
  const [command = '', ...args] = (access.command ?? '')
    .trim()
    .split(WHITESPACE)
  return `{ "mcpServers": { ${slug}: { "command": ${JSON.stringify(command)}, "args": ${JSON.stringify(args)} } } }`
}

function authHeaderLine(access: Access): string | null {
  const { auth } = access
  switch (auth.method) {
    case 'api_key': {
      // `header` is the header name plus any scheme: "Authorization: Bearer",
      // "X-Api-Key". A bare name gets its colon; a scheme already has one.
      const header = auth.header ?? 'Authorization: Bearer'
      const separator = header.includes(':') ? '' : ':'
      const variable = auth.envVar ?? 'API_KEY'
      return `- Auth: send the header \`${header}${separator} $${variable}\``
    }
    case 'oauth':
      return '- Auth: OAuth; sign in when the agent asks'
    case 'none':
      return '- Auth: none'
    default:
      return null
  }
}

function keyLine(access: Access): string | null {
  return access.auth.keyUrl ? `- Get a key: ${access.auth.keyUrl}` : null
}

function mcpSetupSentence(access: Extract<Access, { type: 'mcp' }>): string {
  const base = "Add this server to your agent's MCP settings"
  return access.auth.method === 'oauth'
    ? `${base}, then sign in when asked.`
    : `${base}.`
}

function envVarLine(access: Access): string | null {
  if (access.auth.method !== 'api_key' || !access.auth.envVar) {
    return null
  }
  const suffix = access.auth.keyUrl ? ` (get a key: ${access.auth.keyUrl})` : ''
  return `Set \`$${access.auth.envVar}\` in your environment first${suffix}.`
}

/** The exact call this way in names — the reason a tool is one function. */
function operationLine(access: Access): string {
  switch (access.type) {
    case 'mcp':
      return `Call the MCP tool \`${access.operation}\`.`
    case 'cli':
      return `Run \`${access.operation}\`.`
    default:
      return `- Endpoint: \`${access.operation}\``
  }
}

function maintainerLine(access: Access): string | null {
  return access.official || !access.maintainer
    ? null
    : `Community-maintained by ${access.maintainer}.`
}

function withEnvVar(lines: Array<string>, access: Access): Array<string> {
  const env = envVarLine(access)
  return env ? [...lines, '', env] : lines
}

function mcpBody(
  access: Extract<Access, { type: 'mcp' }>,
  toolKey: string,
  sentence: string
): Array<string> {
  return withEnvVar(
    [
      sentence,
      '',
      '```json',
      mcpConfig(access, toolKey),
      '```',
      '',
      operationLine(access),
    ],
    access
  )
}

function cliBody(
  access: Extract<Access, { type: 'cli' }>,
  sentence: string
): Array<string> {
  return withEnvVar(
    [
      sentence,
      '',
      '```sh',
      access.installCommand,
      `${access.binary} --version`,
      '```',
      '',
      operationLine(access),
    ],
    access
  )
}

function apiBody(
  access: Extract<Access, { type: 'api' }>,
  options: { includeDocs: boolean }
): Array<string> {
  const lines = [`- Base URL: ${access.baseUrl}`, operationLine(access)]
  const auth = authHeaderLine(access)
  if (auth) {
    lines.push(auth)
  }
  const key = keyLine(access)
  if (key) {
    lines.push(key)
  }
  if (options.includeDocs && access.docsUrl) {
    lines.push(`- Docs: ${access.docsUrl}`)
  }
  return lines
}

/** The body of one access option, without its heading (tool files, and 2-option workflow setups). */
export function accessBody(
  access: Access,
  toolKey: string,
  options: { includeDocs: boolean }
): Array<string> {
  const maintainer = maintainerLine(access)
  const prefix = maintainer ? [maintainer, ''] : []
  switch (access.type) {
    case 'mcp':
      return [...prefix, ...mcpBody(access, toolKey, mcpSetupSentence(access))]
    case 'cli':
      return [
        ...prefix,
        ...cliBody(access, 'Install the command, then confirm it runs.'),
      ]
    case 'api':
      return [...prefix, ...apiBody(access, options)]
    default:
      return prefix
  }
}

export function accessHeading(access: Access): string {
  const origin = access.official ? 'official' : 'community'
  switch (access.type) {
    case 'mcp':
      return `MCP (${origin}, ${access.transport})`
    case 'cli':
      return `CLI (${origin})`
    case 'api':
      return `API (${origin})`
    default:
      return origin
  }
}

/** The remote MCP's URL, spelled out after the block — tool files only. */
export function serverUrlLine(access: Access): string | null {
  return access.type === 'mcp' && access.transport === 'remote' && access.url
    ? `Server URL: ${access.url}`
    : null
}

/** A tool's setup in a workflow when exactly one way in is shown. */
export function singleAccessSetup(
  access: Access,
  toolKey: string
): Array<string> {
  const maintainer = maintainerLine(access)
  const prefix = maintainer ? [maintainer, ''] : []
  switch (access.type) {
    case 'mcp': {
      const sentence = mcpSetupSentence(access).replace(
        "Add this server to your agent's MCP settings",
        "Use the MCP server. Add it to your agent's MCP settings"
      )
      return [...prefix, ...mcpBody(access, toolKey, sentence)]
    }
    case 'cli':
      return [
        ...prefix,
        ...cliBody(
          access,
          'Use the CLI. Install the command, then confirm it runs.'
        ),
      ]
    case 'api':
      return [
        'Use the API.',
        '',
        ...prefix,
        ...apiBody(access, { includeDocs: false }),
      ]
    default:
      return prefix
  }
}
