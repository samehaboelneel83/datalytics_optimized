import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'
import { IMPLEMENTED, NAVIGATION } from './navigation'

const allItems = NAVIGATION.flatMap(s => s.items)

describe('Sidebar', () => {
  it('shows every item with its section heading to an administrator', () => {
    render(<Sidebar activeItem="home" isAdmin />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    for (const section of NAVIGATION) {
      if (section.title) expect(within(nav).getByRole('list', { name: section.title })).toBeInTheDocument()
      for (const item of section.items) expect(within(nav).getByText(item.label)).toBeInTheDocument()
    }
  })

  it('hides admin-only items from normal users', () => {
    render(<Sidebar activeItem="home" />)
    for (const item of allItems) {
      const shown = screen.queryByText(item.label)
      if (item.adminOnly) expect(shown).not.toBeInTheDocument()
      else expect(shown).toBeInTheDocument()
    }
  })

  it('marks exactly one item as the current page', () => {
    const { container } = render(<Sidebar activeItem="datasets" />)
    const current = container.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Datasets')
  })

  it('makes only the items that have a page clickable', () => {
    render(<Sidebar activeItem="home" isAdmin onNavigate={() => {}} />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const clickable = within(nav).getAllByRole('button').filter(b => !b.hasAttribute('disabled'))
    expect(clickable.map(b => b.textContent).sort())
      .toEqual(allItems.filter(i => IMPLEMENTED.has(i.id)).map(i => i.label).sort())
    expect(nav.querySelectorAll('a')).toHaveLength(0)
  })

  it('reports which item was chosen', async () => {
    const onNavigate = vi.fn()
    render(<Sidebar activeItem="home" isAdmin onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('button', { name: 'Users' }))
    expect(onNavigate).toHaveBeenCalledWith('users')
  })

  it('without onNavigate nothing is clickable (only the disabled collapse control)', () => {
    const { container } = render(<Sidebar activeItem="home" isAdmin />)
    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toBeDisabled()
  })
})
