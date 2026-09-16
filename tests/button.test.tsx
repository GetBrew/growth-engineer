// @vitest-environment jsdom
//
// The docblock above is how a file opts into a DOM. Everything else in
// `tests/` runs in the cheap `node` environment — a jsdom instance costs real
// memory and start-up time, so it is per-file and deliberate, never the
// default for the whole suite.

import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  test('defaults to type="button"', () => {
    // Not a nitpick: a <button> inside a <form> defaults to "submit", so a
    // component that forgets this silently submits the form on every click.
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty(
      'type',
      'button'
    )
  })

  test('still allows an explicit submit button', () => {
    render(<Button type="submit">Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty(
      'type',
      'submit'
    )
  })

  test('a caller className overrides the variant it conflicts with', () => {
    // This is what `cn` buys: twMerge resolves conflicting utilities by group,
    // so a consumer can override padding without forking the component.
    render(
      <Button className="px-10" size="sm">
        Wide
      </Button>
    )
    const className = screen.getByRole('button', { name: 'Wide' }).className
    expect(className).toContain('px-10')
    expect(className).not.toContain('px-3')
  })
})
