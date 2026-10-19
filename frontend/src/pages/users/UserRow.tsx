import { useState, type FormEvent } from 'react'
import type { User } from '../../auth/authApi'
import type { UserChange } from './usersApi'
import styles from './UsersPage.module.css'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

/**
 * One account in the table, with its admin actions. An administrator cannot
 * change their own role or status (so there is always at least one admin);
 * they can still reset their own password.
 */
export default function UserRow({ user, isSelf, onChange }: {
  user: User
  isSelf: boolean
  onChange: (id: number, change: UserChange) => Promise<string | null>
}) {
  const [resetting, setResetting] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (change: UserChange) => {
    setBusy(true)
    setError(null)
    const problem = await onChange(user.id, change)
    setBusy(false)
    setError(problem)
    return problem
  }

  const onReset = async (e: FormEvent) => {
    e.preventDefault()
    if (!(await run({ password }))) { setResetting(false); setPassword('') }
  }

  const selfNote = isSelf ? 'You cannot change your own role or status' : undefined

  return (
    <tr>
      <td className={styles.email}>
        {user.email}{isSelf && <span className={styles.you}> (you)</span>}
        {error && <p role="alert" className={styles.rowError}>{error}</p>}
      </td>
      <td>{user.is_admin ? 'Administrator' : 'User'}</td>
      <td>
        <span className={user.is_active ? styles.active : styles.inactive}>
          {user.is_active ? 'Active' : 'Disabled'}
        </span>
      </td>
      <td className={styles.date}>{formatDate(user.created_at)}</td>
      <td>
        {resetting
          ? (
            <form className={styles.reset} onSubmit={onReset}>
              <input type="password" required minLength={8} value={password} autoFocus
                onChange={e => setPassword(e.target.value)} autoComplete="new-password"
                aria-label={`New password for ${user.email}`} placeholder="New password" />
              <button type="submit" className="btn btn-sm btn-primary" disabled={busy}>Save</button>
              <button type="button" className="btn btn-sm"
                onClick={() => { setResetting(false); setPassword(''); setError(null) }}>Cancel</button>
            </form>
          )
          : (
            <div className={styles.actions}>
              <button type="button" className="btn btn-sm btn-ghost" disabled={busy || isSelf}
                title={selfNote} onClick={() => run({ is_admin: !user.is_admin })}>
                {user.is_admin ? 'Remove admin' : 'Make admin'}
              </button>
              <button type="button" className="btn btn-sm btn-ghost" disabled={busy || isSelf}
                title={selfNote} onClick={() => run({ is_active: !user.is_active })}>
                {user.is_active ? 'Disable' : 'Enable'}
              </button>
              <button type="button" className="btn btn-sm btn-ghost" disabled={busy}
                onClick={() => setResetting(true)}>
                Reset password
              </button>
            </div>
          )}
      </td>
    </tr>
  )
}
