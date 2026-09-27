import { z } from 'zod'
import { DEFINITIONS, SITE } from '@/lib/catalog/definitions'
import type { Catalog } from '@/lib/content/build-catalog'
import { getArgs, getOutput, runGet } from './get-tool'
import { runSearch, searchArgs, searchOutput } from './search-tool'
import { type ToolResult, toolError } from './tool-result'

/**
 * The two tools, defined once: zod is the source of the arguments the
 * handler accepts, the `inputSchema` and `outputSchema` clients see in
 * `tools/list`, and the types the handlers are checked against. Built once
 * per catalog — the tag vocabulary in `search` is the catalog's own.
 */

type Tool = {
  name: 'search' | 'get'
  title: string
  description: string
  inputSchema: Record<string, unknown>
  outputSchema: Record<string, unknown>
  annotations: Record<string, boolean>
}

type Registry = {
  tools: ReadonlyArray<Tool>
  call: (name: string, args: unknown, origin: string) => ToolResult | null
}

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
}

/** A JSON Schema both draft-07 and 2020-12 clients read. */
function jsonSchema(schema: z.ZodType, io: 'input' | 'output') {
  const { $schema: _dropped, ...rest } = z.toJSONSchema(schema, {
    io,
    target: 'draft-7',
  }) as Record<string, unknown>
  return rest
}

function describe(): { search: string; get: string } {
  const [, , workflow, tag] = DEFINITIONS
  return {
    search: `Search ${SITE.name}: workflows (step-by-step playbooks an agent runs), tools (one vendor function each) and the companies that make them. Give words, filters, or both; with neither you get the featured workflows first. Words match loosely ("enriching" finds "enrich"), and "workflow", "tool" or "company" among them picks the type. Every filter must match. Pass a result's ref to \`get\` — e.g. ${workflow ? `\`workflow:${workflow.example}\`` : 'a workflow'}.`,
    get: `Read one entry. A workflow or tool comes back as its markdown file, with everything needed to run it — setup for each tool, the inputs to ask the user for, the steps and the rules — plus its links as refs (a workflow's tools, a tool's company and the workflows using it). A tag, like \`${tag?.example ?? 'capability:enrich-contacts'}\`, returns its file: everything carrying it — every vendor's version of one job, to compare.`,
  }
}

function build(catalog: Catalog): Registry {
  const searchSchema = searchArgs([...catalog.tags.keys()].sort())
  const text = describe()
  const tools: Array<Tool> = [
    {
      name: 'search',
      title: 'Search the catalog',
      description: text.search,
      inputSchema: jsonSchema(searchSchema, 'input'),
      outputSchema: jsonSchema(searchOutput, 'output'),
      annotations: READ_ONLY,
    },
    {
      name: 'get',
      title: 'Read an entry',
      description: text.get,
      inputSchema: jsonSchema(getArgs, 'input'),
      outputSchema: jsonSchema(getOutput, 'output'),
      annotations: READ_ONLY,
    },
  ]
  const invalid = (error: z.ZodError) =>
    toolError(
      `Invalid arguments: ${error.issues
        .map((issue) =>
          issue.path.length > 0
            ? `${issue.path.join('.')}: ${issue.message}`
            : issue.message
        )
        .join('; ')}.`
    )
  return {
    tools,
    call: (name, args, origin) => {
      if (name === 'search') {
        const parsed = searchSchema.safeParse(args)
        return parsed.success
          ? runSearch(catalog, origin, parsed.data)
          : invalid(parsed.error)
      }
      if (name === 'get') {
        const parsed = getArgs.safeParse(args)
        return parsed.success
          ? runGet(catalog, origin, parsed.data)
          : invalid(parsed.error)
      }
      return null
    },
  }
}

const cache = new WeakMap<Catalog, Registry>()

export function registry(catalog: Catalog): Registry {
  let found = cache.get(catalog)
  if (!found) {
    found = build(catalog)
    cache.set(catalog, found)
  }
  return found
}

/** What the server says it is for, from the words defined once. */
export function instructions(): string {
  return [
    `${SITE.name}: ${SITE.tagline}`,
    ...DEFINITIONS.map(
      (entry) => `- ${entry.term} (\`${entry.example}\`): ${entry.definition}`
    ),
    'Use `search` to find a workflow or tool for the job — by words, tags (capability, category, motion, channel, has:mcp), company, author, or the tool a workflow uses. Then `get` its ref and follow the file: it names every tool, how to set it up, the inputs to ask the user for, the steps and the rules. `get` a tag to compare every tool that does one job.',
  ].join('\n')
}
