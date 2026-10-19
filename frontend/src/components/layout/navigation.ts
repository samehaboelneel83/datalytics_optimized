import {
  Bot, Database, Home, LayoutDashboard, Plug, Settings, Sparkles, Upload, Users, type LucideIcon,
} from 'lucide-react'

/**
 * The sidebar, as data (same idea as the reference's components/navigation.ts).
 *
 * Only the high-priority destinations, in the reference's own section order
 * and wording. Items listed in IMPLEMENTED can be opened; the rest are shown
 * as plain text until their feature exists. `adminOnly` items are hidden from
 * normal users (the backend refuses them anyway).
 *
 * Deliberately deferred (present in the reference): Lineage, Glossary,
 * Dataflows, My dashboards, Templates, Automations, Migration, the whole
 * Monitoring section, every Admin page except Settings, and Platform.
 */

export type NavItemId =
  | 'home' | 'ask-ai' | 'datasets' | 'upload' | 'connections'
  | 'dashboards' | 'insights' | 'users' | 'settings'

export interface NavItem {
  id: NavItemId
  label: string
  icon: LucideIcon
  adminOnly?: boolean
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
    items: [
      { id: 'users', label: 'Users', icon: Users, adminOnly: true },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
]

/** Destinations that have a page. Everything else is still a placeholder. */
export const IMPLEMENTED: ReadonlySet<NavItemId> = new Set<NavItemId>(['home', 'users'])

/** The sections as this user sees them: admin-only items removed for normal users. */
export function navigationFor(isAdmin: boolean): NavSection[] {
  return NAVIGATION.map(section => ({
    ...section,
    items: section.items.filter(item => isAdmin || !item.adminOnly),
  }))
}
