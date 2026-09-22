/**
 * FNV-1a, 32-bit, as 8 hex characters. Sync and dependency-free on purpose:
 * this module runs at build time and in the browser alike (no `node:crypto`),
 * and the hash only has to answer "did this file change?".
 */
export function fnv1a(input: string): string {
  let hash = 0x81_1c_9d_c5
  for (let index = 0; index < input.length; index += 1) {
    // biome-ignore lint/suspicious/noBitwiseOperators: FNV-1a is defined on 32-bit integers
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01_00_01_93)
  }
  // biome-ignore lint/suspicious/noBitwiseOperators: reinterpret as unsigned before printing
  return (hash >>> 0).toString(16).padStart(8, '0')
}
