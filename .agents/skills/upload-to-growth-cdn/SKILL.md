---
name: upload-to-growth-cdn
description: Upload a local file (image, video, PDF, font, JSON, fixture, screenshot) to growth.engineer's Vercel Blob store and get its permanent https://cdn.growth.engineer URL. Use when an agent or a human needs a file hosted publicly for growth.engineer - marketing media, docs assets, PR screenshots - or says "upload to cdn", "host this file", "put this on cdn.growth.engineer", "blob upload".
---

# Upload to CDN (growth.engineer)

One command turns a local file into a durable `https://cdn.growth.engineer/...` URL backed by
the `growtheng-cdn` Vercel Blob store. Works from any directory on this machine.

```bash
node ~/.claude/skills/upload-to-growth-cdn/scripts/upload.mjs ./hero.mp4
node ~/.claude/skills/upload-to-growth-cdn/scripts/upload.mjs a.png b.jpg --json
node ~/.claude/skills/upload-to-growth-cdn/scripts/upload.mjs ./guide.pdf --name growth-style-guide
node ~/.claude/skills/upload-to-growth-cdn/scripts/upload.mjs ./x.png --dry-run   # key + URLs, no upload
```

Inside this repo the script lives at `.agents/skills/upload-to-growth-cdn/scripts/upload.mjs`.

> **Installing it.** An agent working *inside this repo* needs no setup — the repo carries
> `.claude/skills/upload-to-growth-cdn`. To use it from other projects, run
> `./.agents/skills/upload-to-growth-cdn/install.sh`, which links it into `~/.claude/skills`.
>
> The name is `upload-to-growth-cdn`, never `upload-to-cdn`: Brew ships an `upload-to-cdn`
> skill pointing at a *different* blob store, and the skills namespace is flat, so sharing the
> name would make it a coin flip which store an upload lands in.

## What it does

1. Reads `GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN`, else `BLOB_READ_WRITE_TOKEN`, from the
   environment or the nearest `.env.local` up the directory tree. It never prints the token and
   never writes it anywhere. No CLI command prints a read-write token —
   `vercel blob get-store` returns metadata only — so copy it from the Vercel dashboard:
   the **brew** team -> **Storage** -> **growtheng-cdn** -> the store's tokens panel. Then
   `export GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN=...` (or add it to a gitignored `.env.local`).
   If the store is ever connected to a Vercel project, `vercel env pull` works too; it is
   connected to none today, which is why that project has no env vars.
   Never paste the token into chat, code, docs, or commits; rotate it in the Vercel dashboard
   if that happens.
2. Builds the key `assets/<yyyy>/<mm>/<slug>-<sha256[0:8]><ext>` from the file bytes.
   The slug is the file name lowercased with only `a-z 0-9 -`, and the extension is cleaned
   the same way (so URLs never carry `%20` or `%23`); `--name` overrides the slug.
3. Checks whether that key already exists (same bytes = same key) and returns it as
   success without re-uploading. `--overwrite` forces a replacement.
4. Uploads with `vercel blob put --access public --pathname <key>` (Vercel CLI >= 43;
   `vercel --version` to check), verifies the blob landed in **this** store at **that** key,
   and prints both URLs:

```
uploaded    ./hero.mp4 (15321842 bytes)
  cdn: https://cdn.growth.engineer/assets/2026/09/hero-3f2a9c1e.mp4
  raw: https://5fmu7zbl5jrz8dwz.public.blob.vercel-storage.com/assets/2026/09/hero-3f2a9c1e.mp4
```

Use the **cdn** URL in code, docs, and emails. The **raw** URL is only for
`vercel blob del|get <raw-url>` and Blob SDK calls, which do not accept the CDN host.

## The wrong-store hazard (read this once)

`BLOB_READ_WRITE_TOKEN` is a single env-var name shared by every Vercel Blob store on the
machine. A Brew token sitting in your shell or a parent `.env.local` will upload **happily**
to Brew's production store — the CLI has no idea which store you meant.

Two things guard that, and only the first prevents it:

- **Prefer the specific name.** `GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN` wins over the generic
  one, so exporting it makes the ambiguity disappear.
- **Post-upload host verification.** If the blob lands on another store's host, the script
  fails with `WRONG STORE`, names the host it actually hit, and prints the
  `vercel blob del <url>` needed to clean up. This fires *after* the bytes are written —
  it is a detector, not a preventer. Do the cleanup it tells you to.

## Key policy (do not bypass)

- Everything lands under `assets/` by default.
- `--prefix` accepts only a global-static keyspace (`assets`, `icons`, `media`, or a path
  beneath one). Anything nobody registered is refused, as is any prefix that sits inside — or
  *contains* — an immutable cross-tenant keyspace.
- `IMMUTABLE_BLOB_KEY_PREFIXES` in `scripts/policy.mjs` is empty today because the
  `growtheng-cdn` store holds no tenant-owned data. **The moment growth.engineer writes
  per-user or per-org blobs, list their prefixes there.** Unlike Brew's copy — which mirrors
  `lib/shared/blob/shared-key-prefixes.ts` and is pinned to it by a drift test — this file *is*
  the registry, so nothing else will catch an omission.
- The CDN is public and permanent, so the script refuses a file whose name or first bytes look
  like a credential (`.env*`, `*.pem`, `id_rsa`, a private-key block, an API-key or
  secret-bearing env line). `--allow-sensitive` overrides that only for a file that is genuinely
  meant to be public. Never upload `.env.local`.
- Uploads are create-if-absent. Only use `--overwrite` on a key you just created.

## Options

| Flag | Meaning |
| --- | --- |
| `--prefix <p>` | Top-level key prefix (default `assets`) |
| `--name <slug>` | Slug instead of the file name (single file) |
| `--overwrite` | Replace an existing blob at the same key |
| `--cache-max-age <s>` | `Cache-Control` max-age; default is the CLI's 30 days |
| `--allow-sensitive` | Upload a file that looks like a credential (name or contents); only when it is meant to be public |
| `--json` | Print `[{file, pathname, size, status, url, cdnUrl}]` |
| `--dry-run` | Compute keys and URLs only |

Exit code is non-zero if any file failed; `status` is one of `uploaded`, `exists`,
`overwritten`, `failed`, `dry-run`.

## Tests

```bash
node --test .agents/skills/upload-to-growth-cdn/scripts/*.test.mjs
```

Zero dependencies (Node's built-in runner). Covers the prefix policy, the credential sniffing,
the wrong-store detector, and the CLI's behaviour when reached through a symlink — the normal
case, and one whose failure mode is silent (no output, exit 0).

## Gotchas

- Big files upload in multipart chunks by default; a 15 MB video takes a few seconds.
- The CDN serves whatever the store holds; a wrong upload is fixed by uploading the corrected
  bytes (new hash, new key) and repointing references, not by overwriting.
- Vercel Blob has no folders: `assets/2026/09/` is just a key prefix. `vercel blob list`
  shows everything in the store.
- `cdn.growth.engineer` is served by the `vercel.json` rewrite in `GetBrew/growth-engineer-proxy`.
  If the CDN 404s but the
  raw blob host works, the proxy deployment is the thing to check, not the upload.
