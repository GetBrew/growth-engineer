/**
 * THE definitions, written once. Everything that explains the catalog to a
 * machine reads from here — `/llms.txt`, `/llms-full.txt`, the structured
 * data, the site's metadata — so the site, the files and the docs never
 * describe the same thing three different ways.
 *
 * PURE MODULE: constants only; imported by pages and route handlers alike.
 */

export const SITE = {
  name: 'growth.engineer',
  tagline: 'Open source GTM tools and workflows, ready for any agent.',
  description:
    'Companies, the tools they make, and workflows that put tools to work. Every tool and workflow is one markdown file any agent can run: the setup, the inputs, the steps and the rules, inline. The catalog itself is markdown in a public repository, built into a static site.',
  repository: 'https://github.com/GetBrew/growth-engineer',
  publisher: { name: 'Brew', url: 'https://brew.new' },
} as const

export type Definition = {
  /** The word, as the site uses it. */
  term: 'Company' | 'Tool' | 'Workflow' | 'Tag'
  /** An example key, in the grammar the URLs use. */
  example: string
  /** One sentence that could stand alone in a glossary. */
  definition: string
  /** The detail that keeps people from misusing the word. */
  detail: string
  /** Where the source file lives in the repository. */
  path: string
}

export const DEFINITIONS: ReadonlyArray<Definition> = [
  {
    term: 'Company',
    example: 'clay',
    definition: 'A vendor, open-source project or person that makes tools.',
    detail:
      'Named by a permanent handle that is its URL and the first half of every tool key. A company lists the ways in it offers — MCP server, CLI, API — once, and its tools point at them.',
    path: 'companies/<handle>/company.md',
  },
  {
    term: 'Tool',
    example: 'clay/enrich-contacts',
    definition:
      'ONE function an agent can call, tied to a specific MCP tool, CLI subcommand or API endpoint.',
    detail:
      'Not the product: a product with three functions is three tools. Every way in names the exact operation an agent calls.',
    path: 'companies/<handle>/tools/<slug>.md',
  },
  {
    term: 'Workflow',
    example: 'funding-signal-outbound',
    definition:
      'Several tools in order, with the instructions that reach a result, written by a person.',
    detail:
      'Up to ten steps, each naming one tool; inputs the agent asks the user for; the checks that mean it is done. A growth hack is a workflow — there is no second kind. The author is a GitHub login.',
    path: 'workflows/<name>.md',
  },
  {
    term: 'Tag',
    example: 'capability:enrich-contacts',
    definition:
      'A word from the managed vocabulary that companies, tools and workflows are filtered by.',
    detail:
      'Five curated namespaces — capability, motion, channel, category, fit — plus one derived from each tool’s access: has (its ways in).',
    path: 'tags/<namespace>/<slug>.md',
  },
]

/** Where the MCP server answers (app/mcp/route.ts), from the site origin. */
export const MCP_PATH = '/mcp'

/** How an agent gets a file: the doors, stated once. */
export const AGENT_ACCESS = [
  'Append `.md` to any company, tool or workflow URL to get its file.',
  'Or request a company, tool or workflow page with `Accept: text/markdown`.',
  '`/llms.txt` lists every file; `/llms-full.txt` is every file in one document.',
  `Or connect an MCP client to \`${MCP_PATH}\` (Streamable HTTP, no sign-in): \`search\` finds files, \`get\` returns one.`,
] as const
