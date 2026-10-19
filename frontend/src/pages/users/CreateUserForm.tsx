import { useId, useState, type FormEvent } from 'react'
import { UserPlus } from 'lucide-react'
import type { NewUser } from './usersApi'
import styles from './UsersPage.module.css'

/**
 * "Add a user": email, first password, and whether they are an administrator.
 * `onCreate` returns null on success or the server's reason for refusing.
 */
export default function CreateUserForm({ onCreate }: {
  onCreate: (user: NewUser) => Promise<string | null>
}) {
  const uid = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const problem = await onCreate({ email: email.trim(), password, is_admin: isAdmin })
    setBusy(false)
    if (problem) { setError(problem); return }
    setEmail(''); setPassword(''); setIsAdmin(false)
  }

  return (
    <form className={`card ${styles.create}`} onSubmit={onSubmit} aria-labelledby={`${uid}-t`}>
      <h2 id={`${uid}-t`} className={styles.h2}>Add a user</h2>
      <div className={styles.createRow}>
        <label className={styles.field}>
          <span>Email</span>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="name@company.com" autoComplete="off" spellCheck={false} />
        </label>
        <label className={styles.field}>
          <span>Password</span>
          <input type="password" required minLength={8} value={password}
            onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"
            autoComplete="new-password" />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} />
          <span>Administrator</span>
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          <UserPlus size={15} aria-hidden="true" /> {busy ? 'Adding…' : 'Add user'}
        </button>
      </div>
      {error && <p role="alert" className={styles.alert}>{error}</p>}
    </form>
  )
}
