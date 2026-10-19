import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Sidebar from './Sidebar'
import { NAVIGATION } from './navigation'

describe('Sidebar', () => {
  it('renders every navigation item with its section heading', () => {
    render(<Sidebar activeItem="home" />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    for (const section of NAVIGATION) {
      if (section.title) expect(within(nav).getByRole('list', { name: section.title })).toBeInTheDocument()
      for (const item of section.items) expect(within(nav).getByText(item.label)).toBeInTheDocument()
    }
  })

  it('marks exactly one item as the current page', () => {
    const { container } = render(<Sidebar activeItem="datasets" />)
    const current = container.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Datasets')
  })

  it('renders items as plain text: no links, nothing focusable', () => {
    const { container } = render(<Sidebar activeItem="home" />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav.querySelectorAll('a')).toHaveLength(0)
    expect(within(nav).getAllByRole('listitem').every(li => !li.querySelector('[tabindex]'))).toBe(true)
    // The only control is the collapse button, and it is disabled.
    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toBeDisabled()
  })
})
