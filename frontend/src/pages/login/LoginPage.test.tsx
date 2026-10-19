import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axeViolations } from '../../test/axe'
import type { SignIn } from './LoginForm'
import LoginPage from './LoginPage'
import { LOGIN_MESSAGES } from './loginValidation'

function setup(answer: string | null = null) {
  // `onContinue` is the sign-in callback: resolves to null (accepted) or a message.
  const onContinue = vi.fn<SignIn>(async () => answer)
  const view = render(<LoginPage onSignIn={onContinue} />)
  const user = userEvent.setup()
  return { onContinue, user, ...view }
}

const email = () => screen.getByLabelText('Email')
const password = () => screen.getByLabelText('Password')
const signIn = () => screen.getByRole('button', { name: /Sign In/ })

afterEach(() => vi.restoreAllMocks())

describe('Login page: content', () => {
  it('renders the reference sign-in content', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument()
    expect(email()).toHaveAttribute('type', 'email')
    expect(password()).toHaveAttribute('type', 'password')
    expect(signIn()).toBeEnabled()
  })

  it('announces the brand illustration once (the phone copy is decorative)', () => {
    setup()
    expect(screen.getAllByRole('img', { name: 'How Datalytics works' })).toHaveLength(1)
  })

  it('keeps single sign-on and the theme switch disabled (they need features not built yet)', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Sign in with SSO' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Dark theme/ })).toBeDisabled()
  })
})

describe('Login page: validation (browser only)', () => {
  it('shows both errors and does not continue when submitted empty', async () => {
    const { user, onContinue } = setup()
    await user.click(signIn())
    expect(screen.getByText(LOGIN_MESSAGES.emailRequired)).toBeInTheDocument()
    expect(screen.getByText(LOGIN_MESSAGES.passwordRequired)).toBeInTheDocument()
    expect(email()).toHaveAttribute('aria-invalid', 'true')
    expect(email()).toHaveFocus()
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('rejects a malformed email and focuses it', async () => {
    const { user, onContinue } = setup()
    await user.type(email(), 'not-an-email')
    await user.type(password(), 'secret')
    await user.click(signIn())
    expect(screen.getByText(LOGIN_MESSAGES.emailInvalid)).toBeInTheDocument()
    expect(email()).toHaveFocus()
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('focuses the password when only the password is missing', async () => {
    const { user, onContinue } = setup()
    await user.type(email(), 'name@company.com')
    await user.click(signIn())
    expect(screen.queryByText(LOGIN_MESSAGES.emailRequired)).not.toBeInTheDocument()
    expect(screen.getByText(LOGIN_MESSAGES.passwordRequired)).toBeInTheDocument()
    expect(password()).toHaveFocus()
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('does not complain while the first attempt is still being typed', async () => {
    const { user } = setup()
    await user.type(email(), 'na')
    expect(screen.queryByText(LOGIN_MESSAGES.emailInvalid)).not.toBeInTheDocument()
  })

  it('complains about a bad email once the field is left', async () => {
    const { user } = setup()
    await user.type(email(), 'na')
    await user.tab()
    expect(screen.getByText(LOGIN_MESSAGES.emailInvalid)).toBeInTheDocument()
  })

  it('clears the error once the value is fixed', async () => {
    const { user } = setup()
    await user.click(signIn())
    await user.type(email(), 'name@company.com')
    expect(screen.queryByText(LOGIN_MESSAGES.emailRequired)).not.toBeInTheDocument()
  })
})

describe('Login page: password field', () => {
  it('shows and hides the password', async () => {
    const { user } = setup()
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(password()).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(password()).toHaveAttribute('type', 'password')
  })

  it('warns when Caps Lock is on, and stops when the field is left', () => {
    setup()
    fireEvent.keyDown(password(), { key: 'A', modifierCapsLock: true })
    expect(screen.getByText('Caps Lock is on.')).toBeInTheDocument()
    fireEvent.blur(password())
    expect(screen.queryByText('Caps Lock is on.')).not.toBeInTheDocument()
  })
})

describe('Login page: sign-in', () => {
  it('sends the trimmed email and the password when both are filled in', async () => {
    const { user, onContinue } = setup()
    await user.type(email(), '  name@company.com  ')
    await user.type(password(), 'my password ')
    await user.click(signIn())
    expect(onContinue).toHaveBeenCalledTimes(1)
    // The password is sent exactly as typed: spaces can be part of it.
    expect(onContinue).toHaveBeenCalledWith('name@company.com', 'my password ')
  })

  it('also signs in when Enter is pressed in the password field', async () => {
    const { user, onContinue } = setup()
    await user.type(email(), 'name@company.com')
    await user.type(password(), 'anything{Enter}')
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('shows the server\'s answer, clears the password and focuses it when refused', async () => {
    const { user } = setup('Invalid email or password.')
    await user.type(email(), 'name@company.com')
    await user.type(password(), 'wrong')
    await user.click(signIn())
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
    expect(password()).toHaveValue('')
    expect(password()).toHaveFocus()
    expect(signIn()).toBeEnabled()
  })

  it('shows "Signing in…" and ignores more clicks while waiting', async () => {
    let finish: (v: string | null) => void = () => {}
    const onSignIn = vi.fn(() => new Promise<string | null>(r => { finish = r }))
    render(<LoginPage onSignIn={onSignIn} />)
    const user = userEvent.setup()
    await user.type(email(), 'name@company.com')
    await user.type(password(), 'secret')
    await user.click(signIn())
    const busy = screen.getByRole('button', { name: 'Signing in…' })
    expect(busy).toBeDisabled()
    fireEvent.submit(busy.closest('form')!)
    expect(onSignIn).toHaveBeenCalledTimes(1)
    finish('Invalid email or password.')
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('stores nothing in the browser (no localStorage, sessionStorage or readable cookie)', async () => {
    localStorage.clear(); sessionStorage.clear()
    const { user } = setup()
    await user.type(email(), 'name@company.com')
    await user.type(password(), 'super-secret-password')
    await user.click(signIn())
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
    expect(document.cookie).toBe('')
  })

  it('never does a native form submission (no action, submit is intercepted)', () => {
    const { container } = setup()
    const form = container.querySelector('form')!
    expect(form).not.toHaveAttribute('action')
    expect(form).not.toHaveAttribute('method')
    const allowed = fireEvent.submit(form)
    expect(allowed).toBe(false) // default prevented: the page cannot reload or post
  })
})

describe('Login page: accessibility', () => {
  it('has no automatically detectable violations (initial state)', async () => {
    const { container } = setup()
    expect(await axeViolations(container)).toEqual([])
  })

  it('has no violations while showing validation errors', async () => {
    const { container, user } = setup()
    await user.click(signIn())
    expect(await axeViolations(container)).toEqual([])
  })

  it('has no violations while showing the server\'s answer', async () => {
    const { container, user } = setup('Invalid email or password.')
    await user.type(email(), 'name@company.com')
    await user.type(password(), 'wrong')
    await user.click(signIn())
    await screen.findByRole('alert')
    expect(await axeViolations(container)).toEqual([])
  })
})
