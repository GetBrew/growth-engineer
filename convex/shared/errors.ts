import { ConvexError } from 'convex/values'

/**
 * Typed, user-facing errors.
 *
 * A Convex function that fails must THROW. The alternatives all rot:
 * `{ success: false }` returns are ignored at half the call sites, and a
 * silent no-op is a bug report that says "it just doesn't save sometimes".
 *
 * A plain `Error` is not enough either — Convex redacts its message in
 * production, so the client sees "Server Error" and can show nothing useful.
 * `ConvexError` carries a structured payload through to the caller, which is
 * what lets `getAppErrorMessage()` (lib/errors/app-error.ts) decide: show a
 * typed message verbatim, keep anything unexpected generic.
 */
export type AppErrorCode =
  | 'NOT_AUTHENTICATED'
  | 'NOT_AUTHORIZED'
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'CONFLICT'

export type AppErrorPayload = {
  code: AppErrorCode
  message: string
}

function throwAppError(code: AppErrorCode, message: string): never {
  throw new ConvexError<AppErrorPayload>({ code, message })
}

/** No verified identity at all. The caller should sign in. */
export function notAuthenticated(message = 'You are not signed in.'): never {
  return throwAppError('NOT_AUTHENTICATED', message)
}

/**
 * A verified identity that may not do this.
 *
 * Deliberately indistinguishable from NOT_FOUND at the boundary for anything
 * addressed by id: telling an attacker "this exists, but not for you" is how
 * an id space gets enumerated.
 */
export function notAuthorized(message = 'You do not have access.'): never {
  return throwAppError('NOT_AUTHORIZED', message)
}

export function notFound(message = 'Not found.'): never {
  return throwAppError('NOT_FOUND', message)
}

export function invalidInput(message: string): never {
  return throwAppError('INVALID_INPUT', message)
}

export function conflict(message: string): never {
  return throwAppError('CONFLICT', message)
}
