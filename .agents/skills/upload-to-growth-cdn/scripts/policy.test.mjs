/**
 * Guards for the upload-to-cdn skill. Zero dependencies:
 *
 *   node --test .agents/skills/upload-to-growth-cdn/scripts/
 *
 * The wrong-store case is the one worth reading twice: a token for another
 * Vercel Blob store uploads happily and returns that store's host, so the
 * host check is the only thing standing between a growth.engineer asset and
 * somebody else's production bucket.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  GLOBAL_STATIC_BLOB_KEY_PREFIXES,
  IMMUTABLE_BLOB_KEY_PREFIXES,
  WRITABLE_BLOB_KEY_PREFIXES,
  classifyPrefix,
  describeSensitiveFile,
} from './policy.mjs'
import { assertExpectedStore } from './upload.mjs'

const BLOB_HOST = '5fmu7zbl5jrz8dwz.public.blob.vercel-storage.com'
const BREW_HOST = '0edx89zhjrasqnjf.public.blob.vercel-storage.com'

test('writable keyspaces are the global-static ones minus _next/', () => {
  assert.deepEqual(WRITABLE_BLOB_KEY_PREFIXES, ['assets/', 'icons/', 'media/'])
  assert.ok(GLOBAL_STATIC_BLOB_KEY_PREFIXES.includes('_next/'))
  assert.equal(classifyPrefix('_next').ok, false)
})

test('the default prefix and its subpaths are accepted', () => {
  for (const prefix of ['assets', 'assets/video', '/assets/', 'icons', 'media/raw']) {
    assert.equal(classifyPrefix(prefix).ok, true, `${prefix} should be writable`)
  }
})

test('an unregistered keyspace is refused', () => {
  const verdict = classifyPrefix('uploads')
  assert.equal(verdict.ok, false)
  assert.match(verdict.reason, /not a global-static keyspace/)
})

test('a malformed prefix is refused before anything else', () => {
  for (const prefix of ['Assets', '../assets', 'assets stuff', '']) {
    assert.equal(classifyPrefix(prefix).ok, false, `${prefix} should be refused`)
  }
})

test('an immutable keyspace is refused from inside AND from above', () => {
  // The list is empty today, so prove the MECHANISM against a stand-in
  // rather than trusting an assertion that passes vacuously.
  IMMUTABLE_BLOB_KEY_PREFIXES.push('assets/tenant/')
  try {
    // Inside it: caught by key.startsWith(candidate).
    assert.equal(classifyPrefix('assets/tenant/acme').ok, false, 'inside the keyspace')
    // Exactly it: also caught by the first half, since key is 'assets/tenant/'.
    assert.equal(classifyPrefix('assets/tenant').ok, false, 'the keyspace itself')
    // STRICTLY ABOVE it: only candidate.startsWith(key) can catch this, and
    // 'assets' is otherwise the default writable prefix -- so this case is
    // the sole proof that the check is symmetric.
    const above = classifyPrefix('assets')
    assert.equal(above.ok, false, 'a prefix that CONTAINS the keyspace')
    assert.match(above.reason, /write-once keyspace/)
  } finally {
    IMMUTABLE_BLOB_KEY_PREFIXES.length = 0
  }
})

test('credential-shaped file names are refused', () => {
  for (const name of ['.env.local', 'server.pem', 'id_rsa', 'credentials.json', '.npmrc']) {
    assert.ok(describeSensitiveFile(name, ''), `${name} should be refused`)
  }
  assert.equal(describeSensitiveFile('hero.mp4', ''), null)
})

test('credential-shaped contents are refused even under an innocent name', () => {
  assert.ok(describeSensitiveFile('notes.txt', '-----BEGIN RSA PRIVATE KEY-----'))
  assert.ok(describeSensitiveFile('notes.txt', 'GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN=x'))
  assert.equal(describeSensitiveFile('notes.txt', 'just some prose about sk_live pricing'), null)
})

test('a blob that landed in ANOTHER store is caught and named', () => {
  const key = 'assets/2026/09/hero-3f2a9c1e.mp4'
  assert.throws(
    () => assertExpectedStore(`https://${BREW_HOST}/${key}`, key, '$BLOB_READ_WRITE_TOKEN'),
    (error) => {
      assert.match(error.message, /WRONG STORE/)
      assert.match(error.message, /vercel blob del/)
      return true
    }
  )
})

test('a blob at the right host but the wrong key is caught', () => {
  assert.throws(
    () => assertExpectedStore(`https://${BLOB_HOST}/assets/2026/09/other.mp4`, 'assets/2026/09/hero.mp4', '$X'),
    /expected assets\/2026\/09\/hero\.mp4/
  )
})

test('a missing URL is a failure, never a silent pass', () => {
  assert.throws(() => assertExpectedStore(null, 'assets/x.mp4', '$X'), /printed no URL/)
})

test('the correct store and key pass', () => {
  const key = 'assets/2026/09/hero-3f2a9c1e.mp4'
  assert.doesNotThrow(() => assertExpectedStore(`https://${BLOB_HOST}/${key}`, key, '$X'))
})
