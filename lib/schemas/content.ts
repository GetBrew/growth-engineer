import { z } from 'zod'
import {
  isValidGithubLogin,
  isValidHandle,
  isValidKeyPart,
  isValidOwnedKey,
  isValidTagKey,
} from '@/lib/catalog/keys'
import { MAX_WORKFLOW_STEPS } from '@/lib/catalog/render-markdown'
import { parseLogoUrl } from '@/lib/content/logos'

/**
 * The frontmatter of every source file, one strict schema per file kind.
 * Strict on purpose: an unknown field is a typo or a feature that does not
 * exist yet, and either way the contributor should hear about it now, from
 * the file's path, not from a page that quietly ignores it.
 *
 * Keys are never authored — a company's handle is its folder, a tool's slug
 * is its file name — so the schemas describe FIELDS only. Cross-file rules
 * (does this tool exist, does its company declare that way in) live in
 * lib/content/build-*.ts.
 */

const text = z.string().trim().min(1, 'must not be empty')
const LINE_BREAK = /[\r\n]/
/** A value that fits on one header line: no line breaks. */
const line = text.refine((value) => !LINE_BREAK.test(value), {
  message: 'must be one line',
})
/**
 * Markdown that would open a block, as CommonMark reads a line: a heading
 * (`## `, not `#1`), quote, list item, code fence, HTML block, or a line that
 * is only a rule.
 */
