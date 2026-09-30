import { describe, expect, test } from 'vitest'
import { readSourceFiles } from './helpers/source-files'

/**
 * Every size, line height, letter spacing and weight lives in
 * app/typography.css, under a role name (`type-item`, `type-helper`…). A
 * component that sets one itself — `text-[12px]`, `text-sm`, `leading-6`,
 * `font-medium` — drifts from the scale the moment the scale changes, so
 * none may. A new need is a new role in typography.css.
 *
 * Allowed in a component: the family (`font-mono`), figure spacing
 * (`tabular-nums`), and colour (`text-soft`, `text-foreground/60`…).
 */
const TYPOGRAPHY_CLASS =
  /(?<![\w-])(?:[\w[\]().-]+:)*(text-(?:xs|sm|base|lg|xl|[2-9]xl)(?:\/[\w.[\]]+)?|text-\[\d[^\]]*\]|leading-[\w.[\]-]+|tracking-[\w.[\]-]+|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black))(?![\w-])/g

/** The typography classes a source sets itself, comments left out. */
function typographyIn(source: string): Array<string> {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
  return [...code.matchAll(TYPOGRAPHY_CLASS)].map((match) => match[1] ?? '')
}

describe('typography', () => {
  test('the check catches a size, line height, tracking or weight', () => {
    expect(
      typographyIn(
        '<p className="text-[12px] text-sm/6 leading-6 tracking-tight font-medium sm:text-base">'
      )
    ).toEqual([
      'text-[12px]',
      'text-sm/6',
      'leading-6',
      'tracking-tight',
      'font-medium',
      'text-base',
    ])
  })

  test('the check allows roles, colour, the family and figures', () => {
    expect(
      typographyIn(
        '<p className="type-item text-foreground text-soft/60 font-mono tabular-nums text-[#fff]">'
      )
    ).toEqual([])
    // Comments may name a class while explaining why it is not used.
    expect(typographyIn('// not `font-medium` here\n/* text-sm */')).toEqual([])
  })

  test('no UI file sets its own size, line height, tracking or weight', () => {
    const offenders = ['app', 'components'].flatMap((dir) =>
      readSourceFiles(dir, { skipTests: true })
        .filter((file) => file.relativePath.endsWith('.tsx'))
        .flatMap((file) =>
          typographyIn(file.source).map(
            (found) => `${file.relativePath}: ${found}`
          )
        )
    )
    expect(offenders).toEqual([])
  })

  test('a detail page or guide sets its text at 14px, as the listings do', () => {
    // Title 32, section 20, item title 16/500, text 14, meta 12: the roles a
    // listing uses. The one 16px line is the description under the title.
    const LARGE_TEXT = /(?<![\w-])type-(?:body|lead)(?![\w-])/g
    const TITLE_LINE = [
      'components/detail/header.tsx',
      'components/detail/summary.tsx',
    ]
    const offenders = [
      'components/detail',
      'app/(site)/workflows/[name]',
      'app/(site)/tools/[handle]/[name]',
      'app/(site)/companies/[handle]',
      'components/contribute',
      'app/(site)/(docs)',
    ].flatMap((dir) =>
      readSourceFiles(dir, { skipTests: true })
        .filter((file) => !TITLE_LINE.includes(file.relativePath))
        .flatMap((file) =>
          [...file.source.matchAll(LARGE_TEXT)].map(
            (match) => `${file.relativePath}: ${match[0]}`
          )
        )
    )
    expect(offenders).toEqual([])
  })
})
