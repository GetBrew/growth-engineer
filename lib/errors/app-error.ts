import { ConvexError } from 'convex/values'

/**
 * The client half of the Convex error pattern (convex/shared/errors.ts).
 *
 * The rule every catch block follows: a TYPED message is safe to show
 * verbatim, because we wrote it for this user. Anything else is an unexpected
 * failure whose message may carry internals — show the local fallback.
 *
 * `catch { toast('Something went wrong') }` throws away the one useful thing
 * the server said. `catch { toast(error.message) }` shows people a stack
 * frame. This is the middle.
 */

const APP_ERROR_CODES = [
  'NOT_AUTHENTICATED',
  'NOT_AUTHORIZED',
  'NOT_FOUND',
  'INVALID_INPUT',
  'CONFLICT',
] as const

export type AppErrorCode = (typeof APP_ERROR_CODES)[number]

export type AppErrorPayload = {
  code: AppErrorCode
  message: string
}

function isAppErrorPayload(value: unknown): value is AppErrorPayload {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const payload = value as Partial<AppErrorPayload>
  return (
    typeof payload.message === 'string' &&
    typeof payload.code === 'string' &&
    (APP_ERROR_CODES as ReadonlyArray<string>).includes(payload.code)
  )
}

/** The typed payload, or null when this is not one of ours. */
export function getAppError(error: unknown): AppErrorPayload | null {
  if (error instanceof ConvexError && isAppErrorPayload(error.data)) {
    return error.data
  }
  return null
}

/** A message safe to show: the typed one, else the caller's fallback. */
export function getAppErrorMessage(error: unknown, fallback: string): string {
  return getAppError(error)?.message ?? fallback
}
