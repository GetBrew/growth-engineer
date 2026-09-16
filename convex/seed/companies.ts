/**
 * Seed companies. ILLUSTRATIVE: real vendors, real domains and websites, but
 * the taglines are ours and nothing here has been verified by a person — every
 * seeded tool is `agent: unverified` for that reason. Logos are the local
 * brand marks under public/logos until the logo job replaces them.
 */
export type SeedCompany = {
  key: string
  name: string
  domain: string
  /** `category:<slug>` tag the company directory groups by. */
  category: string
  tagline: string
  description?: string
  website: string
  docs?: string
  github?: string
  /** File under public/logos. */
  logo: string
}

const company = (
  key: string,
  name: string,
  domain: string,
  category: string,
  tagline: string,
  logo: string,
  links: { docs?: string; github?: string; description?: string } = {}
): SeedCompany => ({
  key,
  name,
  domain,
  category,
  tagline,
  website: `https://${domain}`,
  logo,
  ...links,
})

export const SEED_COMPANIES: ReadonlyArray<SeedCompany> = [
  company(
    'brew',
    'Brew',
    'brew.new',
    'email',
    'Email for modern teams and agents: design, send and automate on-brand campaigns and lifecycle flows.',
    'brew.jpeg',
    {
      docs: 'https://brew.new/developers',
      description:
        'Brew builds and sends beautiful, on-brand email campaigns and lifecycle automations, with an MCP server and API so agents can run the whole loop.',
    }
  ),
  company(
    'clay',
    'Clay',
    'clay.com',
    'data-provider',
    'Enrich people and companies with data from many providers, then build lists from the results.',
    'clay.jpeg'
  ),
  company(
    'apollo',
    'Apollo',
    'apollo.io',
    'data-provider',
    'Contact data, work emails and outbound sequences in one place.',
    'apollo.jpeg',
    {
      docs: 'https://docs.apollo.io',
    }
  ),
  company(
    'attio',
    'Attio',
    'attio.com',
    'crm',
    'A CRM you can shape to your process in an afternoon.',
    'attio.webp',
    {
      docs: 'https://docs.attio.com',
    }
  ),
  company(
    'hubspot',
    'HubSpot',
    'hubspot.com',
    'crm',
    'CRM, marketing and sales tooling for teams that want one system.',
    'hubspot.png',
    {
      docs: 'https://developers.hubspot.com',
    }
  ),
  company(
    'salesforce',
    'Salesforce',
    'salesforce.com',
    'crm',
    'The system of record for enterprise sales teams.',
    'salesforce.svg'
  ),
  company(
    'slack',
    'Slack',
    'slack.com',
    'messaging',
    'Where the team already is — route signals to the right channel.',
    'slack.svg',
    {
      docs: 'https://api.slack.com',
    }
  ),
  company(
    'notion',
    'Notion',
    'notion.so',
    'docs',
    'Docs, wikis and lightweight databases for the whole playbook.',
    'notion.svg',
    {
      docs: 'https://developers.notion.com',
    }
  ),
  company(
    'posthog',
    'PostHog',
    'posthog.com',
    'product-analytics',
    'Product analytics, session replay and feature flags, self-serve.',
    'posthog.svg',
    {
      docs: 'https://posthog.com/docs',
      github: 'https://github.com/PostHog/posthog',
    }
  ),
  company(
    'amplitude',
    'Amplitude',
    'amplitude.com',
    'product-analytics',
    'Behavioral analytics across the funnel.',
    'amplitude.svg',
    {
      docs: 'https://amplitude.com/docs',
    }
  ),
  company(
    'mixpanel',
    'Mixpanel',
    'mixpanel.com',
    'product-analytics',
    'Conversion and retention analytics on product events.',
    'mixpanel.png',
    {
      docs: 'https://developer.mixpanel.com',
    }
  ),
  company(
    'metabase',
    'Metabase',
    'metabase.com',
    'product-analytics',
    'Open-source BI: questions and dashboards on your own database.',
    'metabase.svg',
    {
      github: 'https://github.com/metabase/metabase',
    }
  ),
  company(
    'crustdata',
    'Crustdata',
    'crustdata.com',
    'data-provider',
    'Live company, headcount and hiring data.',
    'crustdata.jpeg'
  ),
  company(
    'firecrawl',
    'Firecrawl',
    'firecrawl.dev',
    'scraper',
    'Turn any URL into clean, LLM-ready markdown or structured data.',
    'firecrawl.svg',
    {
      docs: 'https://docs.firecrawl.dev',
      github: 'https://github.com/mendableai/firecrawl',
    }
  ),
  company(
    'zoom',
    'Zoom',
    'zoom.us',
    'video',
    'Book and run the call, then work the attendance list.',
    'zoom.svg',
    {
      docs: 'https://developers.zoom.us',
    }
  ),
  company(
    'anthropic',
    'Anthropic',
    'anthropic.com',
    'ai-model',
    'Claude: models and agent tooling for drafting, reasoning and classification.',
    'anthropic.svg',
    {
      docs: 'https://docs.anthropic.com',
    }
  ),
  company(
    'openai',
    'OpenAI',
    'openai.com',
    'ai-model',
    'Models and APIs to generate and classify at scale.',
    'openai.svg',
    {
      docs: 'https://platform.openai.com/docs',
    }
  ),
  company(
    'figma',
    'Figma',
    'figma.com',
    'design',
    'Design the asset that ships.',
    'figma.svg',
    {
      docs: 'https://www.figma.com/developers/api',
    }
  ),
  company(
    'canva',
    'Canva',
    'canva.com',
    'design',
    'Create, review and edit designs without a designer in the loop.',
    'canva.svg',
    {
      docs: 'https://www.canva.dev/docs/connect',
    }
  ),
  company(
    'dropbox',
    'Dropbox',
    'dropbox.com',
    'storage',
    'Find, share and act on files.',
    'dropbox.svg',
    {
      docs: 'https://www.dropbox.com/developers/documentation',
    }
  ),
  company(
    'github',
    'GitHub',
    'github.com',
    'code',
    'Triage pull requests, issues and CI where the code lives.',
    'github.svg',
    {
      docs: 'https://docs.github.com/rest',
    }
  ),
  company(
    'asana',
    'Asana',
    'asana.com',
    'project-management',
    'Turn a signal into a task somebody owns.',
    'asana.svg',
    {
      docs: 'https://developers.asana.com',
    }
  ),
  company(
    'trello',
    'Trello',
    'trello.com',
    'project-management',
    'Track the follow-up on a board.',
    'trello.svg',
    {
      docs: 'https://developer.atlassian.com/cloud/trello',
    }
  ),
  company(
    'stripe',
    'Stripe',
    'stripe.com',
    'payments',
    'Accept payments and run subscriptions; revenue events as triggers.',
    'stripe.svg',
    {
      docs: 'https://docs.stripe.com',
    }
  ),
  company(
    'clerk',
    'Clerk',
    'clerk.com',
    'auth',
    'Authentication and user management; sign-up events as triggers.',
    'clerk.svg',
    {
      docs: 'https://clerk.com/docs',
    }
  ),
]
