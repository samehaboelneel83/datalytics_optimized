import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { NavItemId } from './navigation'
import styles from './AppShell.module.css'

/**
 * The signed-in page frame: rail + top bar + scrolling content
 * (reference: components/Layout.tsx). Purely presentational: no theme state,
 * no stored preferences, no window events. Those return, each in its own
 * small piece, when the features that need them are built.
 */
export default function AppShell({ activeItem, pageTitle, children }: {
  activeItem: NavItemId
  pageTitle: string
  children: ReactNode
}) {
  return (
    <div className={styles.shell}>
      <a href="#main" className="dl-skip-link">Skip to content</a>
      <Sidebar activeItem={activeItem} />
      <div className={styles.main}>
        <TopBar pageTitle={pageTitle} />
        {/* tabIndex 0: the content area scrolls, so keyboard users must be able
            to focus it to scroll it (axe: scrollable-region-focusable). */}
        <main id="main" tabIndex={0} className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
