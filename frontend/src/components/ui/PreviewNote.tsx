import { Eye } from 'lucide-react'

/**
 * Milestone 1 marker: tells the reader this page is a static design preview,
 * so a placeholder control is never mistaken for a broken feature.
 * Remove it from a page once that page's real behaviour ships.
 */
export default function PreviewNote({ children = 'UI preview — not connected yet' }: { children?: string }) {
  return (
    <p className="dl-preview-note" role="note">
      <Eye size={13} aria-hidden="true" />
      {children}
    </p>
  )
}
