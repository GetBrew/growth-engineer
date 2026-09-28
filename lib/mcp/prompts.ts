import { formatRef } from '@/lib/catalog/keys'
import { loadGuideSteps } from '@/lib/catalog/loaders'
import { GUIDES, guideMarkdown } from '@/lib/constants/guides'
import type { Catalog } from '@/lib/content/build-catalog'

/**
 * MCP prompts: the catalog's two jobs as things a person picks from their
 * client's prompt list. Every published workflow is a prompt that runs it —
 * its inputs are the prompt's arguments — and each contribute guide is a
 * prompt that sets the agent up to add a workflow, a tool or a company.
 *
 * The text is the same file `get` and the `.md` URL serve, with the values
 * the person already gave on top, so there is still one render path.
 */

type PromptArgument = { name: string; description: string; required: boolean }

export type Prompt = {
  name: string
  title: string
  description: string
  arguments: ReadonlyArray<PromptArgument>
}

type PromptMessage = {
  role: 'user'
  content: { type: 'text'; text: string }
}

export type PromptResult = {
  description: string
  messages: ReadonlyArray<PromptMessage>
}

/** `contribute-workflow`: a guide's prompt name, beside the workflow keys. */
export const CONTRIBUTE_PREFIX = 'contribute-'

/**
 * What a contributor can do through this server before writing a file: find
 * what exists, find the calls a step can make, check the key is free.
 */
const WITH_THIS_SERVER: Record<string, string> = {
  workflow: [
    '## With this MCP server',
    '',
    '1. `search` for a workflow that already reaches this result; improve it rather than adding a second.',
    '2. For each step, `search` with `type: "tool"` (a `capability` tag compares vendors) and `get` the tool: its calls and notes say what a step can ask of it. A step you can do yourself, like writing a draft, names no tool.',
    '3. Pick the key, the file name, and check it is free: `get` on `workflow:<key>` answers that nothing is there.',
  ].join('\n'),
  tool: [
    '## With this MCP server',
    '',
    '1. `get` on `company:<handle>` shows the company, its ways in and its tools; add the call to a way it declares.',
    '2. `get` a `capability:` tag to see how other vendors write the same job, and reuse its tag.',
  ].join('\n'),
  company: [
    '## With this MCP server',
    '',
    '1. `search` with `type: "company"` to check the company is not listed yet.',
    '2. `get` a listed company in the same category, like `company:apollo`, as a model for its file and its tools.',
  ].join('\n'),
}

const IDEA: PromptArgument = {
  name: 'idea',
  description:
    'What you want to add, in your words: a growth play, or a company and what an agent should call on it',
  required: false,
}

function workflowPrompts(catalog: Catalog): Array<Prompt> {
  return catalog.order.workflowsFeatured.flatMap((key) => {
    const workflow = catalog.workflows.get(key)
    return workflow
      ? [
          {
            name: key,
            title: workflow.title,
            description: workflow.summary,
            // Required, as the file says: a client asks for them up front.
            // One it sends without still runs — the agent asks for the rest.
            arguments: workflow.inputs.map((input) => ({
              name: input.name,
              description: input.example
                ? `${input.description}, e.g. ${input.example}`
                : input.description,
              required: true,
            })),
          },
        ]
      : []
  })
}

function guidePrompts(): Array<Prompt> {
  return GUIDES.map((guide) => ({
    name: `${CONTRIBUTE_PREFIX}${guide.id}`,
    title: guide.title,
    description: `${guide.summary} Sets your agent up to add it to the catalog by pull request.`,
    arguments: [IDEA],
  }))
}

const cache = new WeakMap<Catalog, ReadonlyArray<Prompt>>()

export function listPrompts(catalog: Catalog): ReadonlyArray<Prompt> {
  let prompts = cache.get(catalog)
  if (!prompts) {
    prompts = [...workflowPrompts(catalog), ...guidePrompts()]
    cache.set(catalog, prompts)
  }
  return prompts
}

/** The values the person gave, one line each, for the arguments it knows. */
function givenValues(
  prompt: Prompt,
  args: Readonly<Record<string, unknown>>
): Array<string> {
  return prompt.arguments.flatMap((argument) => {
    const value = args[argument.name]
    return typeof value === 'string' && value.trim() !== ''
      ? [`- \`${argument.name}\`: ${value.trim()}`]
      : []
  })
}

function userMessage(text: string): PromptMessage {
  return { role: 'user', content: { type: 'text', text } }
}

/** A prompt filled in, or null when no prompt has that name. */
export function getPrompt(
  catalog: Catalog,
  name: string,
  args: Readonly<Record<string, unknown>>
): PromptResult | null {
  const prompt = listPrompts(catalog).find((entry) => entry.name === name)
  if (!prompt) {
    return null
  }
  const values = givenValues(prompt, args)
  const guide = GUIDES.find(
    (entry) => `${CONTRIBUTE_PREFIX}${entry.id}` === name
  )
  if (guide) {
    const idea =
      values.length > 0 ? `\n\nWhat I want to add:\n\n${values.join('\n')}` : ''
    const text = guideMarkdown(
      guide,
      loadGuideSteps(guide.id),
      WITH_THIS_SERVER[guide.id]
    )
    return {
      description: prompt.description,
      messages: [userMessage(`${text}${idea}`)],
    }
  }
  const document = catalog.documents.get(formatRef('workflow', name))
  if (!document) {
    return null
  }
  const lead =
    values.length > 0
      ? `Run this workflow for me. The inputs I have already given:\n\n${values.join('\n')}\n\nAsk me for any other input it lists.`
      : 'Run this workflow for me. Ask me for the inputs it lists before you start.'
  return {
    description: prompt.description,
    messages: [userMessage(`${lead}\n\n${document.markdown}`)],
  }
}
