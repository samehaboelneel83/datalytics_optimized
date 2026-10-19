import styles from './BrandMark.module.css'

/** The "D" tile and the lowercase wordmark, as in the reference rail and sign-in bar. */
export default function BrandMark({ size = 'md', showWordmark = true }: {
  size?: 'md' | 'lg'
  showWordmark?: boolean
}) {
  return (
    <span className={`${styles.brand} ${size === 'lg' ? styles.lg : ''}`}>
      <span className={styles.mark} aria-hidden="true">D</span>
      {showWordmark
        ? <span className={styles.wordmark}>datalytics</span>
        : <span className="dl-sr-only">Datalytics</span>}
    </span>
  )
}
