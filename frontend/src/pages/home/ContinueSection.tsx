import { History } from 'lucide-react'
import styles from './ContinueSection.module.css'

/** "Continue where you left off", in its empty state (nothing has been opened yet). */
export default function ContinueSection() {
  return (
    <section className={styles.section} aria-labelledby="continue-title">
      <h2 id="continue-title" className={styles.heading}>Continue where you left off</h2>
      <div className={styles.empty}>
        <span className={styles.icon} aria-hidden="true"><History size={20} /></span>
        <b>Nothing to continue yet</b>
        <p>Dashboards you open will show up here.</p>
      </div>
    </section>
  )
}
