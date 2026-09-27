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
  if (path === 'tags.yml') {
    return { kind: 'tags', path, source }
  }
  const parts = path.split('/')
  const name = (parts.at(-1) ?? '').replace(/\.md$/, '')
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

const TAGS = [
  'capability:',
  '  manage-crm:',
  '    label: Manage a CRM',
  '    synonyms: [crm]',
  'category:',
  '  crm:',
  '    label: CRM',
  'channel:',
  '  email:',
  '    label: Email',
  '',
].join('\n')

/** Header facts, then the body: steps and checks in markdown. Step 1 is on line 11. */
const WORKFLOW = [
  '---',
  'title: Keep the CRM clean',
  'summary: Dedupe records weekly.',
  'author: jdoe',
  'tags: [channel:email]',
  'updated: 2026-09-16',
  '---',
  '',
  '## Steps',
  '',
  '1. **Dedupe** with [acme/manage-crm](../companies/acme/tools/manage-crm.md). Merge duplicates.',
  '',
  '## Done when',
  '',
  '- No duplicates remain.',
  '',
].join('\n')

/** The minimal valid tree, one file per role. */
const FIXTURE = {
  tags: { path: 'tags.yml', source: TAGS },
  company: {
    path: 'companies/acme/company.md',
    source:
      '---\nname: Acme\ndomain: acme.example\ncategory: crm\nlogo: acme.png\nupdated: 2026-09-16\n---\n',
  },
  access: {
    path: 'companies/acme/access/api.md',
    source:
      '---\ntype: api\nofficial: true\nbaseUrl: https://api.acme.example\nauth:\n  method: api_key\n  envVar: ACME_API_KEY\n  selfServe: true\n---\n',
  },
  tool: {
    path: 'companies/acme/tools/manage-crm.md',
    source:
      '---\nname: Manage a CRM\nsummary: Creates records. Acme does this.\naccess:\n  api: POST /records\nupdated: 2026-09-16\n---\n',
  },
  workflow: { path: 'workflows/keep-crm-clean.md', source: WORKFLOW },
} as const

type Role = keyof typeof FIXTURE

/** The valid tree, some roles' sources replaced, extra files appended. */
function tree(
  changes: Partial<Record<Role, string>> = {},
  extra: ReadonlyArray<ContentFile> = []
): Array<ContentFile> {
  return [
    ...(Object.keys(FIXTURE) as Array<Role>).map((role) =>
      file(FIXTURE[role].path, changes[role] ?? FIXTURE[role].source)
    ),
    ...extra,
  ]
}

/** The valid tree with one piece of one role's text swapped. */
function edit(role: Role, from: string, to: string): Array<ContentFile> {
  const source = FIXTURE[role].source
  if (!source.includes(from)) {
    throw new Error(`the ${role} fixture has no ${from}`)
  }
  return tree({ [role]: source.replace(from, to) })
}

const VALID = tree()

