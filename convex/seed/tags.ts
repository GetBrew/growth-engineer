import type { TagNamespace } from '../model/keys'

/**
 * The managed tag list, as seeded. Tags come from this list; the community
 * proposes additions, and moderators approve, merge as synonyms, or reject.
 * The `agent` and `has` namespaces are DERIVED — computed from each tool's
 * access — and are seeded separately by the run so nobody can propose them.
 */
export type SeedTag = {
  namespace: TagNamespace
  slug: string
  label: string
  synonyms: ReadonlyArray<string>
  description: string
}

const tag = (
  namespace: TagNamespace,
  slug: string,
  label: string,
  synonyms: ReadonlyArray<string>,
  description: string
): SeedTag => ({ namespace, slug, label, synonyms, description })

export const SEED_TAGS: ReadonlyArray<SeedTag> = [
  // capability — what does it do?
  tag(
    'capability',
    'enrich-contacts',
    'Enrich contacts',
    ['enrich', 'enrichment', 'data enrichment', 'contact data'],
    'Adds firmographic and person data to a contact or account.'
  ),
  tag(
    'capability',
    'find-work-emails',
    'Find work emails',
    ['email finder', 'find emails', 'work email', 'email lookup'],
    'Finds and verifies a work email address for a person.'
  ),
  tag(
    'capability',
    'send-email',
    'Send email',
    ['sequencer', 'email sending', 'sending', 'campaigns'],
    'Sends one-off or sequenced email.'
  ),
  tag(
    'capability',
    'build-audience',
    'Build audiences',
    ['audience', 'audiences', 'list building', 'prospecting', 'segments'],
    'Builds a list of people or accounts from criteria.'
  ),
  tag(
    'capability',
    'track-intent',
    'Track intent',
    ['intent', 'intent data', 'buying signals', 'signals'],
    'Detects buying signals from behavior or third-party data.'
  ),
  tag(
    'capability',
    'track-product-usage',
    'Track product usage',
    ['product analytics', 'usage', 'events', 'behavior'],
    'Records and queries what users do in a product.'
  ),
  tag(
    'capability',
    'route-alerts',
    'Route alerts',
    ['alerts', 'notifications', 'routing', 'notify'],
    'Delivers a message to the right person or channel.'
  ),
  tag(
    'capability',
    'manage-crm',
    'Manage a CRM',
    ['crm', 'pipeline', 'deals', 'contacts'],
    'Creates and updates records in a system of record.'
  ),
  tag(
    'capability',
    'host-meetings',
    'Host meetings',
    ['meetings', 'video calls', 'webinars'],
    'Schedules and runs calls and webinars.'
  ),
  tag(
    'capability',
    'write-copy',
    'Write copy',
    ['copywriting', 'drafting', 'generate text', 'llm'],
    'Drafts or rewrites text from a brief.'
  ),
  tag(
    'capability',
    'classify-signals',
    'Classify signals',
    ['classification', 'scoring', 'triage'],
    'Sorts records or events into categories.'
  ),
  tag(
    'capability',
    'scrape-web',
    'Scrape the web',
    ['scraping', 'crawl', 'crawler', 'web data'],
    'Turns web pages into structured data.'
  ),
  tag(
    'capability',
    'research-accounts',
    'Research accounts',
    ['research', 'account research', 'company research'],
    'Gathers context about a company from public sources.'
  ),
  tag(
    'capability',
    'collect-payments',
    'Collect payments',
    ['payments', 'billing', 'subscriptions', 'checkout'],
    'Charges customers and manages subscriptions.'
  ),
  tag(
    'capability',
    'track-revenue',
    'Track revenue',
    ['revenue', 'mrr', 'arr', 'invoices'],
    'Reports on money collected.'
  ),
  tag(
    'capability',
    'authenticate-users',
    'Authenticate users',
    ['auth', 'authentication', 'login', 'sign up'],
    'Signs users in and manages their sessions.'
  ),
  tag(
    'capability',
    'design-assets',
    'Design assets',
    ['design', 'graphics', 'creative', 'mockups'],
    'Creates visual assets.'
  ),
  tag(
    'capability',
    'manage-tasks',
    'Manage tasks',
    ['tasks', 'projects', 'tickets'],
    'Tracks work items to completion.'
  ),
  tag(
    'capability',
    'store-files',
    'Store files',
    ['files', 'storage', 'documents'],
    'Stores and shares files.'
  ),
  tag(
    'capability',
    'manage-code',
    'Manage code',
    ['code', 'repositories', 'pull requests', 'issues'],
    'Hosts repositories, issues and pull requests.'
  ),
  tag(
    'capability',
    'manage-docs',
    'Manage docs',
    ['docs', 'notes', 'wiki', 'knowledge base'],
    'Writes and organizes documents.'
  ),

  // motion — which go-to-market motion?
  tag(
    'motion',
    'outbound',
    'Outbound',
    ['outbound', 'cold', 'cold outbound', 'cold email'],
    'Reaching out first to people who have not engaged yet.'
  ),
  tag(
    'motion',
    'inbound',
    'Inbound',
    ['inbound', 'warm inbound', 'leads'],
    'Following up with people who came to you.'
  ),
  tag(
    'motion',
    'midbound',
    'Midbound',
    ['midbound', 'website visitors', 'product signals', 'expansion'],
    'Acting on signals from existing users and visitors.'
  ),
  tag(
    'motion',
    'plg',
    'Product-led',
    ['plg', 'product led', 'self serve'],
    'Growth driven by product usage.'
  ),
  tag(
    'motion',
    'abm',
    'Account-based',
    ['abm', 'account based', 'named accounts'],
    'Coordinated plays against a named account list.'
  ),

  // channel — where does it act?
  tag('channel', 'email', 'Email', ['email'], 'Acts over email.'),
  tag('channel', 'linkedin', 'LinkedIn', ['linkedin'], 'Acts on LinkedIn.'),
  tag(
    'channel',
    'phone',
    'Phone',
    ['phone', 'calls', 'dialer'],
    'Acts by phone.'
  ),
  tag(
    'channel',
    'ads',
    'Ads',
    ['ads', 'paid', 'advertising'],
    'Acts through paid media.'
  ),
  tag(
    'channel',
    'website',
    'Website',
    ['website', 'web', 'landing page'],
    'Acts on your own site.'
  ),
  tag(
    'channel',
    'chat',
    'Chat',
    ['chat', 'slack', 'teams', 'messaging'],
    'Acts in a chat tool.'
  ),

  // category — what kind of product is it?
  tag(
    'category',
    'crm',
    'CRM',
    ['crm', 'pipeline'],
    'Systems of record for customers and deals.'
  ),
  tag(
    'category',
    'data-provider',
    'Data provider',
    ['data', 'enrichment provider', 'contact database'],
    'Sources of company and contact data.'
  ),
  tag(
    'category',
    'email',
    'Email platform',
    ['email platform', 'esp', 'sequencer'],
    'Tools that design, send and automate email.'
  ),
  tag(
    'category',
    'intent',
    'Intent',
    ['intent data', 'signals'],
    'Tools that surface buying intent.'
  ),
  tag(
    'category',
    'product-analytics',
    'Product analytics',
    ['analytics', 'product analytics', 'bi'],
    'Tools that measure product behavior.'
  ),
  tag(
    'category',
    'ai-model',
    'AI model',
    ['llm', 'ai', 'model', 'copilot'],
    'Language models and the tools built on them.'
  ),
  tag(
    'category',
    'design',
    'Design',
    ['design tool', 'creative'],
    'Tools for visual work.'
  ),
  tag(
    'category',
    'project-management',
    'Project management',
    ['project management', 'tasks'],
    'Tools that track work.'
  ),
  tag(
    'category',
    'payments',
    'Payments',
    ['payments', 'billing'],
    'Tools that move money.'
  ),
  tag(
    'category',
    'auth',
    'Auth',
    ['auth', 'identity'],
    'Tools that sign users in.'
  ),
  tag(
    'category',
    'scraper',
    'Scraper',
    ['scraper', 'crawler', 'web data'],
    'Tools that turn the web into data.'
  ),
  tag(
    'category',
    'messaging',
    'Messaging',
    ['messaging', 'chat', 'notifications'],
    'Tools people talk in.'
  ),
  tag(
    'category',
    'docs',
    'Docs',
    ['docs', 'wiki', 'notes'],
    'Tools that hold written knowledge.'
  ),
  tag(
    'category',
    'video',
    'Video',
    ['video', 'meetings', 'webinars'],
    'Tools that run calls.'
  ),
  tag(
    'category',
    'storage',
    'Storage',
    ['storage', 'files'],
    'Tools that hold files.'
  ),
  tag(
    'category',
    'code',
    'Code',
    ['code', 'git', 'repositories'],
    'Tools developers ship from.'
  ),

  // fit — who is it good for?
  tag(
    'fit',
    'b2b-saas',
    'B2B SaaS',
    ['saas', 'b2b'],
    'Software companies selling to companies.'
  ),
  tag(
    'fit',
    'agencies',
    'Agencies',
    ['agency', 'agencies', 'consultants'],
    'Teams running growth for clients.'
  ),
  tag(
    'fit',
    'smb',
    'SMB',
    ['smb', 'small business', 'startups'],
    'Small teams with small budgets.'
  ),
  tag(
    'fit',
    'enterprise',
    'Enterprise',
    ['enterprise', 'large companies'],
    'Large organizations with procurement.'
  ),
]

/** Derived namespaces: system-only, one tag per possible value. */
export const DERIVED_TAGS: ReadonlyArray<SeedTag> = [
  tag(
    'agent',
    'unverified',
    'Agent: unverified',
    [],
    'Nobody has checked the access facts yet.'
  ),
  tag(
    'agent',
    'native',
    'Agent: native',
    ['agent native'],
    'Official MCP or CLI with self-serve credentials.'
  ),
  tag(
    'agent',
    'friendly',
    'Agent: friendly',
    ['agent friendly'],
    'Official API with self-serve credentials.'
  ),
  tag(
    'agent',
    'possible',
    'Agent: possible',
    ['agent possible'],
    'Community access only, or official access behind approval.'
  ),
  tag(
    'has',
    'mcp',
    'Has MCP',
    ['mcp'],
    'Reachable over the Model Context Protocol.'
  ),
  tag('has', 'cli', 'Has CLI', ['cli'], 'Reachable from a command line.'),
  tag('has', 'api', 'Has API', ['api'], 'Reachable over HTTP.'),
]
