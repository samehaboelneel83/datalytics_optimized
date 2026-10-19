import { useCallback, useEffect, useState } from 'react'
import { ApiError, NETWORK_ERROR } from '../../api/client'
import type { User } from '../../auth/authApi'
import CreateUserForm from './CreateUserForm'
import UserRow from './UserRow'
import { createUser, listUsers, updateUser, type NewUser, type UserChange } from './usersApi'
import styles from './UsersPage.module.css'

/**
 * Administrators manage accounts here: list, add, make admin, disable,
 * reset password. There is no delete: a disabled account keeps its data
 * (connections, dashboards ...) and can be enabled again.
 *
 * The page is only shown to admins, and the backend refuses non-admins too.
 */
export default function UsersPage({ currentUser, onSessionEnded }: {
  currentUser: User
  onSessionEnded: () => void
}) {
  const [users, setUsers] = useState<User[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  /** Turns an error into the message to show; a 401 means the session is over. */
  const problemOf = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) onSessionEnded()
    return e instanceof ApiError ? e.message : NETWORK_ERROR
  }, [onSessionEnded])

  useEffect(() => {
    listUsers().then(setUsers).catch(e => setLoadError(problemOf(e)))
  }, [problemOf])

  const onCreate = async (user: NewUser) => {
    try {
      const created = await createUser(user)
      setUsers(list => [...(list ?? []), created])
      return null
    } catch (e) { return problemOf(e) }
  }

  const onChange = async (id: number, change: UserChange) => {
    try {
      const updated = await updateUser(id, change)
      setUsers(list => (list ?? []).map(u => (u.id === id ? updated : u)))
      return null
    } catch (e) { return problemOf(e) }
  }

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.h1}>Users</h1>
        <p className={styles.sub}>
          Everyone who can sign in. Each user sees only their own connections and dashboards;
          administrators see everyone&apos;s.
        </p>
      </header>

      <CreateUserForm onCreate={onCreate} />

      <section className="card" aria-labelledby="users-list-title">
        <h2 id="users-list-title" className={styles.h2}>
          All users{users && <span className={styles.count}> · {users.length}</span>}
        </h2>
        {loadError && <p role="alert" className={styles.alert}>{loadError}</p>}
        {!users && !loadError && <p role="status" className={styles.muted}>Loading users…</p>}
        {users && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th>
                  <th scope="col">Created</th><th scope="col"><span className="dl-sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <UserRow key={u.id} user={u} isSelf={u.id === currentUser.id} onChange={onChange} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
