import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { GET } from '@/app/logos/[file]/route'
import { getCatalog } from '@/lib/catalog/catalog'
import {
  type LogoExtension,
  logoField,
  logoKey,
  logoProblems,
  logoUrl,
  MAX_LOGO_BYTES,
  parseLogoUrl,
  withLogo,
} from '@/lib/content/logos'
import { png } from './helpers/png'

/**
 * Company logos: the rules a logo's bytes meet (a contributor's file, an
 * upload, what the CDN serves), its URL, the `logo:` line the upload writes,
 * and the old /logos/ URLs. Every rule is shown failing.
 */

/** A JPEG: SOI, an APP0 segment to skip, then the frame header (SOF0). */
function jpeg(width: number, height = width): Uint8Array {
  const bytes = Buffer.alloc(40)
  Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]).copy(bytes)
  const frame = 2 + 2 + 16
  Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08]).copy(bytes, frame)
  bytes.writeUInt16BE(height, frame + 5)
  bytes.writeUInt16BE(width, frame + 7)
  return bytes
}

/** A WebP whose first chunk is `chunk`, its size written the way each packs it. */
function webp(chunk: 'VP8 ' | 'VP8L' | 'VP8X', width: number, height = width) {
  const bytes = Buffer.alloc(40)
  bytes.write('RIFF', 0, 'ascii')
  bytes.write('WEBP', 8, 'ascii')
  bytes.write(chunk, 12, 'ascii')
  if (chunk === 'VP8 ') {
    bytes.writeUInt16LE(width, 26)
    bytes.writeUInt16LE(height, 28)
  } else if (chunk === 'VP8L') {
    // 14 bits of width - 1, then 14 of height - 1.
    bytes.writeUInt32LE(width - 1 + (height - 1) * 0x40_00, 21)
  } else {
    bytes.writeUIntLE(width - 1, 24, 3)
    bytes.writeUIntLE(height - 1, 27, 3)
  }
  return bytes
}

