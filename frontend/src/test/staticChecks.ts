import { expect } from 'vitest'

/**
 * Milestone-1 guarantee, shared by every page test: the page is a static
 * preview and cannot trigger an application action.
 *  - no <form> (so nothing can submit or reload the page)
 *  - every <button> is type="button" and disabled
 *  - every <input> is disabled
 *  - the only link is the in-page skip link (no navigation)
 */
export function expectNoInteractiveBehaviour(container: HTMLElement) {
  expect(container.querySelectorAll('form')).toHaveLength(0)

  const buttons = Array.from(container.querySelectorAll('button'))
  for (const b of buttons) {
    expect(b, b.outerHTML).toHaveAttribute('type', 'button')
    expect(b, b.outerHTML).toBeDisabled()
  }

  for (const input of Array.from(container.querySelectorAll('input, select, textarea'))) {
    expect(input, input.outerHTML).toBeDisabled()
  }

  const links = Array.from(container.querySelectorAll('a[href]'))
  for (const a of links) {
    expect(a.getAttribute('href'), a.outerHTML).toMatch(/^#/)
  }
}
