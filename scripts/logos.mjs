#!/usr/bin/env node
/**
 * Company logos on cdn.growth.engineer: the maintainer's half of the flow in
 * docs/maintainers/logos.md. A contributor adds `companies/<handle>/logo.<ext>`
 * and the build checks it (lib/content/logos.ts); this command moves it to
 * the CDN, and checks that every logo there is whole.
 *
 *   pnpm logos:upload [--dry-run] [<handle>...]
 *     Each logo file waiting in a company folder is checked by the build's
 *     rules, put on the CDN under a key named for its bytes (kept as is when
 *     that key already holds them), read back through cdn.growth.engineer and
 *     compared byte for byte, then written into company.md as `logo:` and
 *     deleted. Needs GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN, from the
 *     environment or .env.local.
 *
 *   pnpm logos:check
 *     Every company's logo is on the CDN: each `logo:` answers 200 with the
 *     bytes its URL names, typed for its extension, and passes the rules; no
 *     file is still waiting. Needs no token. CI runs it.
 */
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { BlobNotFoundError, head, put } from '@vercel/blob'
import {
  LOGO_CONTENT_TYPES,
  LOGO_FILE,
  logoField,
  logoKey,
  logoProblems,
  logoUrl,
  parseLogoUrl,
  withLogo,
} from '../lib/content/logos.ts'
import { logoUploadToken } from '../lib/env.ts'

const COMPANIES = 'companies'
/** A key names its bytes, so a copy may be cached for as long as there is. */
const ONE_YEAR = 365 * 24 * 60 * 60
const PARALLEL = 6
const USAGE = `usage:
  pnpm logos:upload [--dry-run] [<handle>...]   move waiting logo files to cdn.growth.engineer
  pnpm logos:check                              check every logo on cdn.growth.engineer`

