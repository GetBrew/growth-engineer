# Logos

Every company's logo is served from cdn.growth.engineer, and `company.md`
names it in one line:

```yaml
logo: https://cdn.growth.engineer/icons/companies/heyreach-5356c2dd.webp
```

Nobody writes that line by hand: `pnpm logos:upload` does. The name is the
company's handle plus the first 8 hex digits of the image's SHA-256, so a new
logo gets a new URL and every copy can be cached for a year. The rules, the
name and the line live in [`lib/content/logos.ts`](../../lib/content/logos.ts).

## A contributor's logo, start to finish

1. The contributor adds the image beside `company.md` as `logo.svg`,
   `logo.png`, `logo.jpg` or `logo.webp`. They can't upload to the CDN.
2. CI checks it. `pnpm content:check` applies the rules below and names the
   file on failure. The `logos` job stays red while the file waits, with a
   message telling the contributor there is nothing for them to fix.
3. A maintainer compares the image (GitHub shows it in the pull request) with
   the icon on the company's own site: the current mark, not a wordmark.
4. The maintainer moves it to the CDN on the pull request's branch, and the
   `logos` job turns green:

   ```bash
   gh pr checkout <number>
   pnpm logos:upload
   git commit -am "Move <handle>'s logo to the CDN" && git push
   ```

   If the branch doesn't take pushes from maintainers, merge first and run
   the same commands on `main`.

`pnpm logos:upload` uploads every waiting file, reads it back through
cdn.growth.engineer to compare it byte for byte, writes `logo:` into
`company.md` and deletes the file. Running it twice is safe. A maintainer
adding a company runs it before opening the pull request.

## The rules

A logo is drawn at 16 to 44px on a white tile. Each rule runs on the file in
the pull request, before the upload, and on what the CDN serves:

- at most 32 KB, and square (an SVG's `viewBox`, a raster's pixels);
- a raster of at least 64px;
- the bytes match the extension;
- an SVG runs no script, loads nothing from elsewhere and never uses
  `prefers-color-scheme`: a favicon that turns white for dark-mode viewers
  vanishes on the white tile.

## Commands

| Command | Does |
| --- | --- |
| `pnpm logos:upload [<handle>…]` | Moves waiting logo files to the CDN. Needs the token. |
| `pnpm logos:upload --dry-run` | Prints each waiting file's URL and uploads nothing. |
| `pnpm logos:check` | Checks that every `logo:` answers 200 with the bytes its URL names and that no file waits. CI runs it. |

Both live in [`scripts/logos.mjs`](../../scripts/logos.mjs).

## The token

`pnpm logos:upload` reads `GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN` from the
environment or `.env.local`: the read-write token of the `growtheng-cdn`
Vercel Blob store (Vercel dashboard, brew team, Storage, growtheng-cdn).
Keep it in `.env.local`, never in chat, an issue or a commit, and rotate it
if it leaks. The generic `BLOB_READ_WRITE_TOKEN` is never read: another
store's token under that name would upload without complaint. If the wrong
store's token is used anyway, the read-back fails and the command prints the
stray blob's URL for `vercel blob del`.

## Replacing a logo

Add the new file and run `pnpm logos:upload`; it rewrites the `logo:` line.
The old image stays on the CDN, since cached copies may still point at it.

## Old URLs

The site used to serve logos at `/logos/<handle>.<ext>`, and company pages
named those URLs in their structured data. Each now answers with a 308 to the
company's current logo ([`app/logos/[file]/route.ts`](<../../app/logos/[file]/route.ts>)).
