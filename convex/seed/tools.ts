import type { Doc } from '../_generated/dataModel'

/**
 * Seed tools: one per company, keyed `<company>/<product>`.
 *
 * ILLUSTRATIVE AND UNVERIFIED. Every access entry below is a widely
 * documented public endpoint or install command, but nobody has run a check
 * against it, so the run seeds every tool as `agent: unverified` (`checkedAt`
 * undefined). A tool with no way in we would put our name to has an empty
 * `access` list and is seeded `in_review`: it cannot be published until one
 * is verified, but its company still lists.
 */

export type Access = Doc<'tools'>['access'][number]
type Auth = Access['auth']

export type SeedTool = {
  key: string
  companyKey: string
  name: string
  summary: string
  description?: string
  access: ReadonlyArray<Access>
  /** `capability:<slug>` tags. */
  capabilities: ReadonlyArray<string>
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

const api = (baseUrl: string, auth: Auth, docsUrl?: string): Access => ({
  type: 'api',
  official: true,
  auth,
  baseUrl,
  ...(docsUrl ? { docsUrl } : {}),
})

const mcpRemote = (url: string, auth: Auth, docsUrl?: string): Access => ({
  type: 'mcp',
  official: true,
  transport: 'remote',
  url,
  auth,
  ...(docsUrl ? { docsUrl } : {}),
})

const mcpLocal = (command: string, auth: Auth, repoUrl?: string): Access => ({
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
): Access => ({
  type: 'cli',
  official: true,
  installCommand,
  binary,
  auth,
  ...(docsUrl ? { docsUrl } : {}),
})

const tool = (
  key: string,
  name: string,
  summary: string,
  access: ReadonlyArray<Access>,
  capabilities: ReadonlyArray<string>,
  description?: string
): SeedTool => ({
  key,
  companyKey: key.split('/')[0] ?? key,
  name,
  summary,
  access,
  capabilities,
  ...(description ? { description } : {}),
})

export const SEED_TOOLS: ReadonlyArray<SeedTool> = [
  tool(
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

  tool(
    'clay/clay',
    'Clay',
    'Enriches people and companies with data from many providers and builds lead lists from the results.',
    [api('https://api.clay.com', apiKey('CLAY_API_KEY'))],
    ['enrich-contacts', 'find-work-emails', 'build-audience']
  ),

  tool(
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

  tool(
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

  tool(
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

  tool(
    'salesforce/salesforce',
    'Salesforce',
    'The system-of-record CRM for enterprise sales teams.',
    [],
    ['manage-crm']
  ),

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
    'metabase/metabase',
    'Metabase',
    'Runs saved questions and dashboards on your own database (self-hosted; the base URL is yours).',
    [],
    ['track-revenue']
  ),

  tool(
    'crustdata/crustdata',
    'Crustdata',
    'Live company, headcount and hiring data.',
    [],
    ['research-accounts', 'enrich-contacts']
  ),

  tool(
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

  tool(
    'zoom/zoom',
    'Zoom',
    'Schedules meetings and webinars and reports who attended.',
    [api('https://api.zoom.us/v2', oauth(), 'https://developers.zoom.us')],
    ['host-meetings']
  ),

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
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

  tool(
    'trello/trello',
    'Trello',
    'Boards, lists and cards for tracking follow-up.',
    [],
    ['manage-tasks']
  ),

  tool(
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

  tool(
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