/** Problems, printed as `file: message`, and as annotations in GitHub Actions. */
const problems = []
function report(file, message) {
  problems.push({ file, message })
  console.error(
    process.env.GITHUB_ACTIONS === 'true'
      ? `::error file=${file}::${message}`
      : `✗ ${file}: ${message}`
  )
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function handles() {
  return readdirSync(COMPANIES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

/** The logo files waiting in a company folder: one, normally. */
function waitingLogos(handle) {
  return readdirSync(path.join(COMPANIES, handle))
    .filter((entry) => LOGO_FILE.test(entry))
    .map((entry) => ({
      handle,
      file: path.join(COMPANIES, handle, entry),
      extension: entry.slice('logo.'.length),
    }))
}

/** Run `task` over `items`, a few at a time: each worker takes the next. */
async function inParallel(items, task) {
  let next = 0
  const worker = async () => {
    const item = items[next]
    next += 1
    if (item === undefined) {
      return
    }
    await task(item)
    await worker()
  }
  await Promise.all(Array.from({ length: PARALLEL }, worker))
}

/** A logo as cdn.growth.engineer serves it, asked for up to three times. */
async function fetchLogo(url, attempt = 1) {
  try {
    const response = await fetch(url)
    if (response.status === 404) {
      return { status: 404 }
    }
    if (!response.ok) {
      throw new Error(`cdn.growth.engineer answered ${response.status}`)
    }
    return {
      status: 200,
      type: response.headers.get('content-type') ?? '',
      bytes: new Uint8Array(await response.arrayBuffer()),
    }
  } catch (error) {
    if (attempt === 3) {
      throw error
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    return fetchLogo(url, attempt + 1)
  }
}

/** What is wrong with the logo the CDN serves at `url`; nothing means whole. */
async function servedProblems(url) {
  const parts = parseLogoUrl(url)
  if (!parts) {
    return [`${url} is not a cdn.growth.engineer logo URL`]
  }
  const served = await fetchLogo(url)
  if (served.status === 404) {
    return [`${url} answers 404: upload the logo again with pnpm logos:upload`]
  }
  const found = []
  const type = LOGO_CONTENT_TYPES[parts.extension]
  if (!served.type.startsWith(type)) {
    found.push(`${url} is served as ${served.type || 'nothing'}, not ${type}`)
  }
  const hash = sha256(served.bytes).slice(0, 8)
  if (hash !== parts.hash) {
    found.push(
      `${url} holds bytes that hash to ${hash}, not the ${parts.hash} its URL names`
    )
  }
  for (const problem of logoProblems(served.bytes, parts.extension)) {
    found.push(`${url}: ${problem}`)
  }
  return found
}

/** Put a logo's bytes at its key, unless the key already holds them. */
async function putOnce(key, bytes, extension, token) {
  try {
    await head(key, { token })
    return 'exists'
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) {
      throw error
    }
  }
  const blob = await put(key, Buffer.from(bytes), {
    access: 'public',
    token,
    contentType: LOGO_CONTENT_TYPES[extension],
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: ONE_YEAR,
  })
  return { uploaded: blob.url }
}

async function uploadOne({ handle, file, extension }, token) {
  try {
    await moveToCdn(handle, file, extension, token)
  } catch (error) {
    // One logo's failure (the network, the token) never stops the others.
    report(file, error instanceof Error ? error.message : String(error))
  }
}

async function moveToCdn(handle, file, extension, token) {
  const bytes = readFileSync(file)
  const found = logoProblems(bytes, extension)
  if (found.length > 0) {
    for (const problem of found) {
      report(file, problem)
    }
    return
  }
  const key = logoKey(handle, extension, sha256(bytes))
  const url = logoUrl(key)
  if (!token) {
    console.log(`would put   ${file} → ${url}`)
    return
  }
  const result = await putOnce(key, bytes, extension, token)
  const servedWrong = await servedProblems(url)
  if (servedWrong.length > 0) {
    // The CDN serves one store. A blob it cannot find went to another one,
    // which is what a token for a different Vercel Blob store does quietly.
    const stray =
      typeof result === 'object'
        ? ` The upload went to ${result.uploaded}: if that is another store, delete it (vercel blob del ${result.uploaded}) and use the growtheng-cdn token.`
        : ''
    report(file, `${servedWrong.join('; ')}.${stray}`)
    return
  }
  const companyFile = path.join(COMPANIES, handle, 'company.md')
  writeFileSync(companyFile, withLogo(readFileSync(companyFile, 'utf8'), url))
  rmSync(file)
  const verb = result === 'exists' ? 'kept' : 'uploaded'
  console.log(`${verb.padEnd(10)}  ${file} → ${url}`)
}

async function upload(only, isDryRun) {
  const token = isDryRun ? undefined : logoUploadToken()
  if (!(isDryRun || token)) {
    report(
      '.env.local',
      'GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN is not set: copy the growtheng-cdn token from the Vercel dashboard (Storage, growtheng-cdn, tokens) into .env.local'
    )
    return
  }
  const all = handles()
  for (const handle of only.filter((name) => !all.includes(name))) {
    report(path.join(COMPANIES, handle), 'no such company folder')
  }
  const waiting = []
  for (const handle of all) {
    if (only.length > 0 && !only.includes(handle)) {
      continue
    }
    const files = waitingLogos(handle)
    if (files.length > 1) {
      report(
        path.join(COMPANIES, handle),
        `${files.length} logo files: keep one`
      )
    } else if (files[0]) {
      waiting.push(files[0])
    }
  }
  if (waiting.length === 0 && problems.length === 0) {
    console.log('No logo file is waiting for the CDN.')
    return
  }
  await inParallel(waiting, (logo) => uploadOne(logo, token))
}

async function check() {
  const logos = []
  for (const handle of handles()) {
    const waiting = waitingLogos(handle)
    for (const { file } of waiting) {
      report(
        file,
        'waiting for a maintainer to run pnpm logos:upload, which moves it to cdn.growth.engineer (nothing to fix in the pull request)'
      )
    }
    const companyFile = path.join(COMPANIES, handle, 'company.md')
    let url
    try {
      url = logoField(readFileSync(companyFile, 'utf8'))
    } catch {
      continue
    }
    if (url) {
      logos.push({ companyFile, url })
    } else if (waiting.length === 0) {
      report(companyFile, 'no logo: pnpm content:check says how to add one')
    }
  }
  await inParallel(logos, async ({ companyFile, url }) => {
    try {
      for (const problem of await servedProblems(url)) {
        report(companyFile, problem)
      }
    } catch (error) {
      report(companyFile, `${url} could not be fetched: ${error.message}`)
    }
  })
  if (problems.length === 0) {
    console.log(`✓ ${logos.length} logos on cdn.growth.engineer, all whole`)
  }
}

const [command, ...rest] = process.argv.slice(2)
if (command === 'upload' || command === 'check') {
  try {
    // Maintainers keep the token in .env.local; the environment wins.
    process.loadEnvFile('.env.local')
  } catch {
    // No .env.local: the environment may still hold the token.
  }
}
if (command === 'upload') {
  const flags = rest.filter((arg) => arg.startsWith('--'))
  const unknownFlag = flags.find((flag) => flag !== '--dry-run')
  if (unknownFlag) {
    console.error(`unknown option ${unknownFlag}\n${USAGE}`)
    process.exit(1)
  }
  await upload(
    rest.filter((arg) => !arg.startsWith('--')),
    flags.includes('--dry-run')
  )
} else if (command === 'check') {
  await check()
} else {
  console.log(USAGE)
  process.exit(command === '--help' || command === '-h' ? 0 : 1)
}
if (problems.length > 0) {
  console.error(`\n${problems.length} logo problem(s)`)
  process.exitCode = 1
}
