export interface GenerateAdminSidebarProps {
  title: string
  to?: string
  icon?: React.ReactNode
  subItems?: GenerateAdminSidebarProps[]
  /**
   * Fee permissions that unlock the item (mirror of the backend role matrix).
   * An item without permissions is always visible.
   */
  permissions?: string[]
}
