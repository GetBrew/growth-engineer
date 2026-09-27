/**
 * The header of a rendered file: flat YAML an agent parses. Every value an
 * author wrote goes through `yamlScalar`, so a title with a colon, a `#`, a
 * leading quote or a login like `true` still parses back to exactly what
 * was written — and a value can never close the header or add a field.
 *
 * PURE MODULE: no imports. The tests round-trip hostile values through the
 * real YAML parser; the renderer itself never needs one.
 */

/** Plain scalars YAML's core schema would read as something else. */
const TYPED =
  /^(?:true|false|null|~|[-+]?(?:\.inf|\.nan)|[-+]?[0-9][0-9_.eE+-]*|0x[0-9a-fA-F]+|0o[0-7]+)$/i

/**
 * Safe unquoted: starts with a letter or digit, no quote, backslash, bracket
 * or brace anywhere, no `: ` or ` #` (a key or a comment), no trailing
 * colon, no surrounding space, one line.
 */
const PLAIN = /^[A-Za-z0-9][^"'\\\n\r\t{}[\]`]*$/

function isPlainSafe(value: string): boolean {
  return (
    PLAIN.test(value) &&
    value === value.trim() &&
    !value.includes(': ') &&
    !value.includes(' #') &&
    !value.endsWith(':') &&
    !TYPED.test(value)
  )
}

/** A YAML scalar meaning exactly `value`: bare when that is safe, else JSON (valid YAML). */
export function yamlScalar(value: string): string {
  return isPlainSafe(value) ? value : JSON.stringify(value)
}

/** `[a, b]` — for keys, refs and tags, whose grammar is always plain-safe. */
export function yamlList(values: ReadonlyArray<string>): string {
  return `[${values.join(', ')}]`
}
