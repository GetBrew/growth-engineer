/**
 * A workflow's BODY is the readable half of its source file: the inputs, the
 * steps and the checks, written in the markdown the rendered file uses — so
 * `workflows/<name>.md` reads on GitHub the way it reads on the site. The
 * header keeps the facts (title, author, tags); the build adds the setup and
 * the rules from the tools the steps name.
 *
 *   ## Inputs                                                    optional
 *   - `target_segment`: the kind of company to watch, e.g. Series A SaaS
 *
 *   ## Steps                                                     1 to 10
 *   1. **Find companies** with [clay/build-audience](../companies/clay/tools/build-audience.md). List …
 *   2. **Write emails** with `brew/write-copy` via MCP. Draft …
 *
 *   ## Done when                                                 1 or more
 *   - Every company has a contact.
 *
 *   ## Notes                                                     optional
 *   Anything else, in any markdown.
 *
 * A step names its tool by key, as a code span or as a link to the tool's
 * source file (which GitHub follows). `via MCP|CLI|API` after the tool picks
 * the way in. PURE: text in, fields and problems out; every problem carries
 * the line it is on, counted in the whole file.
 */

type BodyInput = { name: string; description: string; example?: string }

type BodyStep = {
  title: string
  tool: string
  via?: string
  instruction: string
}

export type WorkflowBody = {
  inputs: Array<BodyInput>
  steps: Array<BodyStep>
  doneWhen: Array<string>
  notes?: string
  /** The file line each entry starts on, so schema problems can point at it. */
  lines: {
    inputs: Array<number>
    steps: Array<number>
    doneWhen: Array<number>
  }
}

export type BodyProblem = { line: number; message: string }

type SectionId = 'inputs' | 'steps' | 'doneWhen' | 'notes'

/** In the only order they may appear. */
const SECTIONS: ReadonlyArray<{ id: SectionId; heading: string }> = [
  { id: 'inputs', heading: 'Inputs' },
  { id: 'steps', heading: 'Steps' },
  { id: 'doneWhen', heading: 'Done when' },
  { id: 'notes', heading: 'Notes' },
]

const SECTION_LIST = '`## Inputs`, `## Steps`, `## Done when` and `## Notes`'

const HEADING = /^ {0,3}(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/
const LIST_ITEM = /^( *)(?:[-*+]|\d{1,3}[.)])[ \t]+(.*)$/
const INPUT = /^`([^`]+)`\s*:\s*(.+)$/
const EXAMPLE = ', e.g. '
const STEP =
  /^\*\*(.+?)\*\*\s+with\s+(?:`([^`\s]+)`|\[([^\]\s]+)\]\(([^)\s]+)\))(?:\s+via\s+([A-Za-z]+))?\.\s+(\S.*)$/

const SHAPE: Record<Exclude<SectionId, 'notes'>, string> = {
  inputs: 'an input reads ``- `name`: what it is, e.g. an example``',
  steps:
    'a step reads ``1. **Title** with `handle/slug`. What to do.`` — add `via MCP`, `via CLI` or `via API` after the tool to pick the way in',
  doneWhen: 'a check reads `- The result is there.`',
}

/** Where a step's link must point, relative to `workflows/`. */
export function toolSourceLink(key: string): string {
  const [handle, slug] = key.split('/')
  return `../companies/${handle}/tools/${slug}.md`
}

type Item = { text: string; line: number }

function parseInput(item: Item, problems: Array<BodyProblem>): BodyInput {
  const match = INPUT.exec(item.text)
  if (!match) {
    problems.push({ line: item.line, message: SHAPE.inputs })
    return { name: '', description: '' }
  }
  const name = (match[1] ?? '').trim()
  const rest = (match[2] ?? '').trim()
  const at = rest.indexOf(EXAMPLE)
  if (at === -1) {
    return { name, description: rest }
  }
  return {
    name,
    description: rest.slice(0, at).trim(),
    example: rest.slice(at + EXAMPLE.length).trim(),
  }
}

function parseStep(item: Item, problems: Array<BodyProblem>): BodyStep {
  const match = STEP.exec(item.text)
  if (!match) {
    problems.push({ line: item.line, message: SHAPE.steps })
    return { title: '', tool: '', instruction: '' }
  }
  const [, title = '', code, linkText, linkTarget, via, instruction = ''] =
    match
  const tool = code ?? linkText ?? ''
  if (linkText !== undefined && linkTarget !== toolSourceLink(tool)) {
    problems.push({
      line: item.line,
      message: `the link to ${tool} must point at ${toolSourceLink(tool)}, its source file`,
    })
  }
  return {
    title: title.trim(),
    tool,
    ...(via ? { via: via.toLowerCase() } : {}),
    instruction: instruction.trim(),
  }
}

