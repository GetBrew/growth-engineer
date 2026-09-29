/**
 * Company logos. A contributor adds the image beside company.md
 * (`companies/<handle>/logo.svg`, or .png, .jpg, .webp) and the build checks
 * it with `logoProblems`. A maintainer then runs `pnpm logos:upload`, which
 * puts it on cdn.growth.engineer under a key named for its bytes, writes that
 * URL into company.md as `logo:` and deletes the file. The site only ever
 * draws the URL. The flow is in docs/maintainers/logos.md.
 *
 * IMPORTS NOTHING: the content compiler loads this file, and so does
 * scripts/logos.mjs, in plain Node, with no path aliases and no bundler.
 */

export type LogoExtension = 'svg' | 'png' | 'jpg' | 'webp'

/** A logo file waiting in a company folder for a maintainer to upload it. */
export const LOGO_FILE = /^logo\.(svg|png|jpg|webp)$/

/** Where every logo is served from. */
export const LOGO_ORIGIN = 'https://cdn.growth.engineer'

/**
 * `https://cdn.growth.engineer/icons/companies/<handle>-<hash>.<ext>`, where
 * the hash is the first 8 hex digits of the bytes' SHA-256. A new logo is a
 * new URL, so a cached copy is never stale.
 */
const LOGO_URL =
  /^https:\/\/cdn\.growth\.engineer\/icons\/companies\/([a-z0-9-]+)-([0-9a-f]{8})\.(svg|png|jpg|webp)$/

/** Logos are drawn at 16 to 44px, so anything heavier is an unshrunk export. */
export const MAX_LOGO_BYTES = 32 * 1024

/** The smallest raster that stays sharp at 44px on a high-density screen. */
const MIN_LOGO_PIXELS = 64

export const LOGO_CONTENT_TYPES: Readonly<Record<LogoExtension, string>> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
}

/** The CDN key for a logo: its company and the start of its bytes' SHA-256. */
export function logoKey(
  handle: string,
  extension: LogoExtension,
  sha256: string
): string {
  return `icons/companies/${handle}-${sha256.slice(0, 8)}.${extension}`
}

/** The URL the CDN serves a key at. */
export function logoUrl(key: string): string {
  return `${LOGO_ORIGIN}/${key}`
}

export type LogoUrlParts = {
  handle: string
  hash: string
  extension: LogoExtension
}

/** A logo URL's parts, or undefined when it is not a logo URL. */
export function parseLogoUrl(url: string): LogoUrlParts | undefined {
  const match = LOGO_URL.exec(url)
  if (!match) {
    return
  }
  const [, handle = '', hash = '', extension = 'svg'] = match
  return { handle, hash, extension: extension as LogoExtension }
}

/* ───────────────────────────── the header field ─────────────────────────── */

/** The `---` header's line range in a company.md, or undefined. */
function headerRange(lines: ReadonlyArray<string>): number | undefined {
  if (lines[0]?.trim() !== '---') {
    return
  }
  const end = lines.findIndex(
    (line, index) => index > 0 && line.trim() === '---'
  )
  return end > 0 ? end : undefined
}

const LOGO_LINE = /^logo:\s*["']?([^"'\s]*)["']?\s*$/

/** The `logo:` a company.md header names, if any. */
export function logoField(source: string): string | undefined {
  const lines = source.split('\n')
  const end = headerRange(lines) ?? 0
  for (const line of lines.slice(1, end)) {
    const match = LOGO_LINE.exec(line)
    if (match) {
      return match[1]
    }
  }
}

/** The fields the template puts after `logo:`; it goes before the first. */
const AFTER_LOGO = /^(mcp|cli|api|aliases|status|updated):/

/**
 * company.md with `logo:` set to `url`: the line replaced where there is one,
 * else added where the template puts it, before the ways in.
 */
export function withLogo(source: string, url: string): string {
  const lines = source.split('\n')
  const end = headerRange(lines)
  if (end === undefined) {
    throw new Error('company.md has no --- header to write logo: into')
  }
  const line = `logo: ${url}`
  const header = lines.slice(0, end)
  const current = header.findIndex(
    (text, index) => index > 0 && LOGO_LINE.test(text)
  )
  if (current > 0) {
    lines[current] = line
    return lines.join('\n')
  }
  const next = header.findIndex(
    (text, index) => index > 0 && AFTER_LOGO.test(text)
  )
  lines.splice(next > 0 ? next : end, 0, line)
  return lines.join('\n')
}

/* ─────────────────────────────── the bytes ──────────────────────────────── */

type Size = { width: number; height: number }

const FORMAT_NAMES: Readonly<Record<LogoExtension, string>> = {
  svg: 'an SVG',
  png: 'a PNG',
  jpg: 'a JPEG',
  webp: 'a WebP',
}

/**
 * Everything wrong with a logo's bytes, as sentences; none means it is fine.
 * The same rules run on a contributor's file (the build), before an upload
 * and on what the CDN serves (scripts/logos.mjs).
 */
export function logoProblems(
  bytes: Uint8Array,
  extension: LogoExtension
): Array<string> {
  const problems: Array<string> = []
  if (bytes.length > MAX_LOGO_BYTES) {
    problems.push(
      `${Math.ceil(bytes.length / 1024)} KB; a logo is drawn at 44px, so keep it under ${MAX_LOGO_BYTES / 1024} KB (an SVG, or a PNG of 128 to 256px)`
    )
  }
  const size =
    extension === 'svg'
      ? svgSize(new TextDecoder().decode(bytes), problems)
      : rasterSize(bytes, extension, problems)
  if (!size) {
    return problems
  }
  if (size.width !== size.height) {
    problems.push(
      `it is ${size.width}×${size.height}; a logo is drawn in a square, so make it square`
    )
  } else if (extension !== 'svg' && size.width < MIN_LOGO_PIXELS) {
    problems.push(
      `it is ${size.width}px square; use at least ${MIN_LOGO_PIXELS}px so it stays sharp`
    )
  }
  return problems
}

