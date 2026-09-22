import { describe, expect, test } from 'vitest'
import { buildCatalog } from '@/lib/content/build-catalog'
import { ContentErrors } from '@/lib/content/errors'
import type { ContentFile } from '@/lib/content/read-tree'

/**
 * The negative cases: every rule the build enforces on a contributor's files,
 * each proven to FAIL with the offending file's path. A guard is not done
 * until it has failed. Fixtures are in-memory, around one minimal valid set.
 */

function file(path: string, source: string): ContentFile {
  const parts = path.split('/')
  const name = (parts.at(-1) ?? '').replace(/\.md$/, '')
  if (parts[0] === 'tags') {
    return { kind: 'tag', path, namespace: parts[1] ?? '', slug: name, source }
  }
  if (parts[0] === 'workflows') {
    return { kind: 'workflow', path, name, source }
  }
  const handle = parts[1] ?? ''
  if (parts[2] === 'access') {
    return { kind: 'access', path, handle, id: name, source }
  }
  if (parts[2] === 'tools') {
    return { kind: 'tool', path, handle, slug: name, source }
  }
  return { kind: 'company', path, handle, source }
}

const VALID: Array<ContentFile> = [
  file('tags/category/crm.md', '---\nlabel: CRM\n---\n\nSystems of record.\n'),
  file(
    'tags/capability/manage-crm.md',
    '---\nlabel: Manage a CRM\nsynonyms: [crm]\n---\n\nCreates and updates records.\n'
  ),
  file('tags/channel/email.md', '---\nlabel: Email\n---\n\nEmail.\n'),
  file(
    'companies/acme/company.md',
    '---\nname: Acme\ndomain: acme.example\ncategory: crm\nlogo: acme.png\nupdated: 2026-09-16\n---\n'
  ),
  file(
    'companies/acme/access/api.md',
    '---\ntype: api\nofficial: true\nbaseUrl: https://api.acme.example\nauth:\n  method: api_key\n  envVar: ACME_API_KEY\n  selfServe: true\n---\n'
  ),
  file(
    'companies/acme/tools/manage-crm.md',
    '---\nname: Manage a CRM\nsummary: Creates records. Acme does this.\naccess:\n  api: POST /records\nupdated: 2026-09-16\n---\n'
  ),
  file(
    'workflows/keep-crm-clean.md',
    '---\ntitle: Keep the CRM clean\nsummary: Dedupe records weekly.\nauthor: jdoe\ntags: [channel:email]\nsteps:\n  - title: Dedupe\n    tool: acme/manage-crm\n    instruction: Merge duplicates.\ndoneWhen:\n  - No duplicates remain.\nupdated: 2026-09-16\n---\n'
  ),
]

function replace(path: string, source: string): Array<ContentFile> {
  return VALID.map((entry) =>
    entry.path === path ? file(path, source) : entry
  )
}

function problemsOf(files: ReadonlyArray<ContentFile>): Array<string> {
  try {
    buildCatalog(files, { logos: new Set(['acme.png']) })
  } catch (error) {
    if (error instanceof ContentErrors) {
      return error.problems.map(
        (problem) => `${problem.file}: ${problem.message}`
      )
    }
    throw error
  }
  return []
}

