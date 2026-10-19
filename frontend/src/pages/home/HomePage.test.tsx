import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AppShell from '../../components/layout/AppShell'
import { axeViolations } from '../../test/axe'
import { expectNoInteractiveBehaviour } from '../../test/staticChecks'
import HomePage from './HomePage'

const FIXED_DAY = new Date('2026-10-19T09:00:00')

function renderHome() {
  return render(
    <AppShell activeItem="home" pageTitle="Home">
      <HomePage today={FIXED_DAY} />
    </AppShell>,
  )
}

describe('Home page (static)', () => {
  it('renders the shell: sidebar, top bar and main content', () => {
    renderHome()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).toHaveTextContent('Home')
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('has one page heading and the reference first-run sections', () => {
    renderHome()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome to Datalytics' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Set up your workspace' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Continue where you left off' })).toBeInTheDocument()
    expect(screen.getByText('Monday, October 19, 2026')).toBeInTheDocument()
  })

  it('says it is a preview', () => {
    renderHome()
    expect(screen.getByRole('note')).toHaveTextContent(/UI preview/)
  })

  it('shows no invented metrics', () => {
    renderHome()
    const glance = screen.getByRole('region', { name: 'At a glance' })
    expect(within(glance).getAllByText('—')).toHaveLength(4)
    expect(glance.textContent).not.toMatch(/\d/)
  })

  it('cannot trigger any application action', () => {
    const { container } = renderHome()
    expectNoInteractiveBehaviour(container)
  })

  it('has no automatically detectable accessibility violations', async () => {
    const { container } = renderHome()
    expect(await axeViolations(container)).toEqual([])
  })
})
