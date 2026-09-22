import { afterEach, describe, expect, test, vi } from 'vitest'

/**
 * The site origin: an explicit `NEXT_PUBLIC_SITE_URL` wins; on Vercel the
 * deployment's own hostname fills in; locally it is localhost. This is what
 * `/llms.txt` prints in front of every file, so a wrong default ships a
 * catalog of links nobody can fetch.
 */

const KEYS = [
  'NEXT_PUBLIC_SITE_URL',
  'VERCEL_ENV',
  'VERCEL_URL',
  'VERCEL_PROJECT_PRODUCTION_URL',
] as const

const saved = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]))

async function originWith(env: Partial<Record<(typeof KEYS)[number], string>>) {
  vi.resetModules()
  for (const key of KEYS) {
    delete process.env[key]
  }
  Object.assign(process.env, env)
  const { clientEnv } = await import('@/lib/env')
  return clientEnv.NEXT_PUBLIC_SITE_URL
}

afterEach(() => {
  for (const key of KEYS) {
    if (saved[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = saved[key]
    }
  }
})

describe('the site origin', () => {
  test('an explicit site URL wins everywhere', async () => {
    expect(
      await originWith({
        NEXT_PUBLIC_SITE_URL: 'https://growth.engineer',
        VERCEL_ENV: 'production',
        VERCEL_PROJECT_PRODUCTION_URL: 'growth-engineer.vercel.app',
      })
    ).toBe('https://growth.engineer')
  })

  test('a Vercel production build uses the project domain', async () => {
    expect(
      await originWith({
        VERCEL_ENV: 'production',
        VERCEL_URL: 'growth-engineer-abc123.vercel.app',
        VERCEL_PROJECT_PRODUCTION_URL: 'growth-engineer.vercel.app',
      })
    ).toBe('https://growth-engineer.vercel.app')
  })

  test('a Vercel preview uses its own URL', async () => {
    expect(
      await originWith({
        VERCEL_ENV: 'preview',
        VERCEL_URL: 'growth-engineer-git-branch.vercel.app',
        VERCEL_PROJECT_PRODUCTION_URL: 'growth-engineer.vercel.app',
      })
    ).toBe('https://growth-engineer-git-branch.vercel.app')
  })

  test('a blank value is absent, and nothing means localhost', async () => {
    expect(await originWith({ NEXT_PUBLIC_SITE_URL: '' })).toBe(
      'http://localhost:3000'
    )
  })
})
