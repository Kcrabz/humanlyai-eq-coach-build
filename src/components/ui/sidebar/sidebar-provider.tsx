import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TooltipProvider } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  id: string | undefined;
};

// Create a context map to store multiple sidebar contexts
const SidebarContexts: Record<string, React.Context<SidebarContext | null>> = {};

// Get or create a context for a specific sidebar
const getSidebarContext = (id: string = "default") => {
  if (!SidebarContexts[id]) {
    SidebarContexts[id] = React.createContext<SidebarContext | null>(null);
  }
  return SidebarContexts[id];
};

export function useSidebar(id: string = "default") {
  const context = React.useContext(getSidebarContext(id));
  if (!context) {
    throw new Error(`useSidebar must be used within a SidebarProvider with id ${id}.`);
  }

  return context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    id?: string;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      id = "default",
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}:${id}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open, id]
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      // Only add keyboard shortcut for the default sidebar
      if (id !== "default") return;
      
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar, id]);

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        id,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, id]
    );

    const SidebarContextProvider = getSidebarContext(id);

    return (
      <SidebarContextProvider.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": "16rem",
                "--sidebar-width-icon": "3rem",
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContextProvider.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

// Create a convenience component for left sidebar
export const LeftSidebarProvider = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof SidebarProvider>, "id">
>((props, ref) => (
  <SidebarProvider {...props} id="left" ref={ref} />
));
LeftSidebarProvider.displayName = "LeftSidebarProvider";

// Create a convenience component for right sidebar
export const RightSidebarProvider = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof SidebarProvider>, "id">
>((props, ref) => (
  <SidebarProvider {...props} id="right" ref={ref} />
));
RightSidebarProvider.displayName = "RightSidebarProvider";

// Import util from outside this file
import { cn } from "@/lib/utils";
