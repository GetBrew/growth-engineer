import { ACCESS_RANK } from '@/lib/constants/catalog'
import type { Access } from '@/lib/types/catalog'
import { formatRef } from './keys'

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
 * connected" into "call `apollo_people_match`".
 *
 * A way in belongs to the COMPANY, so a workflow using several of one
 * company's tools sets the way up once and lists every call on it.
 *
 * PURE MODULE: no I/O, deterministic.
 */

const WHITESPACE = /\s+/

/**
 * One tool's call on a way in. `toolName` is set when several tools share
 * the setup: each call is then listed under its tool's name.
 */
export type WayCall = { toolName?: string; access: Access }

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
 * Every value goes through `JSON.stringify`, never straight into the string.
 * The bytes are identical for an ordinary URL or command — and a value
 * carrying a quote cannot end the string early and write its own JSON into a
 * file people paste into an agent. Curated data is safe today; community
 * submissions are the point of the pipeline.
 *
 * The server name is the COMPANY, not the function: an MCP server is the
 * whole product. You add it once and call any of its tools on it; keying it
 * by the function would register the same server twice under two names.
 */
function mcpConfig(
  access: Extract<Access, { type: 'mcp' }>,
  companyKey: string
) {
  const slug = JSON.stringify(companyKey)
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
      return `- Auth: send the header \`${header}${separator} $${auth.envVar}\``
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
  return access.auth.method === 'api_key' && access.auth.keyUrl
    ? `- Get a key: ${access.auth.keyUrl}`
    : null
}

function mcpSetupSentence(access: Extract<Access, { type: 'mcp' }>): string {
  const base = "Add this server to your agent's MCP settings"
  return access.auth.method === 'oauth'
    ? `${base}, then sign in when asked.`
    : `${base}.`
}

function envVarLine(access: Access): string | null {
  if (access.auth.method !== 'api_key') {
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

/** A tool's own call as a sentence; shared setups list each under its tool. */
function callLines(calls: ReadonlyArray<WayCall>): Array<string> {
  return calls.map(({ toolName, access }) => {
    if (toolName === undefined) {
      return operationLine(access)
    }
    switch (access.type) {
      case 'mcp':
        return `- ${toolName}: call the MCP tool \`${access.operation}\``
      case 'cli':
        return `- ${toolName}: run \`${access.operation}\``
      default:
        return `- ${toolName}: \`${access.operation}\``
    }
  })
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
  calls: ReadonlyArray<WayCall>,
  companyKey: string,
  sentence: string
): Array<string> {
  return withEnvVar(
    [
      sentence,
      '',
      '```json',
      mcpConfig(access, companyKey),
      '```',
      '',
      ...callLines(calls),
    ],
    access
  )
}

function cliBody(
  access: Extract<Access, { type: 'cli' }>,
  calls: ReadonlyArray<WayCall>,
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
      ...callLines(calls),
    ],
    access
  )
}

