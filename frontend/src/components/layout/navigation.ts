import {
  Bot, Database, Home, LayoutDashboard, Plug, Settings, Sparkles, Upload, type LucideIcon,
} from 'lucide-react'

/**
 * The sidebar, as data (same idea as the reference's components/navigation.ts).
 *
 * Milestone 1 keeps only the high-priority destinations, in the reference's
 * own section order and wording. Entries are VISUAL ONLY: there is no `to`
 * route yet, because nothing may navigate in this milestone. The routing
 * feature will add a `to` path (and a permission gate) to each item.
 *
 * Deliberately deferred (present in the reference): Lineage, Glossary,
 * Dataflows, My dashboards, Templates, Automations, Migration, the whole
 * Monitoring section, every Admin page except Settings, and Platform.
 */

export type NavItemId =
  | 'home' | 'ask-ai' | 'datasets' | 'upload' | 'connections'
  | 'dashboards' | 'insights' | 'settings'

export interface NavItem {
  id: NavItemId
  label: string
  icon: LucideIcon
}

export interface NavSection {
  /** Section heading, or null for the ungrouped entries at the top. */
  title: string | null
  items: NavItem[]
}

export const NAVIGATION: readonly NavSection[] = [
  {
    title: null,
    items: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'ask-ai', label: 'Ask AI', icon: Bot },
    ],
  },
  {
    title: 'Data',
    items: [{ id: 'datasets', label: 'Datasets', icon: Database }],
  },
  {
    title: 'Data sources',
    items: [
      { id: 'upload', label: 'Upload', icon: Upload },
      { id: 'connections', label: 'Connections', icon: Plug },
    ],
  },
  {
    title: 'Analyse',
    items: [
      { id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard },
      { id: 'insights', label: 'Insights', icon: Sparkles },
    ],
  },
  {
    title: 'Admin',
    items: [{ id: 'settings', label: 'Settings', icon: Settings }],
  },
]
