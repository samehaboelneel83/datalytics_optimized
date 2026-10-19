import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axeViolations } from '../../test/axe'
import { installFakeServer, makeUser } from '../../test/fakeServer'
import UsersPage from './UsersPage'

const admin = makeUser(1, 'admin@datalytics.local', true)
const alice = () => makeUser(2, 'alice@x.com')

afterEach(() => vi.restoreAllMocks())

function setup() {
  const server = installFakeServer([{ ...admin }, alice()], {}, admin)
  const onSessionEnded = vi.fn()
  const view = render(<UsersPage currentUser={admin} onSessionEnded={onSessionEnded} />)
  return { server, onSessionEnded, user: userEvent.setup(), ...view }
}

const row = async (email: string) => (await screen.findByText(email)).closest('tr')!

describe('Users page', () => {
  it('lists every user with role and status', async () => {
    setup()
    const r = await row('alice@x.com')
    expect(r).toHaveTextContent('User')
    expect(r).toHaveTextContent('Active')
    expect(await row('admin@datalytics.local')).toHaveTextContent('Administrator')
    expect(screen.getByText(/· 2/)).toBeInTheDocument()
  })

  it('adds a user', async () => {
    const { server, user } = setup()
    await screen.findByText('alice@x.com')
    await user.type(screen.getByLabelText('Email'), 'bob@x.com')
    await user.type(screen.getByLabelText('Password'), 'bob-password')
    await user.click(screen.getByLabelText('Administrator'))
    await user.click(screen.getByRole('button', { name: /Add user/ }))
    expect(await row('bob@x.com')).toHaveTextContent('Administrator')
    expect(server.requests.at(-1)).toMatchObject({
      method: 'POST', path: '/users',
      body: { email: 'bob@x.com', password: 'bob-password', is_admin: true },
    })
    expect(screen.getByLabelText('Email')).toHaveValue('')
  })

  it('shows the server\'s reason when adding fails', async () => {
    const { user } = setup()
    await screen.findByText('alice@x.com')
    await user.type(screen.getByLabelText('Email'), 'alice@x.com')
    await user.type(screen.getByLabelText('Password'), 'whatever-123')
    await user.click(screen.getByRole('button', { name: /Add user/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('already exists')
  })

  it('disables and re-enables a user', async () => {
    const { user } = setup()
    const r = await row('alice@x.com')
    await user.click(within(r).getByRole('button', { name: 'Disable' }))
    expect(await within(r).findByText('Disabled')).toBeInTheDocument()
    await user.click(within(r).getByRole('button', { name: 'Enable' }))
    expect(await within(r).findByText('Active')).toBeInTheDocument()
  })

  it('resets a password', async () => {
    const { server, user } = setup()
    const r = await row('alice@x.com')
    await user.click(within(r).getByRole('button', { name: 'Reset password' }))
    await user.type(within(r).getByLabelText('New password for alice@x.com'), 'new-password-1')
    await user.click(within(r).getByRole('button', { name: 'Save' }))
    expect(server.requests.at(-1)).toMatchObject({
      method: 'PATCH', path: '/users/2', body: { password: 'new-password-1' } })
    expect(await within(r).findByRole('button', { name: 'Reset password' })).toBeInTheDocument()
  })

  it('does not let an admin change their own role or status', async () => {
    setup()
    const r = await row('admin@datalytics.local')
    expect(within(r).getByRole('button', { name: 'Remove admin' })).toBeDisabled()
    expect(within(r).getByRole('button', { name: 'Disable' })).toBeDisabled()
    expect(within(r).getByRole('button', { name: 'Reset password' })).toBeEnabled()
  })

  it('reports an expired session to the app', async () => {
    const { server, onSessionEnded, user } = setup()
    const r = await row('alice@x.com')
    server.failNext('PATCH', '/users/2', 401, 'Not signed in.')
    await user.click(within(r).getByRole('button', { name: 'Disable' }))
    await within(r).findByRole('alert')
    expect(onSessionEnded).toHaveBeenCalled()
  })

  it('has no automatically detectable accessibility violations', async () => {
    const { container } = setup()
    await screen.findByText('alice@x.com')
    expect(await axeViolations(container)).toEqual([])
  })
})