const BLOCK_START =
  /^(?:#{1,6}(?:\s|$)|>|[-*+](?:\s|$)|\d{1,9}[.)](?:\s|$)|```|~~~|<[A-Za-z!?/]|(?:[-*_=]\s*){3,}$)/
/** A sentence the file prints as its own paragraph: plain prose, one line. */
const sentence = line.refine((value) => !BLOCK_START.test(value), {
  message: 'must be plain prose: no heading, quote, list or rule at the start',
})
const url = z.url({ protocol: /^https?$/, hostname: z.regexes.domain })
/** `{subdomain}`: the part of a way's URL that differs per account. */
const PLACEHOLDER = /\{[a-z][a-z0-9_]*\}/g
const PLACEHOLDER_TEST = /\{[a-z][a-z0-9_]*\}/
const STRAY = /[{}\s]/
/**
 * A way's URL. A host that differs per account is a snake_case placeholder
 * in braces — `https://{subdomain}.zendesk.com` — and the way's `notes` say
 * where the value comes from.
 */
const wayUrl = text.refine(
  (value) => {
    const filled = value.replace(PLACEHOLDER, 'account.example')
    return !STRAY.test(filled) && url.safeParse(filled).success
  },
  {
    message:
      'must be a URL; a part that differs per account is a snake_case placeholder in braces, like `https://{subdomain}.zendesk.com`',
  }
)
/**
 * What an agent must know before it calls: a prerequisite, a poll, a limit,
 * a cost. One line of plain prose, a sentence or two — a gotcha, not a
 * description.
 */
const NOTES_MAX = 280
const notes = sentence.refine((value) => value.length <= NOTES_MAX, {
  message: `must be at most ${NOTES_MAX} characters: keep only what an agent must know before it calls`,
})
const isoDate = z.iso.date()
const keyPart = text.refine(isValidKeyPart, {
  message:
    'must be lowercase letters, digits and hyphens, 2–39 characters, not starting or ending with a hyphen',
})
const handle = text.refine(isValidHandle, {
  message:
    'must be a valid, unreserved handle (lowercase letters, digits, hyphens)',
})
const ownedKey = text.refine(isValidOwnedKey, {
  message: 'must be `<handle>/<slug>`, like `apollo/enrich-person`',
})
const githubLogin = text.refine(isValidGithubLogin, {
  message:
    'must be a GitHub login: letters, digits and single hyphens, up to 39 characters',
})
const tagKey = text.refine(isValidTagKey, {
  message: 'must be `<namespace>:<slug>`, like `channel:email`',
})
const status = z.enum(['published', 'deprecated'])

/* ──────────────────────────────── ways in ───────────────────────────────── */
/* How an agent reaches a company, written once in its company.md: at most
 * one MCP server, one CLI and one API. Each of the company's tools then
 * names its call on each of them. */

const envVar = z
  .string()
  .regex(
    /^[A-Z][A-Z0-9_]*$/,
    'must look like an environment variable, `CLAY_API_KEY`'
  )

/** A command an agent can split on spaces: no quotes, no shell syntax. */
const ARGV = /^[^\s'"`\\$|&;<>(){}]+(?: [^\s'"`\\$|&;<>(){}]+)*$/

const wayCommon = {
  auth: z.enum(['none', 'api_key', 'oauth']),
  /** Where the key goes: required with `api_key`, refused otherwise. */
  env: envVar.optional(),
  /** Where a person gets a key; `api_key` only. */
  keyUrl: url.optional(),
  docs: url.optional(),
  /** Absent = official; a community-run way names who runs it. */
  maintainer: line.optional(),
  /** Where a `{placeholder}` comes from, how a key is encoded: one sentence or two. */
  notes: notes.optional(),
}

type WayAuth = {
  auth: 'none' | 'api_key' | 'oauth'
  env?: string | undefined
  keyUrl?: string | undefined
  url?: string | undefined
  notes?: string | undefined
}

function authRules(value: WayAuth, context: z.RefinementCtx): void {
  if (value.url && PLACEHOLDER_TEST.test(value.url) && !value.notes) {
    context.addIssue({
      code: 'custom',
      path: ['notes'],
      message:
        'a URL with a `{placeholder}` needs `notes` saying where the value comes from',
    })
  }
  if (value.auth === 'api_key' && !value.env) {
    context.addIssue({
      code: 'custom',
      path: ['env'],
      message: 'an API key needs the environment variable it goes in',
    })
  }
  if (value.auth !== 'api_key' && (value.env || value.keyUrl)) {
    context.addIssue({
      code: 'custom',
      path: [value.env ? 'env' : 'keyUrl'],
      message: 'only `auth: api_key` takes `env` and `keyUrl`',
    })
  }
}

const mcpWay = z
  .strictObject({
    ...wayCommon,
    /** A remote server. */
    url: wayUrl.optional(),
    /** A local server, started with this command. */
    command: z
      .string()
      .regex(ARGV, 'must be a plain command, like `npx -y vendor-mcp`')
      .optional(),
  })
  .superRefine((value, context) => {
    if (Boolean(value.url) === Boolean(value.command)) {
      context.addIssue({
        code: 'custom',
        path: ['url'],
        message:
          'an MCP server has exactly one of `url` (remote) or `command` (local)',
      })
    }
    if (value.url && value.auth === 'api_key') {
      context.addIssue({
        code: 'custom',
        path: ['auth'],
        message:
          'a remote MCP server with an API key cannot be set up from a file yet; use `oauth` or `none`, or list its API instead',
      })
    }
    authRules(value, context)
  })

const cliWay = z
  .strictObject({
    ...wayCommon,
    install: text,
    binary: z
      .string()
      .regex(/^[a-z0-9][a-z0-9._-]*$/, 'must be the command name, like `gh`'),
  })
  .superRefine(authRules)

const apiWay = z
  .strictObject({
    ...wayCommon,
    /** The base URL every call's path follows. */
    url: wayUrl,
    /**
     * The header the key goes in, as the vendor prints it: `X-Api-Key`,
     * `api_key`. Absent = `Authorization`. With no `scheme`, the key goes in
     * the header as is.
     */
    header: z
      .string()
      .regex(
        /^[A-Za-z][A-Za-z0-9_-]*$/,
        'must be a header name only, like `X-Api-Key`; a scheme like `Basic` goes in `scheme:`'
      )
      .optional(),
    /**
     * The word before the key: `Basic`, `Token`, `Klaviyo-API-Key`. Absent
     * with no `header` = `Bearer`.
     */
    scheme: z
      .string()
      .regex(
        /^[A-Za-z][A-Za-z0-9-]*$/,
        'must be one word, like `Basic` or `Token`'
      )
      .optional(),
  })
  .superRefine((value, context) => {
    if ((value.header || value.scheme) && value.auth !== 'api_key') {
      context.addIssue({
        code: 'custom',
        path: [value.header ? 'header' : 'scheme'],
        message: 'only `auth: api_key` takes `header` and `scheme`',
      })
    }
    authRules(value, context)
  })

/* ────────────────────────────────── company ─────────────────────────────── */

export const companySchema = z.strictObject({
  name: line,
  domain: z
    .string()
    .trim()
    .regex(z.regexes.domain, 'must be a bare domain like `clay.com`'),
  /** A `category:` slug from tags.yml. */
  category: keyPart,
  tagline: sentence.optional(),
  docs: url.optional(),
  github: url.optional(),
  /** The logo on cdn.growth.engineer, written by `pnpm logos:upload`. */
  logo: z
    .string()
    .refine((value) => parseLogoUrl(value) !== undefined, {
      message:
        'must be a cdn.growth.engineer logo URL, which `pnpm logos:upload` writes: add the image as logo.svg (or .png, .jpg, .webp) beside company.md instead',
    })
    .optional(),
  mcp: mcpWay.optional(),
  cli: cliWay.optional(),
  api: apiWay.optional(),
  aliases: z.array(handle).default([]),
  status: status.default('published'),
  updated: isoDate,
})

/* ──────────────────────────────────── tool ──────────────────────────────── */

export const toolSchema = z.strictObject({
  name: line,
  summary: sentence,
  /** A `capability:` slug from tags.yml. */
  capability: keyPart,
  /** What an agent must know before it calls: a prerequisite, a poll, a limit, a cost. */
  notes: notes.optional(),
  /** The page that documents the call. */
  docs: url.optional(),
  /** The MCP tool name, as the server lists it. */
  mcp: z
    .string()
    .regex(
      /^[A-Za-z0-9_.\-/]{1,128}$/,
      'must be an MCP tool name, like `create_payment_link`'
    )
    .optional(),
  /** The command, starting with the company's CLI binary. */
  cli: text.optional(),
  /** `METHOD /path`, as the API reference prints it; path parameters in braces. */
  api: z
    .string()
    .regex(
      /^(GET|POST|PUT|PATCH|DELETE) \/\S*$/,
      'must be `METHOD /path`, like `POST /v1/payment_links`'
    )
    .refine((value) => !value.includes('/:'), {
      message:
        'a path parameter goes in braces, like `/contacts/{contact_id}`, not `/contacts/:contact_id`',
    })
    .optional(),
  aliases: z.array(ownedKey).default([]),
  /** A draft is allowed to have no call; it has no page and no file. */
  status: z.enum(['published', 'deprecated', 'draft']).default('published'),
  updated: isoDate,
})

/* ─────────────────────────────────── workflow ───────────────────────────── */

/** Short enough to scan in a list: a title fits one line, a summary two. */
const WORKFLOW_TITLE_MAX = 60
const WORKFLOW_SUMMARY_MAX = 140
const WORKFLOW_OUTCOME_MAX = 4

/**
 * A workflow file is a header and a body. The HEADER holds the facts about
 * the workflow; the outcome, inputs and steps are markdown in the BODY
 * (lib/content/workflow-body.ts reads them), so the source file reads on
 * GitHub the way the rendered file reads on the site.
 */
export const workflowHeaderSchema = z.strictObject({
  title: line.refine((value) => value.length <= WORKFLOW_TITLE_MAX, {
    message: `must be at most ${WORKFLOW_TITLE_MAX} characters: the result, verb first`,
  }),
  summary: sentence.refine((value) => value.length <= WORKFLOW_SUMMARY_MAX, {
    message: `must be at most ${WORKFLOW_SUMMARY_MAX} characters: one sentence on what it does`,
  }),
  /** The GitHub login of the person who wrote it. */
  author: githubLogin,
  /** The one `motion:` slug from tags.yml it serves, like a company's `category`. */
  motion: keyPart,
  /** Channel tags; the motion is its own field, and capabilities come from the tools. */
  tags: z.array(tagKey).default([]),
  /** On the featured list, set by maintainers; featured workflows sort newest added first. */
  featured: z.boolean().default(false),
  aliases: z.array(keyPart).default([]),
  /** A draft is checked but never published: no page, no file. */
  status: z.enum(['published', 'deprecated', 'draft']).default('published'),
  /** The day it joined the catalog; never changes. "New" sorts by it. */
  added: isoDate,
  updated: isoDate,
})

/** Header fields that live in the body now, and the section each moved to. */
export const WORKFLOW_BODY_SECTIONS = {
  outcome: '## Outcome',
  inputs: '## Inputs',
  steps: '## Steps',
} as const

/** The body's sections once read into fields: the same rules, per entry. */
export const workflowBodySchema = z.strictObject({
  /** What the user has when the run ends: the checks that mean it is done. */
  outcome: z
    .array(
      // People read the outcome on the page to decide, so it names things
      // in words, not the inputs or fields the steps use.
      text.refine((value) => !value.includes('`'), {
        message:
          'say it in plain words, without `code`: people read the outcome to decide',
      })
    )
    .min(1, 'add a `## Outcome` section: what the user has when the run ends')
    .max(
      WORKFLOW_OUTCOME_MAX,
      `an outcome has at most ${WORKFLOW_OUTCOME_MAX} items`
    ),
  inputs: z.array(
    z.strictObject({
      name: z
        .string()
        .regex(
          /^[a-z][a-z0-9_]*$/,
          'must be snake_case, like `target_accounts`'
        ),
      description: text,
      example: text.optional(),
    })
  ),
  steps: z
    .array(
      z.strictObject({
        title: text,
        /** A tool key: `apollo/enrich-person`; absent when the agent does the step itself. */
        tool: ownedKey.optional(),
        instruction: text,
      })
    )
    .min(1, 'add a `## Steps` section with at least one numbered step')
    .refine((steps) => steps.some((step) => step.tool !== undefined), {
      message: 'at least one step names a tool: a workflow puts tools to work',
    })
    .max(
      MAX_WORKFLOW_STEPS,
      `a workflow has at most ${MAX_WORKFLOW_STEPS} steps`
    ),
})

/* ─────────────────────────────────── tags.yml ───────────────────────────── */

const tagEntry = z.strictObject({
  label: line,
  synonyms: z.array(text).default([]),
})

/** A namespace: slug → entry. Slugs are checked in build-tags.ts. */
const tagNamespace = z.record(z.string(), tagEntry).default({})

/** The curated namespaces; `has:*` is computed and never written. */
export const tagsFileSchema = z.strictObject({
  capability: tagNamespace,
  category: tagNamespace,
  channel: tagNamespace,
  motion: tagNamespace,
})

export type CompanyFrontmatter = z.infer<typeof companySchema>
export type CompanyWays = Pick<
  z.infer<typeof companySchema>,
  'mcp' | 'cli' | 'api'
>
export type ToolFrontmatter = z.infer<typeof toolSchema>
/** Everything a workflow file says: its header plus its body's fields. */
export type WorkflowFrontmatter = z.infer<typeof workflowHeaderSchema> &
  z.infer<typeof workflowBodySchema>

/** "steps.3.tool: must be …" — one line per issue, path first. */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.map(String).join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join('; ')
}
