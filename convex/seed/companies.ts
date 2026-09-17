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
    'brew.svg',
    {
      docs: 'https://brew.new/developers',
      description:
        "Brew is an AI-driven email marketing platform that learns your brand's colors, fonts, voice, and reference emails to generate on-brand email drafts from plain-language prompts.",
    }
  ),
  company(
    'clay',
    'Clay',
    'clay.com',
    'data-provider',
    'Enrich people and companies with data from many providers, then build lists from the results.',
    'clay.png',
    {
      description:
        'Clay is a go-to-market data platform that centralizes first- and third-party data, offers more than 200 data providers, and delivers real-time signals such as job changes and promotions.',
    }
  ),
  company(
    'apollo',
    'Apollo',
    'apollo.io',
    'data-provider',
    'Contact data, work emails and outbound sequences in one place.',
    'apollo.webp',
    {
      docs: 'https://docs.apollo.io',
      description:
        'Apollo.io is an AI-driven sales and revenue platform that helps modern B2B teams find, engage, and close prospects faster.',
    }
  ),
  company(
    'attio',
    'Attio',
    'attio.com',
    'crm',
    'A CRM you can shape to your process in an afternoon.',
    'attio.png',
    {
      docs: 'https://docs.attio.com',
      description:
        'Attio is an AI-native CRM platform that orchestrates revenue-focused workflows, agents, and automations to build pipelines, advance deals, and grow accounts.',
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
      description:
        'HubSpot is a unified customer platform that combines marketing, sales, service, content, data, and revenue tools into a single AI-enhanced ecosystem.',
    }
  ),
  company(
    'salesforce',
    'Salesforce',
    'salesforce.com',
    'crm',
    'The system of record for enterprise sales teams.',
    'salesforce.png',
    {
      description:
        'Salesforce is a cloud-based software company that provides a comprehensive customer relationship management platform.',
    }
  ),
  company(
    'slack',
    'Slack',
    'slack.com',
    'messaging',
    'Where the team already is — route signals to the right channel.',
    'slack.jpg',
    {
      docs: 'https://api.slack.com',
      description:
        'Slack is a collaboration platform that unifies messaging, file sharing, and workflow automation for teams of all sizes.',
    }
  ),
  company(
    'notion',
    'Notion',
    'notion.so',
    'docs',
    'Docs, wikis and lightweight databases for the whole playbook.',
    'notion.png',
    {
      docs: 'https://developers.notion.com',
      description:
        'Notion provides an AI-enhanced workspace that unifies note-taking, project management, and knowledge sharing.',
    }
  ),
  company(
    'posthog',
    'PostHog',
    'posthog.com',
    'product-analytics',
    'Product analytics, session replay and feature flags, self-serve.',
    'posthog.jpg',
    {
      docs: 'https://posthog.com/docs',
      github: 'https://github.com/PostHog/posthog',
      description:
        'PostHog is a product analytics platform that provides self-driving product capabilities.',
    }
  ),
  company(
    'amplitude',
    'Amplitude',
    'amplitude.com',
    'product-analytics',
    'Behavioral analytics across the funnel.',
    'amplitude.jpg',
    {
      docs: 'https://amplitude.com/docs',
      description:
        'Amplitude is an AI-powered product analytics platform that helps businesses understand user behavior, optimize experiences, and drive growth.',
    }
  ),
  company(
    'mixpanel',
    'Mixpanel',
    'mixpanel.com',
    'product-analytics',
    'Conversion and retention analytics on product events.',
    'mixpanel.jpg',
    {
      docs: 'https://developer.mixpanel.com',
      description:
        'Mixpanel is a product analytics platform that enables teams to track, analyze, and act on user behavior across web, mobile, and other digital experiences.',
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
      description:
        'Metabase is an open-source analytics platform that enables data teams and their customers to explore, visualize, and share data securely.',
    }
  ),
  company(
    'crustdata',
    'Crustdata',
    'crustdata.com',
    'data-provider',
    'Live company, headcount and hiring data.',
    'crustdata.png',
    {
      description:
        'Crustdata provides real-time, enriched people and company data for AI-driven sales, recruiting, investment, and other enterprise workflows.',
    }
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
      description:
        'Firecrawl is a web-data infrastructure platform that enables AI systems and agents to search, scrape, and interact with live web content at scale.',
    }
  ),
  company(
    'zoom',
    'Zoom',
    'zoom.us',
    'video',
    'Book and run the call, then work the attendance list.',
    'zoom.jpg',
    {
      docs: 'https://developers.zoom.us',
      description:
        'Zoom is a global communications platform that provides video conferencing, online meetings, chat, phone, and webinar solutions for individuals and businesses.',
    }
  ),
  company(
    'anthropic',
    'Anthropic',
    'anthropic.com',
    'ai-model',
    'Claude: models and agent tooling for drafting, reasoning and classification.',
    'anthropic.png',
    {
      docs: 'https://docs.anthropic.com',
      description:
        "Claude is Anthropic's AI assistant for conversation, reasoning, code generation, collaboration, and connected work.",
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
      description:
        'OpenAI is a research-driven AI company that develops advanced machine-learning models and products, including ChatGPT and tools for developers, businesses, and educators.',
    }
  ),
  company(
    'figma',
    'Figma',
    'figma.com',
    'design',
    'Design the asset that ships.',
    'figma.png',
    {
      docs: 'https://www.figma.com/developers/api',
      description:
        'Figma is a cloud-based collaborative platform that unifies design, prototyping, development, and presentation tools in a single AI-native workspace.',
    }
  ),
  company(
    'canva',
    'Canva',
    'canva.com',
    'design',
    'Create, review and edit designs without a designer in the loop.',
    'canva.jpg',
    {
      docs: 'https://www.canva.dev/docs/connect',
      description:
        'Canva is a cloud-based design platform that helps individuals and teams create professional graphics, presentations, videos, documents, and marketing assets.',
    }
  ),
  company(
    'dropbox',
    'Dropbox',
    'dropbox.com',
    'storage',
    'Find, share and act on files.',
    'dropbox.png',
    {
      docs: 'https://www.dropbox.com/developers/documentation',
      description:
        'Dropbox is a cloud-based platform that lets individuals and teams store, organize, and share files securely across devices.',
    }
  ),
  company(
    'github',
    'GitHub',
    'github.com',
    'code',
    'Triage pull requests, issues and CI where the code lives.',
    'github.png',
    {
      docs: 'https://docs.github.com/rest',
      description:
        'GitHub is a global developer platform that hosts source code, facilitates collaboration, and provides AI-powered tools to accelerate software creation.',
    }
  ),
  company(
    'asana',
    'Asana',
    'asana.com',
    'project-management',
    'Turn a signal into a task somebody owns.',
    'asana.png',
    {
      docs: 'https://developers.asana.com',
      description:
        'Asana is an enterprise work-management platform that helps cross-functional teams plan, track, and execute projects.',
    }
  ),
  company(
    'trello',
    'Trello',
    'trello.com',
    'project-management',
    'Track the follow-up on a board.',
    'trello.png',
    {
      docs: 'https://developer.atlassian.com/cloud/trello',
      description:
        'Trello is a visual collaboration platform that helps teams organize work, track projects, and streamline workflows using boards, lists, and cards.',
    }
  ),
  company(
    'stripe',
    'Stripe',
    'stripe.com',
    'payments',
    'Accept payments and run subscriptions; revenue events as triggers.',
    'stripe.jpg',
    {
      docs: 'https://docs.stripe.com',
      description:
        'Stripe is a global financial infrastructure platform that enables businesses of all sizes to accept payments, manage billing, and build custom revenue models.',
    }
  ),
  company(
    'clerk',
    'Clerk',
    'clerk.com',
    'auth',
    'Authentication and user management; sign-up events as triggers.',
    'clerk.png',
    {
      docs: 'https://clerk.com/docs',
      description:
        'Clerk is a developer-focused platform that provides complete user management and authentication solutions.',
    }
  ),
]