/** One section's list: items, with wrapped lines joined into their item. */
class ListReader {
  readonly items: Array<Item> = []
  private current: Item | null = null
  private sawGap = false
  private readonly shape: string
  private readonly problems: Array<BodyProblem>

  constructor(shape: string, problems: Array<BodyProblem>) {
    this.shape = shape
    this.problems = problems
  }

  blank(): void {
    if (this.current) {
      this.sawGap = true
    }
  }

  line(raw: string, line: number): void {
    const item = LIST_ITEM.exec(raw)
    if (item && (item[1] ?? '').length < 2) {
      this.current = { text: (item[2] ?? '').trim(), line }
      this.items.push(this.current)
      this.sawGap = false
      return
    }
    if (item) {
      this.problems.push({
        line,
        message: `no nested lists: ${this.shape}`,
      })
      return
    }
    if (this.current && !this.sawGap) {
      // A wrapped line belongs to the item above it.
      this.current.text = `${this.current.text} ${raw.trim()}`
      return
    }
    this.problems.push({
      line,
      message: this.current
        ? `one paragraph per item: ${this.shape}`
        : `write this section as a list: ${this.shape}`,
    })
  }
}

type SectionState = {
  seen: Set<SectionId>
  lastOrder: number
  current: SectionId | null
}

/** A heading line: enter a section, or say why it is not one. */
function enterSection(
  state: SectionState,
  level: number,
  name: string,
  line: number,
  problems: Array<BodyProblem>
): void {
  const index = SECTIONS.findIndex(
    (candidate) => candidate.heading.toLowerCase() === name.toLowerCase()
  )
  const section = level === 2 ? SECTIONS[index] : undefined
  if (!section) {
    problems.push({
      line,
      message:
        level === 1
          ? 'the title belongs in the header (`title:`), not in the body'
          : `"${'#'.repeat(level)} ${name}" is not a section: a workflow body has ${SECTION_LIST}, in that order`,
    })
    state.current = null
    return
  }
  if (state.seen.has(section.id)) {
    problems.push({ line, message: `a second "## ${section.heading}"` })
  } else if (index < state.lastOrder) {
    problems.push({
      line,
      message: `"## ${section.heading}" is out of order: ${SECTION_LIST}, in that order`,
    })
  }
  state.seen.add(section.id)
  state.lastOrder = Math.max(state.lastOrder, index)
  state.current = section.id
}

export function parseWorkflowBody(
  body: string,
  firstLine = 1
): { body: WorkflowBody; problems: Array<BodyProblem> } {
  const problems: Array<BodyProblem> = []
  const readers = {
    inputs: new ListReader(SHAPE.inputs, problems),
    steps: new ListReader(SHAPE.steps, problems),
    doneWhen: new ListReader(SHAPE.doneWhen, problems),
  }
  const state: SectionState = { seen: new Set(), lastOrder: -1, current: null }
  const notes: Array<string> = []
  let reportedStray = false

  for (const [offset, raw] of body.split('\n').entries()) {
    const line = firstLine + offset
    if (state.current === 'notes') {
      // Notes are free markdown to the end of the file, headings included.
      notes.push(raw)
      continue
    }
    const heading = HEADING.exec(raw)
    if (heading) {
      const level = (heading[1] ?? '').length
      enterSection(state, level, heading[2] ?? '', line, problems)
      continue
    }
    if (raw.trim() === '') {
      if (state.current) {
        readers[state.current].blank()
      }
      continue
    }
    if (state.current) {
      readers[state.current].line(raw, line)
    } else if (!reportedStray) {
      reportedStray = true
      problems.push({
        line,
        message: `text outside a section: the body is ${SECTION_LIST}; anything else goes under "## Notes"`,
      })
    }
  }

  const note = notes.join('\n').trim()
  return {
    body: {
      inputs: readers.inputs.items.map((item) => parseInput(item, problems)),
      steps: readers.steps.items.map((item) => parseStep(item, problems)),
      doneWhen: readers.doneWhen.items.map((item) => item.text),
      ...(note ? { notes: note } : {}),
      lines: {
        inputs: readers.inputs.items.map((item) => item.line),
        steps: readers.steps.items.map((item) => item.line),
        doneWhen: readers.doneWhen.items.map((item) => item.line),
      },
    },
    problems: problems.sort((a, b) => a.line - b.line),
  }
}
