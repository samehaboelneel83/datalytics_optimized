import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { NavItemId } from './navigation'
import type { User } from '../../auth/authApi'
import styles from './AppShell.module.css'

/**
 * The signed-in page frame: rail + top bar + scrolling content
 * (reference: components/Layout.tsx). Presentational: it is told who is
 * signed in and what to call on navigation / sign out; it keeps no state.
 */
export default function AppShell({ activeItem, pageTitle, user, onNavigate, onSignOut, children }: {
  activeItem: NavItemId
  pageTitle: string
  user?: User
  onNavigate?: (id: NavItemId) => void
  onSignOut?: () => void
  children: ReactNode
}) {
  return (
    <div className={styles.shell}>
      <a href="#main" className="dl-skip-link">Skip to content</a>
      <Sidebar activeItem={activeItem} isAdmin={user?.is_admin} onNavigate={onNavigate} />
      <div className={styles.main}>
        <TopBar pageTitle={pageTitle} email={user?.email} isAdmin={user?.is_admin}
          onSignOut={onSignOut} />
        {/* tabIndex 0: the content area scrolls, so keyboard users must be able
            to focus it to scroll it (axe: scrollable-region-focusable). */}
        <main id="main" tabIndex={0} className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
