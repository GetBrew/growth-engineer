import { formatRef } from '@/lib/catalog/keys'
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
            // Optional: the file tells the agent to ask for any input the
            // person did not give, so a bare pick still runs.
            arguments: workflow.inputs.map((input) => ({
              name: input.name,
              description: input.example
                ? `${input.description}, e.g. ${input.example}`
                : input.description,
              required: false,
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
    return {
      description: prompt.description,
      messages: [userMessage(`${guideMarkdown(guide)}${idea}`)],
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
