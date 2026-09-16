import type { Doc } from '../_generated/dataModel'

/**
 * Seed workflows, owned by Brew (`brew/<name>`), phrased as the result they
 * reach. ILLUSTRATIVE: they show the file format end to end and give the
 * catalog something to list; they are not field-tested playbooks. The two
 * single-tool entries at the end are growth hacks — same format, one tool.
 *
 * Trending and Top are seeded from this order (first = highest) until the
 * ranking job has real copies and agent fetches to count.
 */
export type SeedWorkflow = {
  key: string
  title: string
  summary: string
  /** Tag keys: `motion:*`, `channel:*`, `capability:*`. */
  tags: ReadonlyArray<string>
  inputs: ReadonlyArray<{ name: string; description: string; example?: string }>
  steps: ReadonlyArray<{
    title: string
    toolKey: string
    instruction: string
    via?: Doc<'tools'>['access'][number]['type']
  }>
  doneWhen: ReadonlyArray<string>
  notes?: string
}

const step = (
  title: string,
  toolKey: string,
  instruction: string,
  via?: SeedWorkflow['steps'][number]['via']
) => ({ title, toolKey, instruction, ...(via ? { via } : {}) })

export const SEED_WORKFLOWS: ReadonlyArray<SeedWorkflow> = [
  {
    key: 'brew/funding-signal-outbound',
    title: 'Turn fresh funding news into qualified outbound',
    summary:
      'Find recently funded teams, enrich the right buyers, and send a relevant message while the signal is still fresh.',
    tags: [
      'motion:outbound',
      'channel:email',
      'capability:enrich-contacts',
      'capability:find-work-emails',
      'capability:send-email',
    ],
    inputs: [
      {
        name: 'target_segment',
        description: 'the kind of company to watch',
        example: 'Series A B2B SaaS in the US',
      },
      { name: 'sender_email', description: 'the address emails are sent from' },
    ],
    steps: [
      step(
        'Find funded companies',
        'clay/clay',
        'List companies matching `target_segment` that announced a round in the last 30 days. Keep name, domain, round and amount.'
      ),
      step(
        'Find the buyer',
        'apollo/apollo',
        'For each company, find the head of growth or marketing. Keep their name, title and work email; skip companies with no match.'
      ),
      step(
        'Write emails',
        'brew/brew',
        'Draft a three-sentence email per contact: congratulate the round, name one thing they will now have budget for, ask one question. Show the drafts to the user.'
      ),
      step(
        'Send',
        'brew/brew',
        'After the user approves, send each email from `sender_email`.'
      ),
    ],
    doneWhen: [
      'Every funded company has a contact, or a note explaining why not.',
      'Approved emails are sent, and the user has a summary table.',
    ],
  },
  {
    key: 'brew/executive-job-change',
    title: 'Reach new executives in their first 90 days',
    summary:
      'Track leadership changes and open a thoughtful conversation while new priorities and budgets are being set.',
    tags: [
      'motion:outbound',
      'channel:email',
      'capability:find-work-emails',
      'capability:write-copy',
      'capability:manage-crm',
    ],
    inputs: [
      {
        name: 'target_titles',
        description: 'the roles to watch',
        example: 'VP Marketing, Head of Growth',
      },
      {
        name: 'target_accounts',
        description: 'company domains to watch',
        example: 'acme.example, globex.example',
      },
    ],
    steps: [
      step(
        'Find new leaders',
        'apollo/apollo',
        'Across `target_accounts`, find people with `target_titles` who started in the last 90 days. Keep name, title, start date and work email.'
      ),
      step(
        'Draft a note',
        'anthropic/claude',
        'For each person, draft three lines about what a leader in that role usually fixes first. No pitch. Show the drafts to the user.'
      ),
      step(
        'Log it',
        'hubspot/hubspot',
        'Create or update each contact and attach the approved draft as a note on the record.'
      ),
    ],
    doneWhen: [
      'Every new leader has a contact record with a note.',
      'The user has the list with start dates.',
    ],
  },
  {
    key: 'brew/competitor-intent',
    title: 'Follow up when accounts research a competitor',
    summary:
      'Combine what a competitor just shipped with which of your accounts are looking, then send a focused comparison.',
    tags: [
      'motion:outbound',
      'channel:email',
      'capability:scrape-web',
      'capability:manage-crm',
      'capability:write-copy',
    ],
    inputs: [
      {
        name: 'competitor_domain',
        description: 'the competitor to watch',
        example: 'competitor.example',
      },
      { name: 'watch_list', description: 'account domains with an open deal' },
    ],
    steps: [
      step(
        'Read what changed',
        'firecrawl/firecrawl',
        'Fetch the pricing and changelog pages on `competitor_domain` and summarise what changed in the last month in five bullets.'
      ),
      step(
        'Match open deals',
        'attio/attio',
        'Find records in `watch_list` with an open deal. Keep the deal owner and stage.'
      ),
      step(
        'Write the comparison',
        'brew/brew',
        'Draft one email per account that names a single concrete difference relevant to its stage. Show the drafts to the user; send only after approval.'
      ),
    ],
    doneWhen: [
      'The user has the five-bullet competitor summary.',
      'Every open deal has a drafted, approved or declined email.',
    ],
  },
  {
    key: 'brew/high-intent-visitors',
    title: 'Route high-intent website visitors in real time',
    summary:
      'Identify promising accounts on your site, enrich them, and tell the right owner with useful context.',
    tags: [
      'motion:midbound',
      'channel:website',
      'channel:chat',
      'capability:track-intent',
      'capability:enrich-contacts',
      'capability:route-alerts',
    ],
    inputs: [
      {
        name: 'pricing_path',
        description: 'the page that signals intent',
        example: '/pricing',
      },
      {
        name: 'alerts_channel',
        description: 'where to post',
        example: '#sales-signals',
      },
    ],
    steps: [
      step(
        'Find repeat visitors',
        'posthog/posthog',
        'List identified accounts that viewed `pricing_path` at least twice in the last 7 days.'
      ),
      step(
        'Enrich',
        'clay/clay',
        'For each account domain, add company size, industry and any open hiring for sales or marketing.'
      ),
      step(
        'Alert',
        'slack/slack',
        'Post one message per account to `alerts_channel` with the enrichment and a suggested owner. Ask the user before posting the first one.'
      ),
    ],
    doneWhen: [
      'Every qualifying account was posted once, with no duplicates.',
      'The user has the list of accounts and suggested owners.',
    ],
  },
  {
    key: 'brew/content-download-nurture',
    title: 'Turn content downloads into useful conversations',
    summary:
      'Personalise the follow-up around what someone read instead of dropping every lead into the same sequence.',
    tags: [
      'motion:inbound',
      'channel:email',
      'capability:manage-crm',
      'capability:send-email',
      'capability:manage-docs',
    ],
    inputs: [
      {
        name: 'content_asset',
        description: 'the asset that was downloaded',
        example: 'The 2026 outbound benchmark',
      },
      {
        name: 'follow_up_window',
        description: 'how far back to look',
        example: '3 days',
      },
    ],
    steps: [
      step(
        'Pull downloads',
        'hubspot/hubspot',
        'List contacts who downloaded `content_asset` within `follow_up_window`. Keep name, company and email.'
      ),
      step(
        'Write follow-ups',
        'brew/brew',
        'Draft one email per contact that references a specific section of the asset. Show the drafts to the user; send only after approval.'
      ),
      step(
        'Log the send',
        'notion/notion',
        'Append one row per sent email to the nurture log database with contact, asset and date.'
      ),
    ],
    doneWhen: [
      'Every download in the window has a follow-up sent or declined.',
      'The nurture log has one row per send.',
    ],
  },
  {
    key: 'brew/webinar-follow-up',
    title: 'Create a webinar follow-up that reflects attendance',
    summary:
      'Send different next steps to attendees, no-shows and highly engaged viewers without manual list work.',
    tags: [
      'motion:inbound',
      'channel:email',
      'capability:host-meetings',
      'capability:send-email',
      'capability:manage-crm',
    ],
    inputs: [{ name: 'webinar_id', description: 'the webinar to work from' }],
    steps: [
      step(
        'Split the audience',
        'zoom/zoom',
        'From `webinar_id`, build three lists: attended, did not attend, and attended for 40 minutes or more.'
      ),
      step(
        'Write three emails',
        'brew/brew',
        'Draft one email per list: the recording for no-shows, the next step for attendees, a call offer for the engaged. Show the drafts to the user.'
      ),
      step(
        'Tag contacts',
        'hubspot/hubspot',
        'Set a contact property with the list each person landed in, then send the approved emails.'
      ),
    ],
    doneWhen: [
      'Every registrant is in exactly one list.',
      'Approved emails are sent and the property is set.',
    ],
  },
  {
    key: 'brew/product-qualified-expansion',
    title: 'Surface product-qualified expansion opportunities',
    summary:
      'Watch account usage, flag teams approaching meaningful limits, and give sales a clear reason to engage.',
    tags: [
      'motion:midbound',
      'motion:plg',
      'channel:email',
      'capability:track-product-usage',
      'capability:manage-crm',
      'capability:send-email',
    ],
    inputs: [
      {
        name: 'usage_threshold',
        description: 'the weekly active users that signal a bigger team',
        example: '25',
      },
      {
        name: 'plan_limit',
        description: 'the plan limit accounts approach',
        example: '10 seats',
      },
    ],
    steps: [
      step(
        'Find accounts near the line',
        'amplitude/amplitude',
        'List accounts whose weekly active users crossed `usage_threshold` or reached 80% of `plan_limit` in the last 14 days.'
      ),
      step(
        'Mark them',
        'attio/attio',
        'Set each company record to expansion-ready with the metric and the date.'
      ),
      step(
        'Brief the owner',
        'brew/brew',
        'Send each account owner one email listing their expansion-ready accounts with the numbers. Ask the user before sending.'
      ),
    ],
    doneWhen: [
      'Every account over the line is marked in the CRM.',
      'Each owner received one summary.',
    ],
  },
  {
    key: 'brew/free-to-paid-activation',
    title: 'Guide active free users toward their first paid moment',
    summary:
      'Combine behavioural milestones with timely education so promising users find the value before momentum fades.',
    tags: [
      'motion:plg',
      'channel:email',
      'capability:track-product-usage',
      'capability:collect-payments',
      'capability:send-email',
    ],
    inputs: [
      {
        name: 'activation_event',
        description: 'the event that marks real usage',
        example: 'campaign_sent',
      },
      {
        name: 'trial_plan',
        description: 'the plan to offer',
        example: 'Pro, 14-day trial',
      },
    ],
    steps: [
      step(
        'Find activated free users',
        'posthog/posthog',
        'List users on the free plan who fired `activation_event` three or more times in the last 14 days.'
      ),
      step(
        'Skip paying customers',
        'stripe/stripe',
        'Remove anyone with an active subscription.'
      ),
      step(
        'Send the sequence',
        'brew/brew',
        'Draft a two-email sequence explaining `trial_plan` around what they already did. Show it to the user; send after approval.'
      ),
    ],
    doneWhen: [
      'No paying customer received the sequence.',
      'The user has the count of users enrolled.',
    ],
  },
  {
    key: 'brew/at-risk-customer-rescue',
    title: 'Spot and recover at-risk customer accounts',
    summary:
      'Detect meaningful usage drops, assemble the account story, and trigger a human check-in before renewal risk grows.',
    tags: [
      'motion:midbound',
      'channel:chat',
      'channel:email',
      'capability:track-product-usage',
      'capability:route-alerts',
      'capability:write-copy',
    ],
    inputs: [
      {
        name: 'drop_threshold',
        description: 'the usage drop that counts',
        example: '40%',
      },
      {
        name: 'renewal_window',
        description: 'how soon renewal is',
        example: '90 days',
      },
    ],
    steps: [
      step(
        'Detect drops',
        'mixpanel/mixpanel',
        'List accounts whose usage fell more than `drop_threshold` versus the prior 30 days and renew within `renewal_window`.'
      ),
      step(
        'Escalate',
        'slack/slack',
        'Post one message per account to the customer success channel with the usage chart numbers and renewal date.'
      ),
      step(
        'Draft the check-in',
        'brew/brew',
        'Draft a short check-in email from the account manager for each account. Show the drafts to the user.'
      ),
    ],
    doneWhen: [
      'Every at-risk account has a Slack post and a drafted email.',
      'The user has the list ordered by renewal date.',
    ],
  },
  {
    key: 'brew/champion-job-change-loop',
    title: 'Reconnect when a product champion changes jobs',
    summary:
      'Track past champions, identify their new company, and reopen the relationship with the context you already earned.',
    tags: [
      'motion:outbound',
      'channel:linkedin',
      'channel:email',
      'capability:find-work-emails',
      'capability:enrich-contacts',
      'capability:manage-crm',
    ],
    inputs: [
      {
        name: 'champion_list',
        description: 'names and previous companies of past champions',
      },
    ],
    steps: [
      step(
        'Detect the move',
        'apollo/apollo',
        'For each person in `champion_list`, find their current company and title. Keep only people who moved in the last 6 months.'
      ),
      step(
        'Size the new company',
        'clay/clay',
        'For each new company, add size, industry and funding stage.'
      ),
      step(
        'Open a deal',
        'attio/attio',
        'Create a deal on the new company with the champion as the contact and the previous relationship in the notes.'
      ),
    ],
    doneWhen: [
      'Every champion who moved has a deal on their new company.',
      'The user has the list of moves.',
    ],
  },

  /* ───────────────────────── growth hacks: one tool each ───────────────────────── */
  {
    key: 'brew/clay-waterfall-order',
    title: 'Find more work emails by ordering providers by hit rate',
    summary:
      'Sample first, then run the waterfall in the order that actually finds emails for your list.',
    tags: ['capability:find-work-emails'],
    inputs: [
      {
        name: 'contacts_table',
        description: 'the Clay table with name and company domain columns',
      },
    ],
    steps: [
      step(
        'Sample',
        'clay/clay',
        "50 rows from `contacts_table` and run each email provider on them. Record each provider's hit rate."
      ),
      step(
        'Reorder',
        'clay/clay',
        'the providers from highest to lowest hit rate, stopping at the first verified email.'
      ),
      step(
        'Run',
        'clay/clay',
        'the reordered sequence on the full table, after the user confirms.'
      ),
    ],
    doneWhen: [
      'The table has a verified email column.',
      'The user has the hit rate for each provider.',
    ],
  },
  {
    key: 'brew/resend-to-unopened',
    title: 'Win a second open with a subject-line resend',
    summary:
      'Resend a campaign to the people who never opened it, with a subject line they have not seen.',
    tags: ['channel:email', 'capability:send-email'],
    inputs: [
      { name: 'campaign_id', description: 'the campaign to resend' },
      {
        name: 'wait_days',
        description: 'how long to wait after the first send',
        example: '3',
      },
    ],
    steps: [
      step(
        'Segment',
        'brew/brew',
        'the contacts in `campaign_id` who have not opened after `wait_days`.'
      ),
      step(
        'Rewrite',
        'brew/brew',
        'two alternative subject lines that make a different promise from the original. Show them to the user.'
      ),
      step(
        'Resend',
        'brew/brew',
        'the campaign with the chosen subject line to the unopened segment, after the user approves.'
      ),
    ],
    doneWhen: [
      'Only unopened contacts received the resend.',
      'The user has the open rate of both sends.',
    ],
  },
]
