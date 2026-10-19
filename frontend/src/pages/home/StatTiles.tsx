import { Database, LayoutDashboard, Plug, RefreshCw, type LucideIcon } from 'lucide-react'
import styles from './StatTiles.module.css'

interface Tile { key: string; icon: LucideIcon; label: string }

/** The four "at a glance" tiles of the reference. */
const TILES: readonly Tile[] = [
  { key: 'dashboards', icon: LayoutDashboard, label: 'Dashboards' },
  { key: 'datasets', icon: Database, label: 'Datasets' },
  { key: 'connections', icon: Plug, label: 'Connections' },
  { key: 'last-update', icon: RefreshCw, label: 'Last data update' },
]

/**
 * Values are an em dash with "Not connected yet": with no backend there is
 * no true number to show, and a made-up "0" or "12" would be a fake metric.
 */
export default function StatTiles() {
  return (
    <section className={styles.stats} aria-label="At a glance">
      {TILES.map(({ key, icon: Icon, label }) => (
        <div key={key} className={styles.tile} data-testid={`tile-${key}`}>
          <span className={styles.label}><Icon size={14} aria-hidden="true" />{label}</span>
          <span className={styles.value} aria-label="No value">—</span>
          <span className={styles.sub}>Not connected yet</span>
        </div>
      ))}
    </section>
  )
}
