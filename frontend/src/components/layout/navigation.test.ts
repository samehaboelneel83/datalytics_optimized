import { describe, expect, it } from 'vitest'
import { NAVIGATION } from './navigation'

describe('NAVIGATION', () => {
  const items = NAVIGATION.flatMap(s => s.items)

  it('holds only the agreed high-priority destinations, in order', () => {
    expect(items.map(i => i.label)).toEqual([
      'Home', 'Ask AI', 'Datasets', 'Upload', 'Connections', 'Dashboards', 'Insights', 'Settings',
    ])
  })

  it('keeps the reference section headings and order', () => {
    expect(NAVIGATION.map(s => s.title)).toEqual([null, 'Data', 'Data sources', 'Analyse', 'Admin'])
  })

  it('has unique ids and an icon for every item', () => {
    expect(new Set(items.map(i => i.id)).size).toBe(items.length)
    for (const i of items) expect(i.icon).toBeTruthy()
  })

  it('carries no routes yet (milestone 1 is visual only)', () => {
    for (const i of items) expect(i).not.toHaveProperty('to')
  })
})
