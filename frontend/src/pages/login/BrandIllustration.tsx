import { useId } from 'react'
import { Cloud, Database, FileSpreadsheet, Sparkles } from 'lucide-react'
import styles from './BrandIllustration.module.css'

/**
 * The sign-in brand picture (reference: components/auth/BrandIllustration.tsx):
 * three kinds of source flow into an AI node, and out comes a mini dashboard.
 *
 * Simplified for milestone 1: the reference animates it (flowing dashes,
 * a count-up KPI, growing bars) and mirrors it for RTL. Here it is the
 * reference's finished frame, static and LTR. The numbers are part of a
 * drawing, not data.
 */

const W = 640
const H = 400
const TILE = 56
const SRC_X = 72
const NODE = { x: 304, y: 200 }
const CARD = { x: 400, y: 56, w: 212, h: 288 }

const SOURCES = [
  { y: 92, Icon: Database, label: 'Database', tone: styles.tone1 },
  { y: 200, Icon: FileSpreadsheet, label: 'CSV / Excel', tone: styles.tone5 },
  { y: 308, Icon: Cloud, label: 'Cloud', tone: styles.tone2 },
] as const

const BARS = [0.42, 0.66, 0.54, 0.86, 0.72]
const LINE = 'M0 46 L 28 38 L 56 42 L 85 26 L 113 30 L 142 14 L 170 8'
const DONUT = [
  { len: 46, off: 0, cls: styles.donutS1 },
  { len: 30, off: -46, cls: styles.donutS2 },
  { len: 24, off: -76, cls: styles.donutS3 },
]

/** Curve from a source tile into the AI node. */
function flow(y: number) {
  const x0 = SRC_X + TILE / 2 + 6, x1 = NODE.x - 34
  const c0 = SRC_X + TILE / 2 + 96, c1 = NODE.x - 110
  return `M${x0} ${y} C ${c0} ${y}, ${c1} ${NODE.y}, ${x1} ${NODE.y}`
}
const OUT = `M${NODE.x + 34} ${NODE.y} L ${CARD.x - 8} ${NODE.y}`

export default function BrandIllustration({ className, decorative = false }: {
  className?: string
  /** A second copy (the phone strip) that must not be announced twice. */
  decorative?: boolean
}) {
  const uid = useId().replace(/:/g, '')
  const titleId = `ill-title-${uid}`, descId = `ill-desc-${uid}`, glowId = `ill-glow-${uid}`
  return (
    <svg viewBox={`28 40 ${W - 56} ${H - 74}`} className={`${styles.ill} ${className ?? ''}`}
      preserveAspectRatio="xMidYMid meet" focusable="false"
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-labelledby': titleId, 'aria-describedby': descId })}>
      {!decorative && <title id={titleId}>How Datalytics works</title>}
      {!decorative && (
        <desc id={descId}>
          Data from databases, spreadsheets and cloud sources flows through Datalytics AI and comes
          out as a dashboard with a KPI, a bar chart, a donut chart and a line chart.
        </desc>
      )}
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" className={styles.glowStop0} />
          <stop offset="100%" className={styles.glowStop1} />
        </radialGradient>
      </defs>

      {SOURCES.map(s => (
        <g key={s.y}>
          <path d={flow(s.y)} className={styles.rail} />
          <path d={flow(s.y)} className={styles.flow} />
        </g>
      ))}
      <path d={OUT} className={styles.rail} />
      <path d={OUT} className={styles.flow} />

      {SOURCES.map(({ y, Icon, label, tone }) => (
        <g key={label}>
          <rect x={SRC_X - TILE / 2} y={y - TILE / 2} width={TILE} height={TILE} rx={14} className={styles.tile} />
          <Icon x={SRC_X - 12} y={y - 12} width={24} height={24} className={`${styles.icon} ${tone}`} aria-hidden="true" />
          <text x={SRC_X} y={y + TILE / 2 + 18} textAnchor="middle" className={styles.caption}>{label}</text>
        </g>
      ))}

      <g>
        <circle cx={NODE.x} cy={NODE.y} r={62} fill={`url(#${glowId})`} />
        <circle cx={NODE.x} cy={NODE.y} r={38} className={styles.orbit} />
        <circle cx={NODE.x} cy={NODE.y} r={26} className={styles.core} />
        <Sparkles x={NODE.x - 13} y={NODE.y - 13} width={26} height={26} className={styles.spark} aria-hidden="true" />
        <text x={NODE.x} y={NODE.y + 58} textAnchor="middle" className={`${styles.caption} ${styles.captionAi}`}>AI</text>
      </g>

      <g transform={`translate(${CARD.x} ${CARD.y})`}>
        <rect width={CARD.w} height={CARD.h} rx={16} className={styles.card} />
        {[16, 28, 40].map(cx => <circle key={cx} cx={cx} cy={16} r={3.5} className={styles.dot} />)}

        <rect x={12} y={30} width={CARD.w - 24} height={62} rx={10} className={styles.panel} />
        <text x={24} y={50} className={styles.kpiLabel}>Revenue</text>
        <text x={24} y={78} className={styles.kpi}>2,480,000</text>
        <g transform={`translate(${CARD.w - 76} 40)`}>
          <rect width={52} height={20} rx={10} className={styles.deltaBg} />
          <text x={26} y={14} textAnchor="middle" className={styles.delta}>+12.4%</text>
        </g>

        <g transform="translate(12 104)">
          <rect width={104} height={94} rx={10} className={styles.panel} />
          {BARS.map((h, i) => (
            <rect key={i} x={12 + i * 17} y={82 - h * 66} width={11} height={h * 66} rx={2.5}
              className={i === 3 ? styles.barHi : styles.bar} />
          ))}
        </g>

        <g transform={`translate(${CARD.w - 12 - 84} 104)`}>
          <rect width={84} height={94} rx={10} className={styles.panel} />
          <circle cx={42} cy={47} r={25} className={styles.donutTrack} />
          {DONUT.map(seg => (
            <circle key={seg.len} cx={42} cy={47} r={25} pathLength={100} transform="rotate(-90 42 47)"
              className={`${styles.donut} ${seg.cls}`}
              strokeDasharray={`${seg.len} 100`} strokeDashoffset={seg.off} />
          ))}
        </g>

        <g transform="translate(12 210)">
          <rect width={CARD.w - 24} height={66} rx={10} className={styles.panel} />
          <g transform="translate(8 6)">
            <path d={`${LINE} L 170 54 L 0 54 Z`} className={styles.area} />
            <path d={LINE} className={styles.line} />
          </g>
        </g>
      </g>
    </svg>
  )
}
