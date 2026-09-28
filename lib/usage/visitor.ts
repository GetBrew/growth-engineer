import 'server-only'
import { createHmac } from 'node:crypto'

/**
 * Who copied, as far as counting needs to know: a keyed hash of the client's
 * address, so one person copying the same workflow again and again counts
 * once. The raw address is never stored; the key is a server secret, so the
 * hash cannot be reversed by hashing every address there is.
 *
 * On Vercel the client's address is `x-real-ip` (and the first hop of
 * `x-forwarded-for`, which Vercel overwrites, so a client cannot choose it).
 * An IPv6 client is its /64 — one household or phone, whichever address it
 * picked from the prefix today.
 */

function clientAddress(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]
  return (headers.get('x-real-ip') ?? forwarded ?? '').trim().toLowerCase()
}

const LEADING_ZEROS = /^0+(?=.)/

/** `2001:db8:abcd:12::1` → `2001:db8:abcd:12`: the first four groups. */
function ipv6Prefix(address: string): string {
  const [head = '', tail] = address.split('::')
  const left = head ? head.split(':') : []
  const right = tail ? tail.split(':') : []
  const groups =
    tail === undefined
      ? left
      : [
          ...left,
          ...new Array<string>(
            Math.max(0, 8 - left.length - right.length)
          ).fill('0'),
          ...right,
        ]
  return groups
    .slice(0, 4)
    .map((group) => group.replace(LEADING_ZEROS, ''))
    .join(':')
}

/** The address counting keys on: IPv4 as is, IPv6 by its /64. */
export function addressKey(headers: Headers): string {
  const address = clientAddress(headers)
  if (!address) {
    return 'unknown'
  }
  return address.includes(':') && !address.includes('.')
    ? ipv6Prefix(address)
    : address
}

/** A visitor's opaque id: an HMAC of `addressKey`, keyed by `secret`. */
export function visitorId(headers: Headers, secret: string): string {
  return createHmac('sha256', secret)
    .update(addressKey(headers))
    .digest('hex')
    .slice(0, 32)
}
