/**
 * Free prose an author writes into a rendered file — a company or tool
 * description, a workflow's Notes — sits between sections the build writes
 * itself: Set up, Steps, Rules. An agent reads the headings to find its way,
 * so prose may not add one of those sections or a heading at their level:
 * a `## Rules` in the Notes would sit right above the real, fixed Rules.
 *
 * Checked outside code fences: ATX headings (`## x`) must be `###` or
 * smaller and never carry a section's name; setext headings (a line under
 * `===` or `---`) are refused, since they read as `#` and `##`.
 *
 * PURE: text in, problems (with file lines) out.
 */

export type ProseProblem = { line: number; message: string }

/** The sections rendered files write themselves, in any of the three kinds. */
const RESERVED = new Set([
  'set up',
  'inputs',
  'steps',
  'done when',
  'notes',
  'rules',
  'tools',
  'links',
])

const FENCE = /^ {0,3}(```|~~~)/
const HEADING = /^ {0,3}(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/
const UNDERLINE = /^ {0,3}(=+|-+)[ \t]*$/

export function proseProblems(
  text: string,
  firstLine: number,
  where: string
): Array<ProseProblem> {
  const problems: Array<ProseProblem> = []
  let isFenced = false
  let previous = ''
  for (const [offset, raw] of text.split('\n').entries()) {
    const line = firstLine + offset
    if (FENCE.test(raw)) {
      isFenced = !isFenced
      previous = ''
      continue
    }
    if (isFenced) {
      continue
    }
    const heading = HEADING.exec(raw)
    if (heading) {
      const level = (heading[1] ?? '').length
      const name = (heading[2] ?? '').trim()
      if (RESERVED.has(name.toLowerCase())) {
        problems.push({
          line,
          message: `${where}: "${name}" is a section the file writes itself; name the heading something else`,
        })
      } else if (level < 3) {
        problems.push({
          line,
          message: `${where}: use ### or smaller headings; # and ## belong to the file`,
        })
      }
    } else if (UNDERLINE.test(raw) && previous.trim() !== '') {
      problems.push({
        line,
        message: `${where}: a line of ${raw.trim().charAt(0)} under text makes a heading; write "### ${previous.trim()}" instead`,
      })
    }
    previous = raw
  }
  return problems
}