function apiBody(
  access: Extract<Access, { type: 'api' }>,
  calls: ReadonlyArray<WayCall>,
  options: { includeDocs: boolean }
): Array<string> {
  const lines = [`- Base URL: ${access.baseUrl}`, ...callLines(calls)]
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

/**
 * The body of one way in, without its heading: set up once, then the call of
 * every tool given. The ways are one company's, so they share everything but
 * the call.
 */
export function accessBody(
  calls: ReadonlyArray<WayCall>,
  companyKey: string,
  options: { includeDocs: boolean }
): Array<string> {
  const [first] = calls
  if (!first) {
    return []
  }
  const { access } = first
  const maintainer = maintainerLine(access)
  const prefix = maintainer ? [maintainer, ''] : []
  switch (access.type) {
    case 'mcp':
      return [
        ...prefix,
        ...mcpBody(access, calls, companyKey, mcpSetupSentence(access)),
      ]
    case 'cli':
      return [
        ...prefix,
        ...cliBody(access, calls, 'Install the command, then confirm it runs.'),
      ]
    case 'api':
      return [...prefix, ...apiBody(access, calls, options)]
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

/** A company's setup in a workflow when exactly one way in is shown. */
function singleAccessSetup(
  calls: ReadonlyArray<WayCall>,
  companyKey: string
): Array<string> {
  const [first] = calls
  if (!first) {
    return []
  }
  const { access } = first
  const maintainer = maintainerLine(access)
  const prefix = maintainer ? [maintainer, ''] : []
  switch (access.type) {
    case 'mcp': {
      const sentence = mcpSetupSentence(access).replace(
        "Add this server to your agent's MCP settings",
        "Use the MCP server. Add it to your agent's MCP settings"
      )
      return [...prefix, ...mcpBody(access, calls, companyKey, sentence)]
    }
    case 'cli':
      return [
        ...prefix,
        ...cliBody(
          access,
          calls,
          'Use the CLI. Install the command, then confirm it runs.'
        ),
      ]
    case 'api':
      return [
        'Use the API.',
        '',
        ...prefix,
        ...apiBody(access, calls, { includeDocs: false }),
      ]
    default:
      return prefix
  }
}

/** A tool as a workflow's setup sees it. */
export type SetupTool = {
  key: string
  name: string
  /** Who makes it: two vendors' "Enrich contacts" must read differently. */
  companyName: string
  access: ReadonlyArray<Access>
}

/** A tool key's company: `apollo/search-people` → `apollo`. */
function companyOf(tool: SetupTool): string {
  return tool.key.split('/')[0] ?? tool.key
}

/**
 * One company's setup: each of its tools keeps its best one or two ways in,
 * and a way in shows once, naming the call of every tool that uses it.
 */
function companySetup(group: ReadonlyArray<SetupTool>): Array<string> {
  const [first] = group
  if (!first) {
    return []
  }
  const heading = [
    '',
    group.length === 1
      ? `### ${first.name} (${first.companyName}, ${formatRef('tool', first.key)})`
      : `### ${first.companyName} (${group.map((tool) => formatRef('tool', tool.key)).join(', ')})`,
    '',
  ]
  // A company has at most one way of each type, so the type names the way.
  const callsByType = new Map<Access['type'], Array<WayCall>>()
  for (const tool of group) {
    for (const access of selectWorkflowAccess(tool.access)) {
      const calls = callsByType.get(access.type) ?? []
      const call =
        group.length > 1 ? { toolName: tool.name, access } : { access }
      callsByType.set(access.type, [...calls, call])
    }
  }
  const ways = orderAccess(
    [...callsByType.values()].flatMap((calls) =>
      calls[0] ? [calls[0].access] : []
    )
  ).map((access) => callsByType.get(access.type) ?? [])
  const companyKey = companyOf(first)
  if (ways.length === 0) {
    return [
      ...heading,
      'No documented way in yet. Ask the user how they reach this tool.',
    ]
  }
  const [only] = ways
  if (ways.length === 1 && only) {
    return [...heading, ...singleAccessSetup(only, companyKey)]
  }
  const options = ways.flatMap((calls) =>
    calls[0]
      ? [
          '',
          `#### ${accessHeading(calls[0].access)}`,
          '',
          ...accessBody(calls, companyKey, { includeDocs: false }),
        ]
      : []
  )
  // One option may not run every call (an MCP server without the note
  // endpoint): then the choice is per call, not per company.
  const coversAll = ways.every((calls) => calls.length === group.length)
  return [
    ...heading,
    coversAll
      ? 'Use the first option your agent supports.'
      : 'For each call, use the first option your agent supports that lists it.',
    ...options,
  ]
}

/** A workflow's Set up section: each company once, in the order it is first used. */
export function workflowSetup(tools: ReadonlyArray<SetupTool>): Array<string> {
  const groups = new Map<string, Array<SetupTool>>()
  for (const tool of tools) {
    groups.set(companyOf(tool), [...(groups.get(companyOf(tool)) ?? []), tool])
  }
  return [
    '',
    '## Set up',
    ...[...groups.values()].flatMap(companySetup),
    '',
    tools.length > 1
      ? 'Make one read-only call to each tool to confirm access.'
      : 'Make one read-only call to confirm access.',
  ]
}
