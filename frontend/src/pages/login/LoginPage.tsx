import { Moon } from 'lucide-react'
import BrandMark from '../../components/brand/BrandMark'
import BrandIllustration from './BrandIllustration'
import LoginForm from './LoginForm'
import styles from './LoginPage.module.css'

/**
 * Sign-in page (reference: pages/Login.tsx + pages/login.css).
 *
 * Same layout as the reference: the form card on the reading-start side and
 * the brand panel on the other; one column below 900px.
 *
 * Preview mode (no backend): the form validates input in the browser and then
 * calls `onContinue`. Nothing is sent or stored, and no account is checked.
 * The page itself only lays things out; the authentication feature replaces
 * what `onContinue` does.
 */
export default function LoginPage({ onContinue }: { onContinue: (email: string) => void }) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.bar}>
          <BrandMark size="lg" />
          <button type="button" className={styles.iconBtn} disabled
            aria-label="Dark theme (not available yet)" title="Not available yet">
            <Moon size={17} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.mobileBrand} aria-hidden="true">
          <BrandIllustration className={styles.illCompact} decorative />
          <p className={styles.taglineCompact}>Connect any data. Ask in plain language. Get dashboards instantly.</p>
        </div>

        <div className={styles.center}>
          <section className={styles.card} aria-label="Sign in">
            <LoginForm onContinue={onContinue} />
          </section>
        </div>
      </main>

      <aside className={styles.panel} aria-label="About Datalytics">
        <div className={styles.panelInner}>
          <BrandIllustration />
          <p className={styles.name}>Datalytics</p>
          <p className={styles.tagline}>Connect any data. Ask in plain language. Get dashboards instantly.</p>
        </div>
      </aside>
    </div>
  )
}
