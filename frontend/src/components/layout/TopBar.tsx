import { Bell, ChevronDown, Menu, Moon, Search, UserRound } from 'lucide-react'
import BrandMark from '../brand/BrandMark'
import styles from './TopBar.module.css'

/**
 * The top bar (reference: components/TopBar.tsx), rebuilt with CSS classes
 * instead of the reference's inline styles.
 *
 * Every control is a disabled placeholder in milestone 1: search, theme,
 * notifications and the account menu each arrive with their own feature.
 * The reference's LLM picker and language switcher are not shown yet.
 */
export default function TopBar({ pageTitle }: { pageTitle: string }) {
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

      <button type="button" className={styles.account} disabled
        aria-label="Account menu (not available yet)" title="Not available yet">
        <span className={styles.avatar} aria-hidden="true"><UserRound size={15} /></span>
        <span className={styles.accountName}>Account</span>
        <ChevronDown size={12} className={styles.chev} aria-hidden="true" />
      </button>
    </header>
  )
}
