import { z } from 'zod'
import {
  isValidGithubLogin,
  isValidHandle,
  isValidKeyPart,
  isValidOwnedKey,
  isValidTagKey,
} from '@/lib/catalog/keys'
import { MAX_WORKFLOW_STEPS } from '@/lib/catalog/render-markdown'

/**
 * The frontmatter of every source file, one strict schema per file kind.
 * Strict on purpose: an unknown field is a typo or a feature that does not
 * exist yet, and either way the contributor should hear about it now, from
 * the file's path, not from a page that quietly ignores it.
 *
 * Keys are never authored — a company's handle is its folder, a tool's slug
 * is its file name — so the schemas describe FIELDS only. Cross-file rules
 * (does this tool exist, does that access id exist) live in build-catalog.ts.
 */

const text = z.string().trim().min(1, 'must not be empty')
const url = z.url({ protocol: /^https?$/, hostname: z.regexes.domain })
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
  message: 'must be `<handle>/<slug>`, like `clay/enrich-contacts`',
})
const githubLogin = text.refine(isValidGithubLogin, {
  message:
    'must be a GitHub login: letters, digits and single hyphens, up to 39 characters',
})
const tagKey = text.refine(isValidTagKey, {
  message: 'must be `<namespace>:<slug>`, like `motion:outbound`',
})
const status = z.enum(['published', 'deprecated'])

/* ────────────────────────────────── company ─────────────────────────────── */

export const companySchema = z.strictObject({
  name: text,
  domain: z
    .string()
    .trim()
    .regex(z.regexes.domain, 'must be a bare domain like `clay.com`'),
  /** A `tags/category/<slug>.md` slug. */
  category: keyPart,
  tagline: text.optional(),
  docs: url.optional(),
  github: url.optional(),
  /** A file under public/logos. */
  logo: z
    .string()
    .regex(
      /^[a-z0-9-]+\.(png|jpg|jpeg|svg|webp)$/,
      'must name a file under public/logos, like `clay.png`'
    ),
  aliases: z.array(handle).default([]),
  status: status.default('published'),
  updated: isoDate,
})

/* ─────────────────────────────────── access ─────────────────────────────── */

const auth = z.strictObject({
  method: z.enum(['none', 'api_key', 'oauth']),
  envVar: z
    .string()
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      'must look like an environment variable, `CLAY_API_KEY`'
    )
    .optional(),
  header: text.optional(),
  keyUrl: url.optional(),
  selfServe: z.boolean(),
})

const accessCommon = {
  official: z.boolean(),
  maintainer: text.optional(),
  auth,
  docsUrl: url.optional(),
}

export const accessSchema = z
  .discriminatedUnion('type', [
    z.strictObject({
      type: z.literal('mcp'),
      ...accessCommon,
      transport: z.enum(['remote', 'local']),
      url: url.optional(),
      command: text.optional(),
    }),
    z.strictObject({
      type: z.literal('cli'),
      ...accessCommon,
      installCommand: text,
      binary: text,
    }),
    z.strictObject({
      type: z.literal('api'),
      ...accessCommon,
      baseUrl: url,
    }),
  ])
  .superRefine((value, context) => {
    if (!(value.official || value.maintainer)) {
      context.addIssue({
        code: 'custom',
        path: ['maintainer'],
        message: 'a community option must name its maintainer',
      })
    }
    if (value.type === 'mcp' && value.transport === 'remote' && !value.url) {
      context.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'a remote MCP server needs its `url`',
      })
    }
    if (value.type === 'mcp' && value.transport === 'local' && !value.command) {
      context.addIssue({
        code: 'custom',
        path: ['command'],
        message:
          'a local MCP server needs its `command`, like `npx -y vendor-mcp`',
      })
    }
  })

/* ──────────────────────────────────── tool ──────────────────────────────── */

export const toolSchema = z.strictObject({
  name: text,
  summary: text,
  /** `{ <access id>: <operation> }` — the exact call, per way in. */
  access: z.record(z.string(), text).default({}),
  aliases: z.array(ownedKey).default([]),
  /** A draft is allowed to have no way in; it has no page and no file. */
  status: z.enum(['published', 'deprecated', 'draft']).default('published'),
  updated: isoDate,
})

/* ─────────────────────────────────── workflow ───────────────────────────── */

/**
 * A workflow file is a header and a body. The HEADER holds the facts about
 * the workflow; the inputs, steps and checks are markdown in the BODY
 * (lib/content/workflow-body.ts reads them), so the source file reads on
 * GitHub the way the rendered file reads on the site.
 */
export const workflowHeaderSchema = z.strictObject({
  title: text,
  summary: text,
  /** The GitHub login of the person who wrote it. */
  author: githubLogin,
  tags: z.array(tagKey).min(1, 'give the workflow at least one tag'),
  featured: z.int().min(1).optional(),
  aliases: z.array(keyPart).default([]),
  status: status.default('published'),
  updated: isoDate,
})

/** Header fields that live in the body now, and the section each moved to. */
export const WORKFLOW_BODY_SECTIONS = {
  inputs: '## Inputs',
  steps: '## Steps',
  doneWhen: '## Done when',
} as const

/** The body's sections once read into fields: the same rules, per entry. */
export const workflowBodySchema = z.strictObject({
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
        /** A tool key: `clay/enrich-contacts`. */
        tool: ownedKey,
        instruction: text,
      })
    )
    .min(1, 'add a `## Steps` section with at least one numbered step')
    .max(
      MAX_WORKFLOW_STEPS,
      `a workflow has at most ${MAX_WORKFLOW_STEPS} steps`
    ),
  doneWhen: z
    .array(text)
    .min(1, 'add a `## Done when` section with at least one check'),
})

/* ──────────────────────────────────── tag ───────────────────────────────── */

export const tagSchema = z.strictObject({
  label: text,
  synonyms: z.array(text).default([]),
})

export type CompanyFrontmatter = z.infer<typeof companySchema>
export type AccessFrontmatter = z.infer<typeof accessSchema>
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
