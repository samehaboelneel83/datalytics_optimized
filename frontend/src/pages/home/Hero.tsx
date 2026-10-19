import { ArrowUp, Calendar } from 'lucide-react'
import AiMascot from '../../components/brand/AiMascot'
import styles from './Hero.module.css'

/**
 * Greeting + the Ask AI box. The box is shown in the reference's
 * "no data yet" state: read-only, dashed, and saying why. It is not a form,
 * so nothing can be submitted.
 */
export default function Hero({ today }: { today: Date }) {
  const date = today.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <p className={styles.date}>
        <Calendar size={14} aria-hidden="true" />
        <time dateTime={today.toISOString().slice(0, 10)}>{date}</time>
      </p>
      <h1 id="home-title" className={styles.title}>Welcome to Datalytics</h1>
      <p className={styles.sub}>Your workspace is ready. Three steps to your first insight.</p>

      <div className={styles.ask}>
        <AiMascot size={40} />
        <label className="dl-sr-only" htmlFor="home-ask">Ask a question about your data</label>
        <input id="home-ask" className={styles.askInput} type="text" disabled
          placeholder="Connect data first to ask questions" />
        <button type="button" className={styles.send} disabled
          aria-label="Ask AI (not available yet)" title="Not available yet">
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
