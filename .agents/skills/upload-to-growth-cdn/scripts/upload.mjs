#!/usr/bin/env node
/**
 * upload-to-cdn — upload local files to growth.engineer's Vercel Blob store
 * (`growtheng-cdn`) and print their permanent cdn.growth.engineer URLs.
 *
 * Zero dependencies (Node >= 18). Uses the Vercel CLI (`vercel blob put`) so
 * it works from any project on the machine, not only inside a growth.engineer
 * checkout.
 *
 *   node upload.mjs <file...> [--prefix assets] [--name <slug>] [--overwrite]
 *                            [--cache-max-age <seconds>] [--allow-sensitive]
 *                            [--json] [--dry-run]
 *
 * Keys: <prefix>/<yyyy>/<mm>/<slug>-<sha256[0:8]><ext>. The content hash in the
 * key makes re-uploading identical bytes a no-op (the existing blob is
 * returned as success). The token is read from
 * GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN, else BLOB_READ_WRITE_TOKEN, in the
 * environment or the nearest .env.local. It is never printed and never
 * written anywhere by this script.
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { classifyPrefix, describeSensitiveFile } from './policy.mjs'

const BLOB_HOST = '5fmu7zbl5jrz8dwz.public.blob.vercel-storage.com'
const CDN_HOST = 'cdn.growth.engineer'
const STORE_NAME = 'growtheng-cdn'
const DEFAULT_PREFIX = 'assets'
// Token env vars, most specific first. The unprefixed name is shared with
// every other Vercel Blob store on this machine (Brew's, notably), so it is
// only a fallback -- see assertExpectedStore for what catches a wrong one.
const TOKEN_ENV_VARS = ['GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN', 'BLOB_READ_WRITE_TOKEN']
// Bytes inspected for credential shapes before an upload (see policy.mjs).
const SENSITIVE_SNIFF_BYTES = 4096

function usage(code) {
  const text = [
    'usage: upload.mjs <file...> [--prefix assets] [--name <slug>] [--overwrite]',
    '                            [--cache-max-age <seconds>] [--allow-sensitive]',
    '                            [--json] [--dry-run]',
    '',
    '  --prefix         key prefix inside a global-static keyspace (default: assets);',
    '                   see policy.mjs for the allowed set.',
    '  --name           slug to use instead of the file name (single file only)',
    '  --overwrite      replace an existing blob at the same key',
    '  --cache-max-age  Cache-Control max-age seconds (default: CLI default, 30 days)',
    '  --allow-sensitive  upload a file whose name or contents look like a credential',
    '                   (only when it is genuinely meant to be public)',
    '  --json           print a JSON array instead of text',
    '  --dry-run        compute keys and URLs without uploading',
    '',
    `Token: ${TOKEN_ENV_VARS.join(' or ')}, from the environment or the nearest .env.local.`,
  ].join('\n')
  process.stderr.write(`${text}\n`)
  process.exit(code)
}

function parseArgs(argv) {
  const opts = {
    files: [],
    prefix: DEFAULT_PREFIX,
    name: null,
    overwrite: false,
    cacheMaxAge: null,
    allowSensitive: false,
    json: false,
    dryRun: false,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    switch (arg) {
      case '--prefix':
        opts.prefix = argv[++i] ?? usage(1)
        break
      case '--name':
        opts.name = argv[++i] ?? usage(1)
        break
      case '--overwrite':
        opts.overwrite = true
        break
      case '--cache-max-age':
        opts.cacheMaxAge = Number(argv[++i])
        if (!Number.isFinite(opts.cacheMaxAge)) usage(1)
        break
      case '--allow-sensitive':
        opts.allowSensitive = true
        break
      case '--json':
        opts.json = true
        break
      case '--dry-run':
        opts.dryRun = true
        break
      case '-h':
      case '--help':
        usage(0)
        break
      default:
        if (arg.startsWith('--')) usage(1)
        opts.files.push(arg)
    }
  }
  if (opts.files.length === 0) usage(1)
  if (opts.name && opts.files.length > 1) {
    process.stderr.write('--name only applies to a single file\n')
    process.exit(1)
  }
  return opts
}

function slugify(value) {
  const slug = value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  return slug || 'file'
}

function assertPrefix(prefix) {
  const verdict = classifyPrefix(prefix)
  if (!verdict.ok) {
    process.stderr.write(`refusing --prefix "${prefix}": ${verdict.reason}\n`)
    process.exit(1)
  }
  return verdict.clean
}

function readHead(file) {
  const bytes = readFileSync(file)
  return bytes.subarray(0, SENSITIVE_SNIFF_BYTES).toString('utf8')
}

function findEnvToken(startDir) {
  let dir = resolve(startDir)
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = join(dir, '.env.local')
    if (existsSync(candidate)) {
      const contents = readFileSync(candidate, 'utf8')
      for (const name of TOKEN_ENV_VARS) {
        const match = contents.match(
          new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=\\s*(.+?)\\s*$`, 'm')
        )
        if (match) {
          return { token: match[1].replace(/^["']|["']$/g, ''), source: `${name} in ${candidate}` }
        }
      }
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function resolveToken() {
  for (const name of TOKEN_ENV_VARS) {
    const value = process.env[name]?.trim()
    if (value) return { token: value, source: `$${name}` }
  }
  const fromFile = findEnvToken(process.cwd())
  if (fromFile) return fromFile
  process.stderr.write(
    `No blob token found. Export ${TOKEN_ENV_VARS[0]} for the ${STORE_NAME} store (never commit it).\n` +
      `No CLI command prints a read-write token, so copy it from the Vercel dashboard:\n` +
      `  brew team -> Storage -> ${STORE_NAME} -> tokens\n` +
      `Then: export ${TOKEN_ENV_VARS[0]}=...\n`
  )
  process.exit(1)
}

function buildPathname(file, opts) {
  const bytes = readFileSync(file)
  const hash8 = createHash('sha256').update(bytes).digest('hex').slice(0, 8)
  // The extension is part of the key: keep it URL-clean like the slug.
  const ext = extname(file)
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '')
  const stem = opts.name ?? basename(file, extname(file))
  const now = new Date()
  const yyyy = String(now.getUTCFullYear())
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  return {
    pathname: `${opts.prefix}/${yyyy}/${mm}/${slugify(stem)}-${hash8}${ext}`,
    size: bytes.length,
  }
}

async function blobExists(pathname) {
  try {
    const response = await fetch(`https://${BLOB_HOST}/${pathname}`, {
      method: 'HEAD',
    })
    return response.ok
  } catch {
    return false
  }
}

function runVercelPut(file, pathname, opts, token, useFlag) {
  // NOTE: `--add-random-suffix` is a presence flag in the CLI; passing
  // `--add-random-suffix false` still appends a suffix. Omit it entirely.
  const args = [
    'blob',
    'put',
    file,
    '--access',
    'public',
    '--pathname',
    pathname,
    '--non-interactive',
  ]
  if (opts.overwrite) args.push('--allow-overwrite', 'true')
  if (opts.cacheMaxAge !== null) args.push('--cache-control-max-age', String(opts.cacheMaxAge))
  if (useFlag) args.push('--rw-token', token)
  const result = spawnSync('vercel', args, {
    env: { ...process.env, BLOB_READ_WRITE_TOKEN: token },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 8 * 1024 * 1024,
  })
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
  if (result.status !== 0) {
    const error = new Error(`vercel blob put exited ${result.status}`)
    error.stderr = output
    throw error
  }
  return output
}

/** First https URL the CLI printed, whatever host it names. */
function extractUrl(output) {
  const urls = output.match(/https:\/\/[^\s"'`]+/g) ?? []
  return urls.find((url) => /\.vercel-storage\.com\//.test(url) || url.includes(CDN_HOST)) ?? null
}

/**
 * The blob landed somewhere. Prove it landed in OUR store at OUR key.
 *
 * A token for a different Vercel Blob store uploads happily and returns that
 * store's host, so host mismatch is the signal that the resolved token is the
 * wrong one -- most likely another project's BLOB_READ_WRITE_TOKEN picked up
 * from the shell or a parent .env.local.
 */
export function assertExpectedStore(uploadedUrl, pathname, tokenSource) {
  if (!uploadedUrl) {
    throw new Error('vercel blob put printed no URL, so the upload could not be verified')
  }
  const { host, pathname: returned } = new URL(uploadedUrl)
  if (host !== BLOB_HOST && host !== CDN_HOST) {
    throw new Error(
      `WRONG STORE: the blob was uploaded to ${host}, not ${STORE_NAME} (${BLOB_HOST}).\n` +
        `  The token came from ${tokenSource}, which belongs to another store.\n` +
        `  Delete the stray blob with: vercel blob del ${uploadedUrl}\n` +
        `  Then export ${TOKEN_ENV_VARS[0]} for ${STORE_NAME} and retry.`
    )
  }
  if (returned.replace(/^\//, '') !== pathname) {
    throw new Error(`store returned key ${returned.replace(/^\//, '')}, expected ${pathname}`)
  }
}

function redact(text, token) {
  return token ? text.split(token).join('<redacted>') : text
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  opts.prefix = assertPrefix(opts.prefix)
  const resolved = opts.dryRun ? null : resolveToken()
  const token = resolved?.token ?? null
  const results = []
  let failed = false

  for (const input of opts.files) {
    const file = resolve(input)
    if (!existsSync(file) || !statSync(file).isFile()) {
      process.stderr.write(`not a file: ${input}\n`)
      failed = true
      continue
    }
    const sensitive = describeSensitiveFile(basename(file), readHead(file))
    if (sensitive && !opts.allowSensitive) {
      process.stderr.write(
        `refusing ${input}: ${sensitive}. The CDN is public and permanent; pass --allow-sensitive only when this file is meant to be public.\n`
      )
      failed = true
      continue
    }
    const { pathname, size } = buildPathname(file, opts)
    const rawUrl = `https://${BLOB_HOST}/${pathname}`
    const cdnUrl = `https://${CDN_HOST}/${pathname}`
    const existed = !opts.dryRun && (await blobExists(pathname))
    let status = 'dry-run'

    if (!opts.dryRun) {
      if (existed && !opts.overwrite) {
        status = 'exists'
      } else {
        try {
          let output
          try {
            output = runVercelPut(file, pathname, opts, token, false)
          } catch (error) {
            const stderr = redact(String(error.stderr ?? error.message ?? ''), token)
            if (/token/i.test(stderr)) {
              output = runVercelPut(file, pathname, opts, token, true)
            } else {
              throw error
            }
          }
          assertExpectedStore(extractUrl(output), pathname, resolved.source)
          status = existed ? 'overwritten' : 'uploaded'
        } catch (error) {
          failed = true
          status = 'failed'
          process.stderr.write(
            `${input}: upload failed: ${redact(String(error.stderr ?? error.message ?? error), token)}\n`
          )
        }
      }
    }

    results.push({ file: input, pathname, size, status, url: rawUrl, cdnUrl })
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`)
  } else {
    for (const result of results) {
      process.stdout.write(
        `${result.status.padEnd(11)} ${result.file} (${result.size} bytes)\n  cdn: ${result.cdnUrl}\n  raw: ${result.url}\n`
      )
    }
  }
  process.exit(failed ? 1 : 0)
}

// Only run when invoked as the CLI, so tests can import the guards above.
// realpathSync matters: this file is normally reached through a symlink in
// ~/.claude/skills, and import.meta.url is always the RESOLVED path. Comparing
// against an unresolved argv[1] makes the CLI a silent no-op that exits 0.
const invokedPath = process.argv[1] ? pathToFileURL(realpathSync(process.argv[1])).href : null
if (invokedPath && import.meta.url === invokedPath) {
  main().catch((error) => {
    process.stderr.write(`${error?.message ?? error}\n`)
    process.exit(1)
  })
}
