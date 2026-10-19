import axe from 'axe-core'

/**
 * Runs axe-core over a rendered container and returns the violations.
 * Colour contrast is skipped: jsdom does not compute styles from CSS,
 * so contrast must be checked in a real browser (see docs/TESTING_STRATEGY.md).
 */
export async function axeViolations(container: Element) {
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  })
  return result.violations.map(v => `${v.id}: ${v.help} (${v.nodes.length} node(s))`)
}
