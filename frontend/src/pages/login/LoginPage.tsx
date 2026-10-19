import { ArrowRight, Eye, Moon } from 'lucide-react'
import BrandMark from '../../components/brand/BrandMark'
import PreviewNote from '../../components/ui/PreviewNote'
import BrandIllustration from './BrandIllustration'
import styles from './LoginPage.module.css'

/**
 * Sign-in page, milestone 1 (reference: pages/Login.tsx + pages/login.css).
 *
 * Same layout as the reference: the form card on the reading-start side and
 * the brand panel on the other; one column below 900px.
 *
 * Static by design. There is deliberately no <form> element, so the page can
 * never submit or reload, and every field and button is disabled. No
 * validation, no auth call, no SSO hand-off: those belong to the
 * authentication feature.
 */
export default function LoginPage() {
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
          <section className={styles.card} aria-labelledby="login-title">
            <PreviewNote>UI preview — sign-in is not connected yet</PreviewNote>
            <h1 id="login-title" className={styles.title}>Welcome back</h1>
            <p className={styles.sub}>Explore your data, build dashboards and ask questions in plain language.</p>

            <div className={styles.field}>
              <label htmlFor="login-email" className={styles.label}>Email</label>
              <input id="login-email" type="email" className={styles.input} disabled
                placeholder="name@company.com" autoComplete="username" />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password" className={styles.label}>Password</label>
              <div className={styles.pw}>
                <input id="login-password" type="password" className={styles.input} disabled
                  placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" className={styles.reveal} disabled
                  aria-label="Show password (not available yet)" title="Not available yet">
                  <Eye size={17} aria-hidden="true" />
                </button>
              </div>
            </div>

            <button type="button" className={`btn btn-primary ${styles.submit}`} disabled title="Not available yet">
              Sign In <ArrowRight size={16} aria-hidden="true" />
            </button>

            <div className={styles.or} role="separator"><span>OR</span></div>

            <button type="button" className={`btn ${styles.sso}`} disabled title="Not available yet">
              Sign in with SSO
            </button>

            <p className={styles.help}>Need an account or a new password? Ask your workspace admin.</p>
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
