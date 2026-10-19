import { useCallback, useEffect, useState } from 'react'
import { ApiError, NETWORK_ERROR } from './api/client'
import { currentUser, signIn, signOut, type User } from './auth/authApi'
import AppShell from './components/layout/AppShell'
import type { NavItemId } from './components/layout/navigation'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/login/LoginPage'
import UsersPage from './pages/users/UsersPage'
import styles from './App.module.css'

type Session =
  | { state: 'checking' }
  | { state: 'signedOut' }
  | { state: 'signedIn'; user: User }

/** Pages that exist so far. The navigation feature replaces this with a router. */
type View = Extract<NavItemId, 'home' | 'users'>

const TITLES: Record<View, string> = { home: 'Home', users: 'Users' }

/**
 * The whole app: ask the server who is signed in, then show the login page or
 * the signed-in shell. The server decides; nothing about the session is kept
 * in the browser except the HttpOnly cookie, which scripts cannot read.
 */
export default function App() {
  const [session, setSession] = useState<Session>({ state: 'checking' })
  const [view, setView] = useState<View>('home')

  useEffect(() => {
    currentUser()
      .then(user => setSession(user ? { state: 'signedIn', user } : { state: 'signedOut' }))
      .catch(() => setSession({ state: 'signedOut' }))
  }, [])

  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      const user = await signIn(email, password)
      setView('home')
      setSession({ state: 'signedIn', user })
      return null
    } catch (e) {
      return e instanceof ApiError ? e.message : NETWORK_ERROR
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    try { await signOut() } finally { setSession({ state: 'signedOut' }) }
  }, [])

  /** A request answered 401: the session ended (expired, reset or disabled). */
  const handleSessionEnded = useCallback(() => setSession({ state: 'signedOut' }), [])

  if (session.state === 'checking') {
    return <div className={styles.checking} role="status">Loading…</div>
  }
  if (session.state === 'signedOut') {
    return <LoginPage onSignIn={handleSignIn} />
  }

  const { user } = session
  const current: View = view === 'users' && !user.is_admin ? 'home' : view
  return (
    <AppShell activeItem={current} pageTitle={TITLES[current]} user={user}
      onNavigate={id => setView(id as View)} onSignOut={handleSignOut}>
      {current === 'users'
        ? <UsersPage currentUser={user} onSessionEnded={handleSessionEnded} />
        : <HomePage />}
    </AppShell>
  )
}
