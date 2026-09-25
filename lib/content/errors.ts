/**
 * Content errors carry the FILE they came from, and the build collects every
 * one before failing, so a contributor fixes a whole pull request in one pass
 * instead of one file per build.
 */

/** `line` is 1-based, counted in the whole file, when the problem has one. */
export type ContentProblem = { file: string; line?: number; message: string }

export class ContentError extends Error {
  readonly file: string
  /** The message without the file prefix, for collecting into a list. */
  readonly detail: string

  constructor(file: string, detail: string, options?: { cause?: unknown }) {
    super(`${file}: ${detail}`, options)
    this.name = 'ContentError'
    this.file = file
    this.detail = detail
  }
}

export class ContentErrors extends Error {
  readonly problems: ReadonlyArray<ContentProblem>

  constructor(problems: ReadonlyArray<ContentProblem>) {
    super(formatProblems(problems))
    this.name = 'ContentErrors'
    this.problems = problems
  }
}

function formatProblems(problems: ReadonlyArray<ContentProblem>): string {
  const count = problems.length
  const lines = problems.map(
    (problem) =>
      `  ${problem.file}${problem.line ? `:${problem.line}` : ''} → ${problem.message}`
  )
  return [
    `${count} content ${count === 1 ? 'problem' : 'problems'}:`,
    ...lines,
  ].join('\n')
}

/** Collects problems as the build walks the tree; throws them all at once. */
export class ProblemList {
  private readonly problems: Array<ContentProblem> = []

  add(file: string, message: string, line?: number): void {
    this.problems.push(line ? { file, line, message } : { file, message })
  }

  get size(): number {
    return this.problems.length
  }

  throwIfAny(): void {
    if (this.problems.length > 0) {
      throw new ContentErrors(this.problems)
    }
  }
}
