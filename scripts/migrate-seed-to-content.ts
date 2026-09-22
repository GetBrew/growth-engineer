import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { stringify } from 'yaml'
import { SEED_COMPANIES } from '../convex/seed/companies'
import { SEED_TAGS } from '../convex/seed/tags'
import { type Access, SEED_TOOLS } from '../convex/seed/tools'
import { SEED_WORKFLOWS } from '../convex/seed/workflows'

/**
 * ONE-OFF: turn the Convex seed into the markdown source tree.
 *
 *   companies/<handle>/company.md
 *   companies/<handle>/access/<id>.md
 *   companies/<handle>/tools/<slug>.md
 *   workflows/<owner>/<name>.md
 *   tags/<namespace>/<slug>.md
 *
 * Run once with `pnpm dlx tsx scripts/migrate-seed-to-content.ts`, commit the
 * tree, delete this script with `convex/`. Every file carries the same
 * `updated` date the goldens use, because nobody has checked these facts
 * since the seed was written.
 */

const ROOT = path.resolve(import.meta.dirname, '..')
const UPDATED = '2026-09-16'

type Frontmatter = Record<string, unknown>

function write(relative: string, frontmatter: Frontmatter, body?: string) {
  const file = path.join(ROOT, relative)
  mkdirSync(path.dirname(file), { recursive: true })
  const yaml = stringify(frontmatter, { lineWidth: 0 })
  const text = body?.trim() ? `---\n${yaml}---\n\n${body.trim()}\n` : `---\n${yaml}---\n`
  writeFileSync(file, text)
}

/** Drop undefined values so the YAML has no `key: null` lines. */
function compact(record: Frontmatter): Frontmatter {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  )
}

for (const dir of ['companies', 'workflows', 'tags']) {
  rmSync(path.join(ROOT, dir), { recursive: true, force: true })
}

/* ─────────────────────────────────── tags ───────────────────────────────── */

for (const tag of SEED_TAGS) {
  write(
    `tags/${tag.namespace}/${tag.slug}.md`,
    { label: tag.label, synonyms: [...tag.synonyms] },
    tag.description
  )
}

/* ────────────────────────────────── companies ───────────────────────────── */

for (const company of SEED_COMPANIES) {
  write(
    `companies/${company.key}/company.md`,
    compact({
      name: company.name,
      domain: company.domain,
      category: company.category,
      tagline: company.tagline,
      website:
        company.website === `https://${company.domain}`
          ? undefined
          : company.website,
      docs: company.docs,
      github: company.github,
      logo: company.logo,
      updated: UPDATED,
    }),
    company.description
  )
}

/* ─────────────────────────────── access options ─────────────────────────── */

type Template = Omit<Access, 'operation'>

function template(access: Access): Template {
  const { operation: _operation, ...rest } = access
  return rest
}

const toolsByCompany = new Map<string, Array<(typeof SEED_TOOLS)[number]>>()
for (const tool of SEED_TOOLS) {
  toolsByCompany.set(tool.companyKey, [
    ...(toolsByCompany.get(tool.companyKey) ?? []),
    tool,
  ])
}

for (const [companyKey, tools] of toolsByCompany) {
  const [first, ...rest] = tools
  if (!first) {
    continue
  }
  const templates = first.access.map(template)
  const signature = JSON.stringify(templates)
  for (const sibling of rest) {
    if (JSON.stringify(sibling.access.map(template)) !== signature) {
      throw new Error(
        `${companyKey}: ${sibling.key} has different access templates than ${first.key}; split them by hand`
      )
    }
  }
  const seen = new Set<string>()
  for (const entry of templates) {
    if (seen.has(entry.type)) {
      throw new Error(`${companyKey}: two ${entry.type} options; give them ids by hand`)
    }
    seen.add(entry.type)
    const { type, official, auth, docsUrl, ...specific } = entry
    write(
      `companies/${companyKey}/access/${type}.md`,
      compact({ type, official, ...specific, auth: compact(auth), docsUrl })
    )
  }
}

/* ─────────────────────────────────── tools ──────────────────────────────── */

for (const tool of SEED_TOOLS) {
  const slug = tool.key.split('/')[1]
  const access = Object.fromEntries(
    tool.access.map((entry) => [entry.type, entry.operation])
  )
  write(
    `companies/${tool.companyKey}/tools/${slug}.md`,
    compact({
      name: tool.name,
      summary: tool.summary,
      access,
      status: tool.access.length === 0 ? 'draft' : undefined,
      updated: UPDATED,
    }),
    tool.description
  )
}

/* ────────────────────────────────── workflows ───────────────────────────── */

SEED_WORKFLOWS.forEach((workflow, index) => {
  const [owner, name] = workflow.key.split('/')
  write(
    `workflows/${owner}/${name}.md`,
    compact({
      title: workflow.title,
      summary: workflow.summary,
      version: 1,
      tags: [...workflow.tags],
      inputs: workflow.inputs.map((input) => compact({ ...input })),
      steps: workflow.steps.map((step) =>
        compact({
          title: step.title,
          tool: step.toolKey,
          via: step.via,
          instruction: step.instruction,
        })
      ),
      doneWhen: [...workflow.doneWhen],
      featured: index + 1,
      updated: UPDATED,
    }),
    workflow.notes
  )
})

console.log(
  `wrote ${SEED_TAGS.length} tags, ${SEED_COMPANIES.length} companies, ${toolsByCompany.size} access sets, ${SEED_TOOLS.length} tools, ${SEED_WORKFLOWS.length} workflows`
)
