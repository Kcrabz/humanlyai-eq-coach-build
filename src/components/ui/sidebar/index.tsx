
// Re-export all sidebar components from this index file
export * from "./sidebar-provider";
export * from "./sidebar-main";
export * from "./sidebar-controls";
export * from "./sidebar-sections";
export * from "./sidebar-menu";
export * from "./sidebar-group";

// For backward compatibility, re-export everything from the old location
// without causing naming conflicts
import { 
  Sidebar as SidebarLegacy,
  SidebarTrigger as SidebarTriggerLegacy,
  SidebarRail as SidebarRailLegacy,
  SidebarInset as SidebarInsetLegacy,
  SidebarInput as SidebarInputLegacy,
  SidebarHeader as SidebarHeaderLegacy,
  SidebarFooter as SidebarFooterLegacy,
  SidebarContent as SidebarContentLegacy,
  SidebarSeparator as SidebarSeparatorLegacy
} from "./sidebar-components-legacy";

export {
  SidebarLegacy,
  SidebarTriggerLegacy,
  SidebarRailLegacy,
  SidebarInsetLegacy,
  SidebarInputLegacy,
  SidebarHeaderLegacy,
  SidebarFooterLegacy,
  SidebarContentLegacy,
  SidebarSeparatorLegacy
};
