import { ChevronsLeft } from 'lucide-react'
import BrandMark from '../brand/BrandMark'
import { IMPLEMENTED, navigationFor, type NavItemId } from './navigation'
import styles from './Sidebar.module.css'

/**
 * The left rail (reference: components/Layout.tsx, `.dl-rail*` in index.css).
 *
 *  - Items with a page (IMPLEMENTED) are buttons that call `onNavigate`.
 *  - Items without a page yet are plain text: not focusable, not clickable.
 *  - Admin-only items appear only for administrators.
 *  - The current page is marked with aria-current and the reference's tint + accent bar.
 *
 * Responsive behaviour is CSS only (see the module): full labels from 900px,
 * an icon rail from 600px, hidden below that.
 */
const sectionId = (title: string) => `rail-section-${title.toLowerCase().replace(/\W+/g, '-')}`

export default function Sidebar({ activeItem, isAdmin = false, onNavigate }: {
  activeItem: NavItemId
  isAdmin?: boolean
  onNavigate?: (id: NavItemId) => void
}) {
  return (
    <nav className={styles.rail} aria-label="Main">
      <div className={styles.brandRow}>
        <span className={styles.brandFull}><BrandMark /></span>
        <span className={styles.brandIcon}><BrandMark showWordmark={false} /></span>
        <button type="button" className={styles.iconBtn} disabled
          aria-label="Collapse sidebar (not available yet)" title="Not available yet">
          <ChevronsLeft size={16} aria-hidden="true" />
        </button>
      </div>

      {navigationFor(isAdmin).map(section => (
        <div key={section.title ?? 'root'} className={styles.group}>
          {section.title && (
            <>
              <div id={sectionId(section.title)} className={styles.sectionTitle}>{section.title}</div>
              <div className={styles.rule} aria-hidden="true" />
            </>
          )}
          <ul className={styles.items}
            aria-labelledby={section.title ? sectionId(section.title) : undefined}>
            {section.items.map(({ id, label, icon: Icon }) => {
              const active = id === activeItem
              const className = `${styles.item} ${active ? styles.active : ''}`
              const content = (
                <>
                  <span className={styles.icon} aria-hidden="true"><Icon size={16} /></span>
                  <span className={styles.label}>{label}</span>
                </>
              )
              return (
                <li key={id}>
                  {onNavigate && IMPLEMENTED.has(id)
                    ? (
                      <button type="button" className={`${className} ${styles.link}`}
                        aria-current={active ? 'page' : undefined} title={label}
                        onClick={() => onNavigate(id)}>
                        {content}
                      </button>
                    )
                    : (
                      <span className={className} aria-current={active ? 'page' : undefined}
                        title={label}>
                        {content}
                      </span>
                    )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
