import { ChevronsLeft } from 'lucide-react'
import BrandMark from '../brand/BrandMark'
import { NAVIGATION, type NavItemId } from './navigation'
import styles from './Sidebar.module.css'

/**
 * The left rail (reference: components/Layout.tsx, `.dl-rail*` in index.css).
 *
 * Static in milestone 1:
 *  - items are plain list entries, not links or buttons, so they are not
 *    focusable and cannot be activated;
 *  - the current page is marked with aria-current, which screen readers
 *    announce, and drawn with the reference's tint + leading accent bar;
 *  - the collapse control is shown, disabled.
 *
 * Responsive behaviour is CSS only (see the module): full labels from 900px,
 * an icon rail from 600px, hidden below that.
 */
const sectionId = (title: string) => `rail-section-${title.toLowerCase().replace(/\W+/g, '-')}`

export default function Sidebar({ activeItem }: { activeItem: NavItemId }) {
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

      {NAVIGATION.map(section => (
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
              return (
                <li key={id}>
                  <span className={`${styles.item} ${active ? styles.active : ''}`}
                    aria-current={active ? 'page' : undefined} title={label}>
                    <span className={styles.icon} aria-hidden="true"><Icon size={16} /></span>
                    <span className={styles.label}>{label}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
