import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { installFakeServer, makeUser } from './test/fakeServer'

const admin = makeUser(1, 'admin@datalytics.local', true)
const alice = makeUser(2, 'alice@x.com')
const passwords = { 'admin@datalytics.local': 'admin-pass', 'alice@x.com': 'alice-pass' }

afterEach(() => vi.restoreAllMocks())

async function signInAs(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: /Sign In/ }))
  return user
}

describe('App: login comes first', () => {
  it('opens on the login page when nobody is signed in', async () => {
    installFakeServer([admin, alice], passwords)
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
  })

  it('shows Home only after the server accepts the password', async () => {
    const server = installFakeServer([admin, alice], passwords)
    render(<App />)
    await signInAs('alice@x.com', 'alice-pass')
    expect(await screen.findByRole('heading', { name: 'Welcome to Datalytics' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).toHaveTextContent('alice@x.com')
    expect(server.requests.some(r => r.method === 'POST' && r.path === '/auth/login')).toBe(true)
  })

  it('stays on the login page and explains when the password is wrong', async () => {
    installFakeServer([admin, alice], passwords)
    render(<App />)
    await signInAs('alice@x.com', 'wrong-pass')
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
    expect(screen.queryByRole('heading', { name: 'Welcome to Datalytics' })).not.toBeInTheDocument()
  })

  it('goes straight to Home when the session is still valid', async () => {
    installFakeServer([admin, alice], passwords, alice)
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Welcome to Datalytics' })).toBeInTheDocument()
  })

  it('shows the login page when the server cannot be reached', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })

  it('signs out back to the login page', async () => {
    const server = installFakeServer([admin, alice], passwords, alice)
    render(<App />)
    await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(server.signedInAs).toBeNull()
  })
})

describe('App: administrators', () => {
  it('normal users do not see the Users page in the sidebar', async () => {
    installFakeServer([admin, alice], passwords, alice)
    render(<App />)
    const nav = await screen.findByRole('navigation', { name: 'Main' })
    expect(within(nav).queryByText('Users')).not.toBeInTheDocument()
  })

  it('administrators open the Users page from the sidebar and back to Home', async () => {
    installFakeServer([admin, alice], passwords, admin)
    render(<App />)
    const nav = await screen.findByRole('navigation', { name: 'Main' })
    await userEvent.click(within(nav).getByRole('button', { name: 'Users' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Users' })).toBeInTheDocument()
    expect(await screen.findByText('alice@x.com')).toBeInTheDocument()
    await userEvent.click(within(nav).getByRole('button', { name: 'Home' }))
    expect(await screen.findByRole('heading', { name: 'Welcome to Datalytics' })).toBeInTheDocument()
  })
})
