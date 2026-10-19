import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axeViolations } from '../../test/axe'
import { expectNoInteractiveBehaviour } from '../../test/staticChecks'
import LoginPage from './LoginPage'

describe('Login page (static)', () => {
  it('renders the reference sign-in content', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: /Sign In/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in with SSO' })).toBeInTheDocument()
  })

  it('says sign-in is not connected yet', () => {
    render(<LoginPage />)
    expect(screen.getByRole('note')).toHaveTextContent('sign-in is not connected yet')
  })

  it('announces the brand illustration once (the phone copy is decorative)', () => {
    render(<LoginPage />)
    expect(screen.getAllByRole('img', { name: 'How Datalytics works' })).toHaveLength(1)
  })

  it('cannot submit or trigger any action', () => {
    const { container } = render(<LoginPage />)
    expectNoInteractiveBehaviour(container)
  })

  it('has no automatically detectable accessibility violations', async () => {
    const { container } = render(<LoginPage />)
    expect(await axeViolations(container)).toEqual([])
  })
})
