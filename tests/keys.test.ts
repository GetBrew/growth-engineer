import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  filePathToRef,
  filePathToTagKey,
  formatRef,
  isValidGithubLogin,
  isValidHandle,
  isValidOwnedKey,
  isValidTagKey,
  parseRef,
  RESERVED_HANDLES,
  refToFilePath,
  refToPath,
  tagFilePath,
} from '@/lib/catalog/keys'
import { REPO_ROOT } from './helpers/source-files'

describe('key grammar', () => {
  test.each(['clay', 'brew', 'a1', 'with-hyphens', 'x'.repeat(39)])(
    'accepts %s',
    (value) => {
      expect(isValidHandle(value)).toBe(true)
    }
  )

  test.each([
    'a',
    'Clay',
    '-lead',
    'trail-',
    'has space',
    'x'.repeat(40),
    'ünïcode',
    '',
  ])('rejects %s', (value) => {
    expect(isValidHandle(value)).toBe(false)
  })

  test('owned keys are exactly owner/name', () => {
    expect(isValidOwnedKey('clay/clay')).toBe(true)
    expect(isValidOwnedKey('brew/intent-to-meeting')).toBe(true)
    expect(isValidOwnedKey('clay')).toBe(false)
    expect(isValidOwnedKey('clay/a/b')).toBe(false)
    expect(isValidOwnedKey('tools/clay')).toBe(false) // reserved owner
  })

  test('a workflow author is a GitHub login', () => {
    for (const login of ['jdoe', 'a', 'thedogwiththedataonit', 'Jane-Doe1']) {
      expect(isValidGithubLogin(login), login).toBe(true)
    }
    for (const login of [
      '',
      '-jdoe',
      'jdoe-',
      'j--doe',
      'j doe',
      'j_doe',
      'x'.repeat(40),
    ]) {
      expect(isValidGithubLogin(login), login).toBe(false)
    }
  })

  test('tag keys are namespace:slug within the managed namespaces', () => {
    expect(isValidTagKey('capability:enrich-contacts')).toBe(true)
    expect(isValidTagKey('channel:email')).toBe(true)
    // `fit` is gone: the vocabulary is capability, motion, channel, category.
    expect(isValidTagKey('fit:smb')).toBe(false)
    expect(isValidTagKey('price:cheap')).toBe(false)
    expect(isValidTagKey('capability')).toBe(false)
  })
})

describe('reserved handles', () => {
  test('cover every top-level route and file the site serves', () => {
    // If a route is added under app/ its first segment must be reserved, or a
    // company could claim a handle that shadows it.
    const appDir = path.join(REPO_ROOT, 'app')
    const routeSegments = fs
      .readdirSync(appDir, { withFileTypes: true })
      .flatMap((entry) => {
        if (!entry.isDirectory()) {
          return []
        }
        if (entry.name.startsWith('(')) {
          // A route group: its children are the top-level segments.
          return fs
            .readdirSync(path.join(appDir, entry.name), { withFileTypes: true })
            .filter(
              (child) => child.isDirectory() && !child.name.startsWith('[')
            )
            .map((child) => child.name)
        }
        return entry.name.startsWith('[') ? [] : [entry.name]
      })
    for (const segment of routeSegments) {
      expect(
        RESERVED_HANDLES.has(segment),
        `"${segment}" must be in RESERVED_HANDLES`
      ).toBe(true)
    }
  })
})

describe('refs', () => {
  test('round-trip', () => {
    expect(parseRef('tool:clay/clay')).toEqual({
      type: 'tool',
      key: 'clay/clay',
    })
    expect(parseRef('workflow:intent-to-meeting')).toEqual({
      type: 'workflow',
      key: 'intent-to-meeting',
    })
    expect(formatRef('workflow', 'intent-to-meeting')).toBe(
      'workflow:intent-to-meeting'
    )
    expect(formatRef('company', 'clay')).toBe('company:clay')
  })

  test.each([
    'tool:clay',
    'company:clay/clay',
    'tool:clay/clay@2',
    // Versions are gone: a pin is not a ref.
    'workflow:intent-to-meeting@3',
    'user:jdoe',
    'clay/clay',
    'tool:Clay/Clay',
  ])('rejects %s', (value) => {
    expect(parseRef(value)).toBeNull()
  })

  test('paths and files', () => {
    const ref = parseRef('workflow:intent-to-meeting')
    expect(ref && refToPath(ref)).toBe('/workflows/intent-to-meeting')
    expect(ref && refToFilePath(ref)).toBe('/workflows/intent-to-meeting.md')
    expect(filePathToRef('/tools/clay/clay.md')).toEqual({
      type: 'tool',
      key: 'clay/clay',
    })
    expect(filePathToRef('/companies/clay.md')).toEqual({
      type: 'company',
      key: 'clay',
    })
    // A workflow key is ONE part: the author lives in the file, not the path.
    expect(filePathToRef('/workflows/brew/xy@2.md')).toBeNull()
    expect(parseRef('workflow:brew/xy')).toBeNull()
    expect(filePathToRef('/workflows/xy.md')).toEqual({
      type: 'workflow',
      key: 'xy',
    })
    expect(filePathToRef('/workflows/xy@2.md')).toBeNull()
    expect(filePathToRef('/tools/clay/clay')).toBeNull()
    expect(filePathToRef('/api/markdown/tools/clay/clay.md')).toBeNull()
    expect(filePathToRef('/tools/Clay/Clay.md')).toBeNull()
  })
})

describe('tag files', () => {
  test('a tag key and its file path name each other', () => {
    expect(tagFilePath('capability:enrich-contacts')).toBe(
      '/tags/capability/enrich-contacts.md'
    )
    expect(filePathToTagKey('/tags/capability/enrich-contacts.md')).toBe(
      'capability:enrich-contacts'
    )
    expect(filePathToTagKey('/tags/has/mcp.md')).toBe('has:mcp')
  })

  test.each([
    '/tags/fit/icp.md',
    '/tags/capability/Enrich.md',
    '/tags/capability/enrich-contacts',
    '/tags/capability/a/b.md',
    '/tools/capability/enrich-contacts.md',
  ])('%s is not a tag file', (pathname) => {
    expect(filePathToTagKey(pathname)).toBeNull()
  })
})
