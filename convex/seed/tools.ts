import type { Doc } from '../_generated/dataModel'
import { SEED_TAGS } from './tags'

/**
 * Seed tools: ONE FUNCTION EACH, keyed `<company>/<function>`.
 *
 * A tool is a single thing an agent calls — `clay/enrich-contacts`, not
 * `clay/clay`. What is curated below is the PRODUCT (its ways in and the
 * functions it exposes); `SEED_TOOLS` expands each product into one tool per
 * function, because that is the grain people search and workflows step
 * through. A product with three functions is three listings.
 *
 * ILLUSTRATIVE AND UNVERIFIED. The base URLs, install commands and MCP
 * servers are widely documented public entry points, but nobody has run a
 * check against them, so every tool seeds as `agent: unverified`
 * (`checkedAt` undefined). THE OPERATIONS ARE DERIVED, not documented: a real
 * listing names the vendor's actual endpoint or MCP tool name, and that fact
 * arrives with verification. A product with no way in we would put our name
 * to has an empty `access` list and seeds `in_review`.
 */

/** The capability vocabulary, by slug — one description of each function. */
const CAPABILITY = new Map(
  SEED_TAGS.filter((seedTag) => seedTag.namespace === 'capability').map(
    (seedTag) => [seedTag.slug, seedTag]
  )
)

export type Access = Doc<'tools'>['access'][number]
type Auth = Access['auth']

/**
 * A way in before it knows which function it reaches. The operation is added
 * per tool during expansion, so one curated endpoint serves every function
 * the product exposes.
 */
type AccessTemplate =
  | Omit<Extract<Access, { type: 'mcp' }>, 'operation'>
  | Omit<Extract<Access, { type: 'cli' }>, 'operation'>
  | Omit<Extract<Access, { type: 'api' }>, 'operation'>

export type SeedTool = {
  key: string
  companyKey: string
  name: string
  summary: string
  description?: string
  access: ReadonlyArray<Access>
}

type SeedProduct = {
  companyKey: string
  /** The product's name, used to phrase each function's summary. */
  productName: string
  access: ReadonlyArray<AccessTemplate>
  /** `capability:<slug>` slugs — one tool each. */
  functions: ReadonlyArray<string>
}

const apiKey = (
  envVar: string,
  options: { header?: string; keyUrl?: string } = {}
): Auth => ({
  method: 'api_key',
  envVar,
  selfServe: true,
  ...(options.header ? { header: options.header } : {}),
  ...(options.keyUrl ? { keyUrl: options.keyUrl } : {}),
})

const oauth = (): Auth => ({ method: 'oauth', selfServe: true })

const api = (
  baseUrl: string,
  auth: Auth,
  docsUrl?: string
): AccessTemplate => ({
  type: 'api',
  official: true,
  auth,
  baseUrl,
  ...(docsUrl ? { docsUrl } : {}),
})

const mcpRemote = (
  url: string,
  auth: Auth,
  docsUrl?: string
): AccessTemplate => ({
  type: 'mcp',
  official: true,
  transport: 'remote',
  url,
  auth,
  ...(docsUrl ? { docsUrl } : {}),
})

const mcpLocal = (
  command: string,
  auth: Auth,
  repoUrl?: string
): AccessTemplate => ({
  type: 'mcp',
  official: true,
  transport: 'local',
  command,
  auth,
  ...(repoUrl ? { repoUrl } : {}),
})

const cli = (
  installCommand: string,
  binary: string,
  auth: Auth,
  docsUrl?: string
): AccessTemplate => ({
  type: 'cli',
  official: true,
  installCommand,
  binary,
  auth,
  ...(docsUrl ? { docsUrl } : {}),
})

const product = (
  key: string,
  productName: string,
  _summary: string,
  access: ReadonlyArray<AccessTemplate>,
  functions: ReadonlyArray<string>
): SeedProduct => ({
  companyKey: key.split('/')[0] ?? key,
  productName,
  access,
  functions,
})

