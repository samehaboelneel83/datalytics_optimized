import { describe, expect, it } from 'vitest'
import { IMPLEMENTED, NAVIGATION, navigationFor } from './navigation'

describe('NAVIGATION', () => {
  const items = NAVIGATION.flatMap(s => s.items)

  it('holds only the agreed high-priority destinations, in order', () => {
    expect(items.map(i => i.label)).toEqual([
      'Home', 'Ask AI', 'Datasets', 'Upload', 'Connections', 'Dashboards', 'Insights', 'Users',
      'Settings',
    ])
  })

  it('keeps the reference section headings and order', () => {
    expect(NAVIGATION.map(s => s.title)).toEqual([null, 'Data', 'Data sources', 'Analyse', 'Admin'])
  })

  it('has unique ids and an icon for every item', () => {
    expect(new Set(items.map(i => i.id)).size).toBe(items.length)
    for (const i of items) expect(i.icon).toBeTruthy()
  })

  it('marks only Users as admin-only', () => {
    expect(items.filter(i => i.adminOnly).map(i => i.id)).toEqual(['users'])
  })

  it('removes admin-only items for normal users only', () => {
    const ids = (isAdmin: boolean) => navigationFor(isAdmin).flatMap(s => s.items).map(i => i.id)
    expect(ids(true)).toContain('users')
    expect(ids(false)).not.toContain('users')
    expect(ids(false)).toHaveLength(items.length - 1)
  })

  it('has pages only for Home and Users so far', () => {
    expect([...IMPLEMENTED].sort()).toEqual(['home', 'users'])
  })
})