describe('content rules', () => {
  test('the minimal valid set builds', () => {
    expect(problemsOf(VALID)).toEqual([])
    const catalog = buildCatalog(VALID, { logos: new Set(['acme.png']) })
    expect(catalog.documents.size).toBe(3)
  })

  const cases: Array<[string, () => Array<ContentFile>, RegExp]> = [
    [
      'a step naming an unknown tool',
      () =>
        replace(
          'workflows/keep-crm-clean.md',
          VALID[6]?.source.replace('acme/manage-crm', 'acme/nope') ?? ''
        ),
      /workflows\/keep-crm-clean\.md: steps\.0\.tool: "acme\/nope" is not a published tool/,
    ],
    [
      'an alias that shadows a live key',
      () => [
        ...VALID,
        file(
          'companies/other/company.md',
          '---\nname: Other\ndomain: other.example\ncategory: crm\nlogo: acme.png\naliases: [acme]\nupdated: 2026-09-16\n---\n'
        ),
      ],
      /companies\/other\/company\.md: aliases: "acme" is a live company key/,
    ],
    [
      'eleven steps',
      () =>
        replace(
          'workflows/keep-crm-clean.md',
          `---\ntitle: Too long\nsummary: Too many steps.\nauthor: jdoe\ntags: [channel:email]\nsteps:\n${'  - title: Step\n    tool: acme/manage-crm\n    instruction: Do it.\n'.repeat(11)}doneWhen:\n  - Done.\nupdated: 2026-09-16\n---\n`
        ),
      /steps: a workflow has at most 10 steps/,
    ],
    [
      'a reserved handle',
      () => [
        ...VALID,
        file(
          'companies/tools/company.md',
          '---\nname: Tools\ndomain: tools.example\ncategory: crm\nlogo: acme.png\nupdated: 2026-09-16\n---\n'
        ),
      ],
      /companies\/tools\/company\.md: "tools" is not a usable handle/,
    ],
    [
      'an unknown access id',
      () =>
        replace(
          'companies/acme/tools/manage-crm.md',
          VALID[5]?.source.replace('  api: POST', '  mcp: POST') ?? ''
        ),
      /access "mcp" is not a file under companies\/acme\/access\//,
    ],
    [
      'a published tool with no way in',
      () =>
        replace(
          'companies/acme/tools/manage-crm.md',
          '---\nname: Manage a CRM\nsummary: Creates records.\nupdated: 2026-09-16\n---\n'
        ),
      /a published tool needs at least one way in/,
    ],
    [
      'a workflow using a draft tool',
      () =>
        replace(
          'companies/acme/tools/manage-crm.md',
          '---\nname: Manage a CRM\nsummary: Creates records.\nstatus: draft\nupdated: 2026-09-16\n---\n'
        ),
      /steps\.0\.tool: "acme\/manage-crm" is not a published tool/,
    ],
    [
      'an invalid key part in a path',
      () => [
        ...VALID,
        file('companies/acme/tools/Manage_CRM.md', VALID[5]?.source ?? ''),
      ],
      /"Manage_CRM" is not a valid tool slug/,
    ],
    [
      'an unknown tag and an unknown category',
      () => [
        ...replace(
          'workflows/keep-crm-clean.md',
          VALID[6]?.source.replace('channel:email', 'channel:carrier-pigeon') ??
            ''
        ).map((entry) =>
          entry.path === 'companies/acme/company.md'
            ? file(
                entry.path,
                entry.source.replace('category: crm', 'category: nope')
              )
            : entry
        ),
      ],
      /tags: "channel:carrier-pigeon" is not a file under tags\//,
    ],
    [
      'a derived tag written as a file',
      () => [
        ...VALID,
        file('tags/agent/native.md', '---\nlabel: Native\n---\n\nNo.\n'),
      ],
      /tags\/agent\/native\.md: agent:\* tags are computed/,
    ],
    [
      'an unknown frontmatter field',
      () =>
        replace(
          'companies/acme/company.md',
          VALID[3]?.source.replace(
            'logo: acme.png',
            'logo: acme.png\nfounder: Jane'
          ) ?? ''
        ),
      /companies\/acme\/company\.md: .*founder/,
    ],
    [
      'a date that is not a date',
      () =>
        replace(
          'companies/acme/company.md',
          VALID[3]?.source.replace('2026-09-16', '2026-13-40') ?? ''
        ),
      /companies\/acme\/company\.md: updated:/,
    ],
    [
      'a `via` the tool does not offer',
      () =>
        replace(
          'workflows/keep-crm-clean.md',
          VALID[6]?.source.replace(
            '    instruction:',
            '    via: mcp\n    instruction:'
          ) ?? ''
        ),
      /steps\.0\.via: acme\/manage-crm has no mcp way in/,
    ],
    [
      'a workflow with no author',
      () =>
        replace(
          'workflows/keep-crm-clean.md',
          VALID[6]?.source.replace('author: jdoe\n', '') ?? ''
        ),
      /workflows\/keep-crm-clean\.md: author:/,
    ],
    [
      'an author that is not a GitHub login',
      () =>
        replace(
          'workflows/keep-crm-clean.md',
          VALID[6]?.source.replace('author: jdoe', 'author: jane doe') ?? ''
        ),
      /author: must be a GitHub login/,
    ],
    [
      'a workflow name with an owner segment',
      () => [
        ...VALID,
        {
          kind: 'workflow',
          path: 'workflows/jdoe/other.md',
          name: 'jdoe/other',
          source: VALID[6]?.source ?? '',
        },
      ],
      /"jdoe\/other" is not a valid workflow name|not a valid workflow name/,
    ],
    [
      'a file with no header',
      () => replace('tags/channel/email.md', '# Email\n\nJust prose.\n'),
      /tags\/channel\/email\.md: the file must start with a `---` line/,
    ],
    [
      'a tool whose slug is not a capability',
      () => [
        ...VALID,
        file('companies/acme/tools/frobnicate.md', VALID[5]?.source ?? ''),
      ],
      /"frobnicate" is not a capability/,
    ],
    [
      'a logo that is not under public/logos',
      () =>
        replace(
          'companies/acme/company.md',
          VALID[3]?.source.replace('acme.png', 'missing.png') ?? ''
        ),
      /logo "missing\.png" is not under public\/logos\//,
    ],
    [
      'two workflows claiming the same featured rank',
      () => [
        ...replace(
          'workflows/keep-crm-clean.md',
          VALID[6]?.source.replace('updated:', 'featured: 1\nupdated:') ?? ''
        ),
        file(
          'workflows/second.md',
          VALID[6]?.source.replace('updated:', 'featured: 1\nupdated:') ?? ''
        ),
      ],
      /featured: rank 1 is already taken by keep-crm-clean/,
    ],
  ]

  test.each(cases)('rejects %s', (_name, files, message) => {
    const problems = problemsOf(files())
    expect(problems.length).toBeGreaterThan(0)
    expect(problems.join('\n')).toMatch(message)
  })

  test('reports every problem at once, each with its file', () => {
    const problems = problemsOf([
      ...replace('tags/channel/email.md', '# Email\n'),
      file('tags/agent/native.md', '---\nlabel: Native\n---\n\nNo.\n'),
    ])
    expect(problems.length).toBeGreaterThanOrEqual(3)
    expect(problems.every((problem) => /^[a-z]+\//.test(problem))).toBe(true)
  })
})