const SEED_PRODUCTS: ReadonlyArray<SeedProduct> = [
  product(
    'brew/brew',
    'Brew',
    'Designs, sends and automates on-brand email for teams and agents.',
    [
      mcpRemote(
        'https://brew.new/api/mcp',
        oauth(),
        'https://brew.new/developers'
      ),
      api(
        'https://brew.new/api/v1',
        apiKey('BREW_API_KEY'),
        'https://brew.new/developers'
      ),
    ],
    ['send-email', 'build-audience', 'write-copy']
  ),

  product(
    'clay/clay',
    'Clay',
    'Enriches people and companies with data from many providers and builds lead lists from the results.',
    [api('https://api.clay.com', apiKey('CLAY_API_KEY'))],
    ['enrich-contacts', 'find-work-emails', 'build-audience']
  ),

  product(
    'apollo/apollo',
    'Apollo',
    'Finds contacts and work emails, enriches them, and runs outbound sequences.',
    [
      api(
        'https://api.apollo.io/v1',
        apiKey('APOLLO_API_KEY', { header: 'X-Api-Key' }),
        'https://docs.apollo.io'
      ),
    ],
    ['find-work-emails', 'enrich-contacts', 'build-audience', 'send-email']
  ),

  product(
    'attio/attio',
    'Attio',
    'A flexible CRM with a clean API for records, lists and deals.',
    [
      api(
        'https://api.attio.com/v2',
        apiKey('ATTIO_API_KEY'),
        'https://docs.attio.com'
      ),
    ],
    ['manage-crm', 'enrich-contacts']
  ),

  product(
    'hubspot/hubspot',
    'HubSpot',
    'CRM records, marketing email and sales sequences behind one API.',
    [
      api(
        'https://api.hubapi.com',
        apiKey('HUBSPOT_ACCESS_TOKEN'),
        'https://developers.hubspot.com'
      ),
    ],
    ['manage-crm', 'send-email', 'track-intent']
  ),

  product(
    'salesforce/salesforce',
    'Salesforce',
    'The system-of-record CRM for enterprise sales teams.',
    [],
    ['manage-crm']
  ),

  product(
    'slack/slack',
    'Slack',
    'Posts messages and routes alerts to the channel where the team already is.',
    [
      api(
        'https://slack.com/api',
        apiKey('SLACK_BOT_TOKEN'),
        'https://api.slack.com'
      ),
    ],
    ['route-alerts']
  ),

  product(
    'notion/notion',
    'Notion',
    'Reads and writes pages and databases that hold the playbook.',
    [
      mcpRemote(
        'https://mcp.notion.com/mcp',
        oauth(),
        'https://developers.notion.com'
      ),
      api(
        'https://api.notion.com/v1',
        apiKey('NOTION_API_KEY'),
        'https://developers.notion.com'
      ),
    ],
    ['manage-docs']
  ),

  product(
    'posthog/posthog',
    'PostHog',
    'Queries product events, sessions and feature flags.',
    [
      api(
        'https://us.posthog.com/api',
        apiKey('POSTHOG_API_KEY'),
        'https://posthog.com/docs/api'
      ),
    ],
    ['track-product-usage', 'track-intent']
  ),

  product(
    'amplitude/amplitude',
    'Amplitude',
    'Queries behavioral analytics across the funnel.',
    [
      api(
        'https://api2.amplitude.com',
        apiKey('AMPLITUDE_API_KEY'),
        'https://amplitude.com/docs/apis'
      ),
    ],
    ['track-product-usage']
  ),

  product(
    'mixpanel/mixpanel',
    'Mixpanel',
    'Queries conversion and retention on product events.',
    [
      api(
        'https://mixpanel.com/api',
        apiKey('MIXPANEL_SERVICE_ACCOUNT', { header: 'Authorization: Basic' }),
        'https://developer.mixpanel.com'
      ),
    ],
    ['track-product-usage']
  ),

  product(
    'metabase/metabase',
    'Metabase',
    'Runs saved questions and dashboards on your own database (self-hosted; the base URL is yours).',
    [],
    ['track-revenue']
  ),

  product(
    'crustdata/crustdata',
    'Crustdata',
    'Live company, headcount and hiring data.',
    [],
    ['research-accounts', 'enrich-contacts']
  ),

  product(
    'firecrawl/firecrawl',
    'Firecrawl',
    'Turns any URL into clean, LLM-ready markdown or structured data.',
    [
      mcpLocal(
        'npx -y firecrawl-mcp',
        apiKey('FIRECRAWL_API_KEY'),
        'https://github.com/mendableai/firecrawl-mcp-server'
      ),
      api(
        'https://api.firecrawl.dev/v1',
        apiKey('FIRECRAWL_API_KEY'),
        'https://docs.firecrawl.dev'
      ),
    ],
    ['scrape-web', 'research-accounts']
  ),

  product(
    'zoom/zoom',
    'Zoom',
    'Schedules meetings and webinars and reports who attended.',
    [api('https://api.zoom.us/v2', oauth(), 'https://developers.zoom.us')],
    ['host-meetings']
  ),

  product(
    'anthropic/claude',
    'Claude',
    'Drafts, reasons over context and classifies at scale; Claude Code runs it from the terminal.',
    [
      cli(
        'npm install -g @anthropic-ai/claude-code',
        'claude',
        oauth(),
        'https://docs.anthropic.com'
      ),
      api(
        'https://api.anthropic.com/v1',
        apiKey('ANTHROPIC_API_KEY', { header: 'x-api-key' }),
        'https://docs.anthropic.com'
      ),
    ],
    ['write-copy', 'classify-signals']
  ),

  product(
    'openai/openai',
    'OpenAI',
    'Generates and classifies text at scale.',
    [
      api(
        'https://api.openai.com/v1',
        apiKey('OPENAI_API_KEY'),
        'https://platform.openai.com/docs'
      ),
    ],
    ['write-copy', 'classify-signals']
  ),

  product(
    'figma/figma',
    'Figma',
    'Reads files, components and comments from design projects.',
    [
      mcpRemote(
        'https://mcp.figma.com/mcp',
        oauth(),
        'https://www.figma.com/developers/api'
      ),
      api(
        'https://api.figma.com/v1',
        apiKey('FIGMA_TOKEN', { header: 'X-Figma-Token' }),
        'https://www.figma.com/developers/api'
      ),
    ],
    ['design-assets']
  ),

  product(
    'canva/canva',
    'Canva',
    'Creates and exports designs from templates.',
    [
      api(
        'https://api.canva.com/rest/v1',
        oauth(),
        'https://www.canva.dev/docs/connect'
      ),
    ],
    ['design-assets']
  ),

  product(
    'dropbox/dropbox',
    'Dropbox',
    'Stores, finds and shares files.',
    [
      api(
        'https://api.dropboxapi.com/2',
        oauth(),
        'https://www.dropbox.com/developers/documentation'
      ),
    ],
    ['store-files']
  ),

  product(
    'github/github',
    'GitHub',
    'Repositories, issues, pull requests and CI, reachable three ways.',
    [
      mcpRemote(
        'https://api.githubcopilot.com/mcp/',
        oauth(),
        'https://docs.github.com/copilot'
      ),
      cli('brew install gh', 'gh', oauth(), 'https://cli.github.com/manual'),
      api(
        'https://api.github.com',
        apiKey('GITHUB_TOKEN'),
        'https://docs.github.com/rest'
      ),
    ],
    ['manage-code', 'route-alerts']
  ),

  product(
    'asana/asana',
    'Asana',
    'Creates and updates tasks and projects.',
    [
      api(
        'https://app.asana.com/api/1.0',
        apiKey('ASANA_ACCESS_TOKEN'),
        'https://developers.asana.com'
      ),
    ],
    ['manage-tasks']
  ),

  product(
    'trello/trello',
    'Trello',
    'Boards, lists and cards for tracking follow-up.',
    [],
    ['manage-tasks']
  ),

  product(
    'stripe/stripe',
    'Stripe',
    'Payments, subscriptions and invoices, with revenue events you can act on.',
    [
      mcpRemote('https://mcp.stripe.com', oauth(), 'https://docs.stripe.com'),
      cli(
        'brew install stripe/stripe-cli/stripe',
        'stripe',
        oauth(),
        'https://docs.stripe.com/stripe-cli'
      ),
      api(
        'https://api.stripe.com/v1',
        apiKey('STRIPE_SECRET_KEY'),
        'https://docs.stripe.com/api'
      ),
    ],
    ['collect-payments', 'track-revenue']
  ),

  product(
    'clerk/clerk',
    'Clerk',
    'Users, organizations and sessions, with sign-up events you can act on.',
    [
      api(
        'https://api.clerk.com/v1',
        apiKey('CLERK_SECRET_KEY'),
        'https://clerk.com/docs'
      ),
    ],
    ['authenticate-users']
  ),
]

