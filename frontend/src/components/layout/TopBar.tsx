import { Bell, LogOut, Menu, Moon, Search, UserRound } from 'lucide-react'
import BrandMark from '../brand/BrandMark'
import styles from './TopBar.module.css'

/**
 * The top bar (reference: components/TopBar.tsx), rebuilt with CSS classes
 * instead of the reference's inline styles.
 *
 * Shows who is signed in and a working Sign out. Search, theme and
 * notifications are still disabled placeholders; each arrives with its own
 * feature. The reference's LLM picker and language switcher are not shown yet.
 */
export default function TopBar({ pageTitle, email, isAdmin = false, onSignOut }: {
  pageTitle: string
  email?: string
  isAdmin?: boolean
  onSignOut?: () => void
}) {
  return (
    <header className={styles.bar}>
      {/* Phone only: the rail is hidden there, so the bar carries the brand. */}
      <span className={styles.mobileOnly}>
        <button type="button" className={styles.iconBtn} disabled
          aria-label="Open menu (not available yet)" title="Not available yet">
          <Menu size={18} aria-hidden="true" />
        </button>
        <BrandMark showWordmark={false} />
      </span>

      <p className={styles.title} aria-current="page">{pageTitle}</p>

      <span className={styles.spacer} />

      <button type="button" className={styles.search} disabled
        aria-label="Search (not available yet)" title="Not available yet">
        <Search size={14} aria-hidden="true" />
        <span className={styles.searchText}>Search…</span>
        <kbd className={styles.kbd} aria-hidden="true">Ctrl K</kbd>
      </button>

      <button type="button" className={styles.iconBtn} disabled
        aria-label="Dark theme (not available yet)" title="Not available yet">
        <Moon size={17} aria-hidden="true" />
      </button>

      <button type="button" className={styles.iconBtn} disabled
        aria-label="Notifications (not available yet)" title="Not available yet">
        <Bell size={17} aria-hidden="true" />
      </button>

      <span className={styles.account} title={email}>
        <span className={styles.avatar} aria-hidden="true"><UserRound size={15} /></span>
        <span className={styles.accountName}>{email ?? 'Account'}</span>
        {isAdmin && <span className={styles.badge}>Admin</span>}
      </span>

      {onSignOut && (
        <button type="button" className={styles.iconBtn} onClick={onSignOut}
          aria-label="Sign out" title="Sign out">
          <LogOut size={17} aria-hidden="true" />
        </button>
      )}
    </header>
  )
}
