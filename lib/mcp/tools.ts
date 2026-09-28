import { z } from 'zod'
import { DEFINITIONS, SITE } from '@/lib/catalog/definitions'
import type { Catalog } from '@/lib/content/build-catalog'
import {
  feedbackArgs,
  feedbackDescription,
  feedbackOutput,
  runFeedback,
} from './feedback-tool'
import { getArgs, getOutput, runGet } from './get-tool'
import { runSearch, searchArgs, searchOutput } from './search-tool'
import { type ToolResult, toolError } from './tool-result'

/**
 * The tools, defined once: zod is the source of the arguments the
 * handler accepts, the `inputSchema` and `outputSchema` clients see in
 * `tools/list`, and the types the handlers are checked against. Built once
 * per catalog — the tag vocabulary in `search` is the catalog's own.
 */

type Tool = {
  name: 'search' | 'get' | 'submit_feedback'
  title: string
  description: string
  inputSchema: Record<string, unknown>
  outputSchema: Record<string, unknown>
  annotations: Record<string, boolean>
}

/** Who is calling: the origin results link to, and the client's User-Agent. */
export type Caller = { origin: string; agentClient?: string }

type Registry = {
  tools: ReadonlyArray<Tool>
  call: (
    name: string,
    args: unknown,
    caller: Caller
  ) => Promise<ToolResult | null>
}

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
}

/** Changes nothing here, but sends a message out: @usenotra/geo's own hints. */
const SENDS_MESSAGE = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
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
    search: `Search ${SITE.name}: workflows (growth plays an agent runs step by step), tools (one vendor function each) and the companies that make them. Give words, filters, or both; with neither you get the featured workflows first. Words match loosely ("enriching" finds "enrich"), and "workflow", "tool" or "company" among them picks the type. Every filter must match. Pass a result's ref to \`get\` — e.g. ${workflow ? `\`workflow:${workflow.example}\`` : 'a workflow'}.`,
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
    {
      name: 'submit_feedback',
      title: 'Submit feedback',
      description: feedbackDescription,
      inputSchema: jsonSchema(feedbackArgs, 'input'),
      outputSchema: jsonSchema(feedbackOutput, 'output'),
      annotations: SENDS_MESSAGE,
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
    call: async (name, args, caller) => {
      if (name === 'search') {
        const parsed = searchSchema.safeParse(args)
        return parsed.success
          ? runSearch(catalog, caller.origin, parsed.data)
          : invalid(parsed.error)
      }
      if (name === 'get') {
        const parsed = getArgs.safeParse(args)
        return parsed.success
          ? runGet(catalog, caller.origin, parsed.data)
          : invalid(parsed.error)
      }
      if (name === 'submit_feedback') {
        const parsed = feedbackArgs.safeParse(args)
        return parsed.success
          ? await runFeedback(parsed.data, caller.agentClient)
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
    'Use `search` to find a workflow or tool for the job — by words, tags (capability, category, motion, channel, has:mcp), company, author, or the tool a workflow uses. Then `get` its ref and follow the file: it names every tool, how to set it up and what to know before each call, the inputs to ask the user for, the steps and the rules. `get` a tag to compare every tool that does one job.',
    'Every workflow is also a prompt, named by its key, with its inputs as arguments: pick it to run it. To add to the catalog, use the `contribute-workflow`, `contribute-tool` or `contribute-company` prompt; contributions are pull requests to the repository.',
    `If something here is broken or wrong, the catalog lacks what the user needs, or the user asks for something ${SITE.name} does not do, tell the ${SITE.publisher.name} team with \`submit_feedback\`. Say what happened and include the ref or URL; leave out keys and personal details.`,
  ].join('\n')
}