/* ──────────────────────── products → one tool per function ───────────────── */

/** `enrich-contacts` → `enrich_contacts`, for MCP tool names. */
function underscored(slug: string): string {
  return slug.replace(/-/g, '_')
}

/**
 * The exact call, per way in. DERIVED, and the seed says so: a verified
 * listing carries the vendor's real endpoint or MCP tool name. What matters
 * here is that the shape is right — every way in names one operation, so a
 * file can never tell an agent "you have Clay" and stop.
 */
function withOperation(
  access: AccessTemplate,
  companyKey: string,
  slug: string
): Access {
  switch (access.type) {
    case 'mcp':
      return {
        ...access,
        operation: `${underscored(companyKey)}_${underscored(slug)}`,
      }
    case 'cli':
      return { ...access, operation: `${access.binary} ${slug}` }
    default:
      return { ...access, operation: `POST /${slug}` }
  }
}

/**
 * One tool per (product, function). The name and summary come from the
 * capability vocabulary in ./tags.ts, so a function is described once and the
 * tool listing, the tag and the search text cannot disagree.
 */
export const SEED_TOOLS: ReadonlyArray<SeedTool> = SEED_PRODUCTS.flatMap(
  (entry) =>
    entry.functions.flatMap((slug) => {
      const capability = CAPABILITY.get(slug)
      if (!capability) {
        throw new Error(
          `seed: ${entry.companyKey} declares the function "${slug}", which is not a capability tag in ./tags.ts`
        )
      }
      return [
        {
          key: `${entry.companyKey}/${slug}`,
          companyKey: entry.companyKey,
          name: capability.label,
          summary: `${capability.description} ${entry.productName} does this.`,
          access: entry.access.map((template) =>
            withOperation(template, entry.companyKey, slug)
          ),
        },
      ]
    })
)