const SVG_ROOT = /<svg\b[^>]*>/i
const SVG_SCRIPT = /<script\b|<foreignObject\b|\son[a-z]+\s*=|javascript:/i
const SVG_REMOTE =
  /(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\/|url\(\s*["']?\s*(?:https?:)?\/\//i
const SVG_THEMED = /prefers-color-scheme/i
const SVG_VIEW_BOX =
  /\sviewBox\s*=\s*["']\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i
const SVG_WIDTH = /\swidth\s*=\s*["']\s*([\d.]+)(?:px)?\s*["']/i
const SVG_HEIGHT = /\sheight\s*=\s*["']\s*([\d.]+)(?:px)?\s*["']/i

/**
 * An SVG's rules: an image that runs nothing, loads nothing and keeps its
 * colours. `prefers-color-scheme` is the trap: a favicon that turns white for
 * a dark-mode viewer vanishes on the site's white tiles.
 */
function svgSize(text: string, problems: Array<string>): Size | undefined {
  const root = SVG_ROOT.exec(text)
  if (!root) {
    problems.push('it is not an SVG image')
    return
  }
  if (SVG_SCRIPT.test(text)) {
    problems.push(
      'an SVG logo cannot run script: remove any <script>, <foreignObject>, on… handler or javascript: link'
    )
  }
  if (SVG_REMOTE.test(text)) {
    problems.push(
      'an SVG logo cannot load anything from another address: embed it or remove it'
    )
  }
  if (SVG_THEMED.test(text)) {
    problems.push(
      "it changes colour with the viewer's theme (prefers-color-scheme), but the site always draws it on white: give it fixed colours"
    )
  }
  const tag = root[0]
  const viewBox = SVG_VIEW_BOX.exec(tag)
  if (viewBox) {
    return { width: Number(viewBox[1]), height: Number(viewBox[2]) }
  }
  const width = SVG_WIDTH.exec(tag)
  const height = SVG_HEIGHT.exec(tag)
  if (width && height) {
    return { width: Number(width[1]), height: Number(height[1]) }
  }
  problems.push('it has no viewBox, so it cannot scale: add one')
}

/** Which raster format the bytes are, from their signature. */
function sniff(bytes: Uint8Array): LogoExtension | undefined {
  const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (PNG.every((byte, index) => bytes[index] === byte)) {
    return 'png'
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpg'
  }
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') {
    return 'webp'
  }
}

function rasterSize(
  bytes: Uint8Array,
  extension: LogoExtension,
  problems: Array<string>
): Size | undefined {
  const format = sniff(bytes)
  if (format !== extension) {
    problems.push(
      format
        ? `it is ${FORMAT_NAMES[format]} named logo.${extension}: rename it logo.${format}`
        : `it is not ${FORMAT_NAMES[extension]} image`
    )
    return
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let size: Size | undefined
  try {
    if (format === 'png') {
      size = pngSize(bytes, view)
    } else if (format === 'jpg') {
      size = jpegSize(bytes, view)
    } else {
      size = webpSize(bytes, view)
    }
  } catch {
    // A header cut short reads past the end: the same answer as no size.
  }
  if (!size) {
    problems.push('its size cannot be read from the file: export it again')
  }
  return size
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end))
}

/** PNG: the IHDR chunk comes first and holds the size. */
function pngSize(bytes: Uint8Array, view: DataView): Size | undefined {
  if (ascii(bytes, 12, 16) !== 'IHDR') {
    return
  }
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

/** JPEG: walk the segments to the frame header (SOF0 to SOF15). */
function jpegSize(bytes: Uint8Array, view: DataView): Size | undefined {
  let offset = 2
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      return
    }
    const marker = bytes[offset + 1] ?? 0
    if (marker === 0xff) {
      offset += 1
      continue
    }
    // Every SOFn has the size, except the markers that share its range:
    // DHT (C4), JPG (C8) and DAC (CC).
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: view.getUint16(offset + 5),
        width: view.getUint16(offset + 7),
      }
    }
    // Markers with no length: TEM, RSTn, SOI and EOI.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2
      continue
    }
    offset += 2 + view.getUint16(offset + 2)
  }
}

/**
 * WebP: the first chunk is lossy (VP8), lossless (VP8L) or extended (VP8X).
 * Each packs its size differently; `% 0x4000` keeps a 14-bit field.
 */
function webpSize(bytes: Uint8Array, view: DataView): Size | undefined {
  const chunk = ascii(bytes, 12, 16)
  if (chunk === 'VP8 ') {
    return {
      width: view.getUint16(26, true) % 0x40_00,
      height: view.getUint16(28, true) % 0x40_00,
    }
  }
  if (chunk === 'VP8L') {
    const bits = view.getUint32(21, true)
    return {
      width: (bits % 0x40_00) + 1,
      height: (Math.floor(bits / 0x40_00) % 0x40_00) + 1,
    }
  }
  if (chunk === 'VP8X') {
    const uint24 = (at: number) =>
      view.getUint16(at, true) + view.getUint8(at + 2) * 0x1_00_00
    return { width: uint24(24) + 1, height: uint24(27) + 1 }
  }
}
