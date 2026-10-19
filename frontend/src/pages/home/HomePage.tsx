import PreviewNote from '../../components/ui/PreviewNote'
import ContinueSection from './ContinueSection'
import GetStarted from './GetStarted'
import Hero from './Hero'
import StatTiles from './StatTiles'
import styles from './HomePage.module.css'

/**
 * Home, milestone 1 (reference: pages/Home.tsx, redesign 7a).
 *
 * Reproduces the reference's FIRST-RUN state, a workspace with no data yet,
 * because that is the only state we can show truthfully with nothing
 * connected: no metric is invented, and every action is a disabled
 * placeholder. Each section is its own component so the data feature can
 * later feed it real values without touching the layout.
 */
export default function HomePage({ today = new Date() }: { today?: Date }) {
  return (
    <div className={styles.page}>
      <PreviewNote>UI preview — sample layout, no data connected</PreviewNote>
      <div className={styles.topRow}>
        <Hero today={today} />
        <StatTiles />
      </div>
      <GetStarted />
      <ContinueSection />
    </div>
  )
}