function svg(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

const SQUARE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'

describe('a logo file', () => {
  test.each<[string, Uint8Array, LogoExtension]>([
    ['a square PNG', png(128), 'png'],
    ['a JPEG', jpeg(180), 'jpg'],
    ['a lossy WebP', webp('VP8 ', 256), 'webp'],
    ['a lossless WebP', webp('VP8L', 180), 'webp'],
    ['an extended WebP', webp('VP8X', 1080), 'webp'],
    [
      'an SVG with a square viewBox',
      svg(`${SQUARE_SVG}<path d="M0 0h24v24z" fill="#000"/></svg>`),
      'svg',
    ],
    [
      'an SVG sized by width and height',
      svg('<svg width="512" height="512"><g/></svg>'),
      'svg',
    ],
    [
      'an SVG with an embedded image',
      svg(`${SQUARE_SVG}<image href="data:image/png;base64,AAAA"/></svg>`),
      'svg',
    ],
  ])('passes: %s', (_name, bytes, extension) => {
    expect(logoProblems(bytes, extension)).toEqual([])
  })

  test.each<[string, Uint8Array, LogoExtension, RegExp]>([
    [
      'too heavy',
      Buffer.concat([png(128), Buffer.alloc(MAX_LOGO_BYTES)]),
      'png',
      /^33 KB; a logo is drawn at 44px/,
    ],
    [
      'not square',
      png(200, 100),
      'png',
      /^it is 200×100; a logo is drawn in a square/,
    ],
    [
      'a WebP that is not square',
      webp('VP8X', 300, 200),
      'webp',
      /^it is 300×200/,
    ],
    ['too small', png(48), 'png', /^it is 48px square; use at least 64px/],
    [
      'a JPEG named .png',
      jpeg(128),
      'png',
      /^it is a JPEG named logo\.png: rename it logo\.jpg$/,
    ],
    ['not an image at all', svg('png'), 'png', /^it is not a PNG image$/],
    [
      'a JPEG with no frame header',
      Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
      'jpg',
      /^its size cannot be read/,
    ],
    [
      'an SVG that is not one',
      svg('<html></html>'),
      'svg',
      /^it is not an SVG image$/,
    ],
    [
      'an SVG with a script',
      svg(`${SQUARE_SVG}<script>alert(1)</script></svg>`),
      'svg',
      /cannot run script/,
    ],
    [
      'an SVG with a handler',
      svg(`<svg viewBox="0 0 1 1" onload="alert(1)"></svg>`),
      'svg',
      /cannot run script/,
    ],
    [
      'an SVG that loads a file',
      svg(`${SQUARE_SVG}<image href="https://evil.example/x.png"/></svg>`),
      'svg',
      /cannot load anything from another address/,
    ],
    [
      'an SVG that loads a font',
      svg(
        `${SQUARE_SVG}<style>@import url(//fonts.example/a.css)</style></svg>`
      ),
      'svg',
      /cannot load anything/,
    ],
    [
      'an SVG that follows the theme',
      svg(
        `${SQUARE_SVG}<style>@media (prefers-color-scheme:dark){path{fill:#fff}}</style></svg>`
      ),
      'svg',
      /prefers-color-scheme/,
    ],
    [
      'an SVG that is not square',
      svg('<svg viewBox="0 0 48 24"></svg>'),
      'svg',
      /^it is 48×24/,
    ],
    [
      'an SVG that cannot scale',
      svg('<svg><path d="M0 0"/></svg>'),
      'svg',
      /^it has no viewBox/,
    ],
  ])('fails: %s', (_name, bytes, extension, message) => {
    const problems = logoProblems(bytes, extension)
    expect(problems.join('\n')).toMatch(message)
  })
})

describe('a logo URL', () => {
  const sha = 'ab12cd34'.padEnd(64, '0')

  test('names its company and the start of its bytes’ SHA-256', () => {
    const url = logoUrl(logoKey('people-data-labs', 'png', sha))
    expect(url).toBe(
      'https://cdn.growth.engineer/icons/companies/people-data-labs-ab12cd34.png'
    )
    expect(parseLogoUrl(url)).toEqual({
      handle: 'people-data-labs',
      hash: 'ab12cd34',
      extension: 'png',
    })
  })

  test.each([
    'acme.png',
    'http://cdn.growth.engineer/icons/companies/acme-ab12cd34.png',
    'https://evil.example/icons/companies/acme-ab12cd34.png',
    'https://cdn.growth.engineer/assets/2026/09/acme-ab12cd34.png',
    'https://cdn.growth.engineer/icons/companies/acme-AB12CD34.png',
    'https://cdn.growth.engineer/icons/companies/acme-ab12cd34.gif',
    'https://cdn.growth.engineer/icons/companies/acme-ab12cd34.png?v=2',
  ])('is not %s', (url) => {
    expect(parseLogoUrl(url)).toBeUndefined()
  })
})

describe('the logo: line the upload writes', () => {
  const URL = 'https://cdn.growth.engineer/icons/companies/acme-ab12cd34.svg'
  const COMPANY =
    '---\nname: Acme\ndomain: acme.example\ncategory: crm\ndocs: https://docs.acme.example\napi:\n  url: https://api.acme.example\n  auth: none\nupdated: 2026-09-16\n---\n\nAcme sells anvils.\n'

  test('goes where the template puts it, before the ways in', () => {
    const written = withLogo(COMPANY, URL)
    expect(written).toBe(COMPANY.replace('api:\n', `logo: ${URL}\napi:\n`))
    expect(logoField(written)).toBe(URL)
  })

  test('replaces the one there, and reads a quoted one', () => {
    const next = URL.replace('ab12cd34', '99999999')
    const written = withLogo(withLogo(COMPANY, URL), next)
    expect(written.match(/^logo:/gm)).toHaveLength(1)
    expect(logoField(written)).toBe(next)
    expect(logoField(written.replace(`logo: ${next}`, `logo: "${next}"`))).toBe(
      next
    )
  })

  test('never reads or writes outside the header', () => {
    const body = `${COMPANY}\nlogo: ${URL}\n`
    expect(logoField(body)).toBeUndefined()
    expect(() => withLogo('# Acme\n', URL)).toThrow(/no --- header/)
  })
})

describe('the old /logos/ URLs', () => {
  async function get(file: string) {
    return await GET(new Request(`https://growth.engineer/logos/${file}`), {
      params: Promise.resolve({ file }),
    })
  }

  test('redirect to the logo on the CDN, whatever extension they ask for', async () => {
    const logo = getCatalog().companies.get('apollo')?.logo?.url
    expect(logo).toMatch(
      /^https:\/\/cdn\.growth\.engineer\/icons\/companies\/apollo-/
    )
    const files = ['apollo.webp', 'apollo.svg']
    const responses = await Promise.all(files.map(get))
    for (const [index, response] of responses.entries()) {
      expect(response.status, files[index]).toBe(308)
      expect(response.headers.get('location'), files[index]).toBe(logo)
    }
  })

  test('answer 404 for anything else', async () => {
    const files = ['nope.png', 'apollo', 'apollo.gif', '..%2Fx.png']
    const responses = await Promise.all(files.map(get))
    expect(responses.map((response) => response.status)).toEqual(
      files.map(() => 404)
    )
  })
})

describe('scripts/logos.mjs', () => {
  test('lib/content/logos.ts imports nothing, so plain Node can load it', () => {
    const source = readFileSync('lib/content/logos.ts', 'utf8')
    expect(source).not.toMatch(/^import\b/m)
  })

  test('loads in plain Node, the way pnpm runs it', () => {
    const script = JSON.parse(readFileSync('package.json', 'utf8')).scripts[
      'logos:check'
    ] as string
    const flags = script.split(' ').filter((part) => part.startsWith('--'))
    const output = execFileSync(
      process.execPath,
      [...flags, 'scripts/logos.mjs', '--help'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    )
    expect(output).toMatch(/pnpm logos:upload/)
  })
})