function problemsOf(files: ReadonlyArray<ContentFile>): Array<string> {
  try {
    buildCatalog(files, { logos: new Set(['acme.png']) })
  } catch (error) {
    if (error instanceof ContentErrors) {
      return error.problems.map(
        (problem) =>
          `${problem.file}${problem.line ? `:${problem.line}` : ''}: ${problem.message}`
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

  test('tags are computed onto every entity; nobody writes them twice', () => {
    const catalog = buildCatalog(VALID, { logos: new Set(['acme.png']) })
    expect(catalog.tools.get('acme/manage-crm')?.tags).toEqual([
      'capability:manage-crm',
      'category:crm',
      'has:api',
    ])
    expect(catalog.companies.get('acme')?.tags).toEqual([
      'category:crm',
      'has:api',
      'capability:manage-crm',
    ])
    // Authored channel tag, the tool's capability, and the way in every tool shares.
    expect(catalog.workflows.get('keep-crm-clean')?.tags).toEqual([
      'channel:email',
      'capability:manage-crm',
      'has:api',
    ])
    expect(catalog.tags.get('capability:manage-crm')?.counts).toEqual({
      companies: 1,
      tools: 1,
      workflows: 1,
    })
  })

  const cases: Array<[string, () => Array<ContentFile>, RegExp]> = [
    [
      'a step naming an unknown tool',
      () =>
        edit(
          'workflow',
          '[acme/manage-crm](../companies/acme/tools/manage-crm.md)',
          '[acme/nope](../companies/acme/tools/nope.md)'
        ),
      /workflows\/keep-crm-clean\.md:11: step 1: "acme\/nope" is not a published tool/,
    ],
    [
      'an alias that shadows a live key',
      () =>
        tree({}, [
          file(
            'companies/other/company.md',
            '---\nname: Other\ndomain: other.example\ncategory: crm\nlogo: acme.png\naliases: [acme]\nupdated: 2026-09-16\n---\n'
          ),
        ]),
      /companies\/other\/company\.md: aliases: "acme" is a live company key/,
    ],
    [
      'eleven steps',
      () =>
        edit(
          'workflow',
          '1. **Dedupe** with',
          `${'1. **Step** with [acme/manage-crm](../companies/acme/tools/manage-crm.md). Do it.\n'.repeat(10)}1. **Dedupe** with`
        ),
      /steps: a workflow has at most 10 steps/,
    ],
    [
      'a retired version field',
      () => edit('workflow', 'author: jdoe\n', 'author: jdoe\nversion: 2\n'),
      /workflows\/keep-crm-clean\.md: `version`: versions are gone/,
    ],
    [
      'a reserved handle',
      () =>
        tree({}, [
          file(
            'companies/tools/company.md',
            '---\nname: Tools\ndomain: tools.example\ncategory: crm\nlogo: acme.png\nupdated: 2026-09-16\n---\n'
          ),
        ]),
      /companies\/tools\/company\.md: "tools" is not a usable handle/,
    ],
    [
      'an unknown access id',
      () => edit('tool', '  api: POST', '  mcp: POST'),
      /access "mcp" is not a file under companies\/acme\/access\//,
    ],
    [
      'a published tool with no way in',
      () => edit('tool', 'access:\n  api: POST /records\n', ''),
      /a published tool needs at least one way in/,
    ],
    [
      'a workflow using a draft tool',
      () => edit('tool', 'access:\n  api: POST /records\n', 'status: draft\n'),
      /step 1: "acme\/manage-crm" is not a published tool/,
    ],
    [
      'an invalid key part in a path',
      () =>
        tree({}, [
          file('companies/acme/tools/Manage_CRM.md', FIXTURE.tool.source),
        ]),
      /"Manage_CRM" is not a valid tool slug/,
    ],
    [
      'a workflow tag missing from tags.yml',
      () => edit('workflow', 'channel:email', 'channel:carrier-pigeon'),
      /tags: "channel:carrier-pigeon" is not in tags\.yml/,
    ],
    [
      'a category missing from tags.yml',
      () => edit('company', 'category: crm', 'category: nope'),
      /companies\/acme\/company\.md: category "nope" is not in tags\.yml/,
    ],
    [
      'a workflow tagging a capability its tools already give it',
      () =>
        edit(
          'workflow',
          'tags: [channel:email]',
          'tags: [channel:email, capability:manage-crm]'
        ),
      /tags: "capability:manage-crm" is computed from the workflow's tools/,
    ],
    [
      'a derived tag written into tags.yml',
      () => tree({ tags: `${TAGS}has:\n  mcp:\n    label: Has MCP\n` }),
      /tags\.yml: has:\* tags are computed/,
    ],
    [
      'a namespace tags.yml does not hold',
      () => tree({ tags: `${TAGS}fit:\n  smb:\n    label: SMB\n` }),
      /tags\.yml: "fit" is not a namespace/,
    ],
    [
      'a tag with no label',
      () => edit('tags', '    label: CRM\n', '    synonyms: [crm]\n'),
      /tags\.yml: category\.crm\.label/,
    ],
    [
      'a tag slug that is not a slug',
      () => edit('tags', '  email:', '  E_Mail:'),
      /tags\.yml: channel: "E_Mail" is not a valid slug/,
    ],
    [
      'a tree with no tags.yml',
      () => tree().filter((entry) => entry.kind !== 'tags'),
      /tags\.yml: the vocabulary file is missing/,
    ],
    [
      'an unknown frontmatter field',
      () => edit('company', 'logo: acme.png', 'logo: acme.png\nfounder: Jane'),
      /companies\/acme\/company\.md: .*founder/,
    ],
    [
      'a date that is not a date',
      () => edit('company', '2026-09-16', '2026-13-40'),
      /companies\/acme\/company\.md: updated:/,
    ],
    [
      'a retired `via` on a step',
      () => edit('workflow', 'manage-crm.md).', 'manage-crm.md) via MCP.'),
      /keep-crm-clean\.md:11: a step reads/,
    ],
    [
      'a step naming its tool in a code span',
      () =>
        edit(
          'workflow',
          '[acme/manage-crm](../companies/acme/tools/manage-crm.md)',
          '`acme/manage-crm`'
        ),
      /keep-crm-clean\.md:11: a step reads/,
    ],
    [
      'a workflow with no author',
      () => edit('workflow', 'author: jdoe\n', ''),
      /workflows\/keep-crm-clean\.md: author:/,
    ],
    [
      'an author that is not a GitHub login',
      () => edit('workflow', 'author: jdoe', 'author: jane doe'),
      /author: must be a GitHub login/,
    ],
    [
      'steps written in the header, the old way',
      () =>
        edit(
          'workflow',
          'updated: 2026-09-16\n',
          'updated: 2026-09-16\nsteps:\n  - title: Dedupe\n'
        ),
      /`steps` is not a header field: write it in the body under "## Steps"/,
    ],
    [
      'a step that does not read as a step',
      () => edit('workflow', '1. **Dedupe** with', '1. Dedupe with'),
      /keep-crm-clean\.md:11: a step reads/,
    ],
    [
      'a step linking somewhere other than its tool file',
      () =>
        edit(
          'workflow',
          '../companies/acme/tools/manage-crm.md',
          'https://example.com/manage-crm'
        ),
      /:11: the link to acme\/manage-crm must point at \.\.\/companies\/acme\/tools\/manage-crm\.md/,
    ],
    [
      'a section the body does not have',
      () => edit('workflow', '## Done when', '## Afterwards'),
      /keep-crm-clean\.md:13: "## Afterwards" is not a section/,
    ],
    [
      'sections out of order',
      () =>
        tree({
          workflow: `${WORKFLOW}\n## Inputs\n\n- \`region\`: where to look\n`,
        }),
      /"## Inputs" is out of order/,
    ],
    [
      'prose outside a section',
      () => edit('workflow', '## Steps', 'Some intro.\n\n## Steps'),
      /keep-crm-clean\.md:9: text outside a section/,
    ],
    [
      'a body with no steps',
      () =>
        edit(
          'workflow',
          '## Steps\n\n1. **Dedupe** with [acme/manage-crm](../companies/acme/tools/manage-crm.md). Merge duplicates.\n\n',
          ''
        ),
      /steps: add a `## Steps` section/,
    ],
    [
      'a body with no checks',
      () => edit('workflow', '## Done when\n\n- No duplicates remain.\n', ''),
      /doneWhen: add a `## Done when` section/,
    ],
    [
      'an input that is not snake_case',
      () =>
        edit(
          'workflow',
          '## Steps',
          '## Inputs\n\n- `Target-List`: the accounts, e.g. top 50\n\n## Steps'
        ),
      /keep-crm-clean\.md:11: input 1: name: must be snake_case/,
    ],
    [
      'a workflow name with an owner segment',
      () =>
        tree({}, [
          {
            kind: 'workflow',
            path: 'workflows/jdoe/other.md',
            name: 'jdoe/other',
            source: WORKFLOW,
          },
        ]),
      /"jdoe\/other" is not a valid workflow name|not a valid workflow name/,
    ],
    [
      'a file with no header',
      () => tree({ company: '# Acme\n\nJust prose.\n' }),
      /companies\/acme\/company\.md: the file must start with a `---` line/,
    ],
    [
      'a tool whose slug is not a capability',
      () =>
        tree({}, [
          file('companies/acme/tools/frobnicate.md', FIXTURE.tool.source),
        ]),
      /"frobnicate" is not a capability/,
    ],
    [
      'a logo that is not under public/logos',
      () => edit('company', 'acme.png', 'missing.png'),
      /logo "missing\.png" is not under public\/logos\//,
    ],
    [
      'two workflows claiming the same featured rank',
      () => [
        ...edit('workflow', 'updated:', 'featured: 1\nupdated:'),
        file(
          'workflows/second.md',
          WORKFLOW.replace('updated:', 'featured: 1\nupdated:')
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
    const problems = problemsOf(
      tree({
        tags: 'capability: [not, a, map',
        company: '# Acme\n',
      })
    )
    expect(problems.length).toBeGreaterThanOrEqual(2)
    expect(
      problems.every((problem) => /^(tags\.yml|[a-z]+\/)/.test(problem))
    ).toBe(true)
  })
})
