
import * as React from "react"
import { SidebarContext } from "./types"

// Create sidebar context
const SidebarContextObj = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContextObj)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

export { SidebarContextObj }
