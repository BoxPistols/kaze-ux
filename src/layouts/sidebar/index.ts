// Sidebar components
export { Sidebar, type SidebarProps } from './sidebar'
export { SidebarHeader, Logo } from './sidebarHeader'
export { SidebarProvider, useSidebar } from './sidebarContext'
export {
  LayoutWithSidebar,
  type LayoutWithSidebarProps,
} from './layoutWithSidebar'
export {
  FullScreenLayoutWithSidebar,
  type FullScreenLayoutWithSidebarProps,
} from './fullScreenLayoutWithSidebar'
export { SidebarToggle } from './sidebarToggle'
export { MenuCategory } from './menuCategory'
export { MenuItemButton } from './menuItemButton'
export { AccountMenu, type AccountMenuProps } from './accountMenu'

// Types
export type {
  MenuItem,
  AccountMenu as AccountMenuType,
  AccountMenuItem,
} from './types'

// Constants
export {
  SIDEBAR_WIDTH,
  MENU_CATEGORIES,
  defaultMenuItems,
  MAIN_ELEMENT_PADDING_TOP_SPACING,
  MAIN_ELEMENT_PADDING_BOTTOM_SPACING,
  CONTAINER_MAX_WIDTH,
  type ContainerMaxWidthVariant,
} from './constants'

// Utils
export { groupMenuItemsByCategory } from './utils'
