/**
 * The addresses this site quotes about itself. They appear in the hero card,
 * the terminal beside it, the prompt handed to an agent and the footer — and
 * an agent PASTES what it reads here, so two spellings of one address is not
 * an untidiness, it is a visitor connecting to the wrong server.
 *
 * PURE MODULE: strings only. Imported by client components and the build.
 */

/** One server, one URL — every agent adds the same one. */
export const MCP_URL = 'https://growth.engineer/mcp'

/** Brew, who make this: the wordmark, the footer column, the credit line. */
export const BREW_URL = 'https://brew.new'

/**
 * The footer line, under the wordmark. Short on purpose: someone reading a
 * footer wants to know what the site is in one glance, not a positioning
 * statement.
 */
export const SITE_TAGLINE = 'Tools and workflows your agent can run.'

/**
 * The `<meta name="description">`, which is a different job: search engines
 * show ~155 characters and reward the detail a footer has no room for. Kept
 * separate from the tagline rather than built from it.
 */
export const SITE_DESCRIPTION =
  'The agent-friendly marketplace for go-to-market tools and workflows. Every tool and workflow is one markdown file any agent can run.'
