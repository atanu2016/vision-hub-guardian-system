
import * as React from "react"
import Cookies from "js-cookie"
import { useMediaQuery } from "@/hooks/use-mobile"
import { SIDEBAR_COOKIE_NAME, SIDEBAR_COOKIE_MAX_AGE, SidebarContext, SidebarState } from "./types"
import { SidebarContextObj } from "./use-sidebar"

interface SidebarProviderProps {
  children: React.ReactNode
  /**
   * The default state of the sidebar.
   * @default "expanded"
   */
  defaultState?: SidebarState
  /**
   * Whether to persist the sidebar state in a cookie.
   * @default true
   */
  persist?: boolean
  /**
   * The storage key to save the sidebar state.
   * @default "sidebar:state"
   */
  storageKey?: string
}

export function SidebarProvider({
  children,
  defaultState = "expanded",
  persist = true,
  storageKey = SIDEBAR_COOKIE_NAME,
}: SidebarProviderProps) {
  const [state, setState] = React.useState<SidebarState>(() => {
    // Get the saved state from cookie.
    if (persist && typeof window !== "undefined") {
      const savedState = Cookies.get(storageKey) as SidebarState | undefined
      // If a saved state exists, use it. Otherwise, use the default state.
      return savedState || defaultState
    }

    // If not persisting state or SSR, use the default state.
    return defaultState
  })

  // Whether the sidebar is open on mobile.
  // This is separate from the desktop state.
  const [openMobile, setOpenMobile] = React.useState(false)

  // By default open is based on the state.
  const [open, setOpen] = React.useState(state === "expanded")

  // Check if we're on mobile.
  const isMobile = useMediaQuery("(max-width: 768px)")

  // When the state changes, save it to a cookie if persisting.
  React.useEffect(() => {
    if (!persist) return

    Cookies.set(storageKey, state, { expires: SIDEBAR_COOKIE_MAX_AGE })

    setOpen(state === "expanded")
  }, [state, persist, storageKey])

  // Handle keyboard shortcut.
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key === "b") {
        toggleSidebar()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Toggle the sidebar state.
  function toggleSidebar() {
    setState((prev) => {
      if (prev === "expanded") {
        return "collapsed"
      }
      return "expanded"
    })
  }

  return (
    <SidebarContextObj.Provider
      value={{
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContextObj.Provider>
  )
}

