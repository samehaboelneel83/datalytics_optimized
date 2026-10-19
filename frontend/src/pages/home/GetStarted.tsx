import { Database, Plug, Upload } from 'lucide-react'
import AiMascot from '../../components/brand/AiMascot'
import styles from './GetStarted.module.css'

const STEPS = [
  { title: 'Connect data', text: 'Upload a file or connect a database.' },
  { title: 'Build a dashboard', text: 'Turn a dataset into charts in a few clicks.' },
  { title: 'Ask AI', text: 'Ask a question in plain language and get an answer.' },
] as const

/**
 * The reference's first-run "Set up your workspace" card (Onboarding in
 * pages/home/parts.tsx). Step 1 is drawn as current, as it is for a new
 * workspace; its buttons are disabled placeholders.
 */
export default function GetStarted() {
  return (
    <section className={styles.card} aria-labelledby="get-started-title">
      <div>
        <p className={styles.eyebrow}>Get started</p>
        <h2 id="get-started-title" className={styles.title}>Set up your workspace</h2>
        <div className={styles.progress}>
          <span className={styles.track} role="progressbar" aria-label="Setup progress"
            aria-valuemin={0} aria-valuemax={3} aria-valuenow={0} />
          <span>0 of 3 complete</span>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((s, i) => {
            const current = i === 0
            return (
              <li key={s.title} className={`${styles.step} ${current ? styles.current : ''}`}
                aria-current={current ? 'step' : undefined}>
                <span className={styles.num} aria-hidden="true">{i + 1}</span>
                <div className={styles.text}>
                  <b>{s.title}</b>
                  <p>{s.text}</p>
                </div>
                {current && (
                  <div className={styles.actions}>
                    <button type="button" className="btn btn-primary btn-sm" disabled title="Not available yet">
                      <Upload size={14} aria-hidden="true" />Upload data
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" disabled title="Not available yet">
                      <Plug size={14} aria-hidden="true" />New connection
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <Illustration />
    </section>
  )
}

/** Decorative: floating mini-cards around the AI mascot (static, no float loop). */
function Illustration() {
  return (
    <div className={styles.ill} aria-hidden="true">
      <div className={styles.glow} />
      <svg className={styles.lines} viewBox="0 0 400 300" preserveAspectRatio="none" fill="none">
        <g stroke="var(--mc-border-strong)" strokeWidth="1.6" strokeDasharray="1 6" strokeLinecap="round">
          <path d="M130 80Q160 100 172 124" /><path d="M290 90Q262 104 236 126" />
          <path d="M110 240Q150 226 170 188" /><path d="M300 230Q262 220 232 186" />
        </g>
      </svg>
      <div className={`${styles.fc} ${styles.f1}`}>
        <div className={styles.kpi}><i /></div>
        <div className={styles.bars}>
          {[44, 70, 54, 96, 62].map((h, i) => (
            <i key={i} style={{ blockSize: `${h}%` }} className={i === 3 ? styles.barHi : undefined} />
          ))}
        </div>
      </div>
      <div className={`${styles.fc} ${styles.f2}`}>
        {[0, 1, 2].map(i => <div key={i}><Database size={13} /><i /></div>)}
      </div>
      <div className={`${styles.fc} ${styles.f3}`}><i /><i /><i /></div>
      <div className={`${styles.fc} ${styles.f4}`}>
        <svg viewBox="0 0 40 40" width="56" height="56">
          <circle cx="20" cy="20" r="13" fill="none" stroke="var(--surface2)" strokeWidth="7" />
          <circle cx="20" cy="20" r="13" fill="none" stroke="var(--accent)" strokeWidth="7"
            strokeDasharray="30 82" transform="rotate(-90 20 20)" />
        </svg>
      </div>
      <span className={styles.mascot}><AiMascot size={124} /></span>
    </div>
  )
}
