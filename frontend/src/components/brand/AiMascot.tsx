import styles from './AiMascot.module.css'

/**
 * The Ask AI mascot inside its accent disc (reference: components/ai/AiMascot.tsx
 * + the .hm-av disc in pages/home/home.css). Static here: the reference's
 * blinking-eyes animation is left out. Always decorative.
 */
export default function AiMascot({ size = 40, muted = false }: { size?: number; muted?: boolean }) {
  return (
    <span className={`${styles.disc} ${muted ? styles.muted : ''}`}
      style={{ inlineSize: size, blockSize: size }} aria-hidden="true">
      <svg viewBox="0 0 32 32" className={styles.svg} focusable="false">
        <line x1="16" y1="4.5" x2="16" y2="8" stroke="#dfe6ee" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16" cy="4" r="2" className={styles.tip} />
        <rect x="3.2" y="14" width="3.4" height="7" rx="1.7" className={styles.shell} />
        <rect x="25.4" y="14" width="3.4" height="7" rx="1.7" className={styles.shell} />
        <rect x="5.5" y="8" width="21" height="19" rx="8" className={styles.shell} />
        <rect x="8.5" y="11" width="15" height="12.5" rx="5.2" fill="#122029" />
        <ellipse cx="13" cy="16" rx="1.5" ry="1.9" className={styles.eye} />
        <ellipse cx="19" cy="16" rx="1.5" ry="1.9" className={styles.eye} />
        <path d="M13 19.6 Q16 21.8 19 19.6" fill="none" strokeWidth="1.5" strokeLinecap="round" className={styles.smile} />
      </svg>
    </span>
  )
}
