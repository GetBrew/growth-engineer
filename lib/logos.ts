/**
 * Every company logo is a file in `public/logos`, named by the company's
 * `logo:` field. The one remote source left is a contributor's GitHub photo,
 * which Next must not put through its optimizer.
 */
export function isRemoteLogo(src: string): boolean {
  return src.startsWith('https://')
}
