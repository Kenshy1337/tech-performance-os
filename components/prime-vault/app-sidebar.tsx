"use client"

import React, { useRef, useEffect, useState } from "react"
import {
  CalendarDays,
  Calendar,
  History,
  Trophy,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScreenType } from "@/app/page"
import { BrandLogo, VectorIcon } from "./brand-logo"

interface AppSidebarProps {
  activeScreen: ScreenType
  onScreenChange: (screen: ScreenType) => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

const navItems: { id: ScreenType; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Today", icon: <CalendarDays className="size-5" /> },
  { id: "week", label: "Week", icon: <Calendar className="size-5" /> },
  { id: "history", label: "History", icon: <History className="size-5" /> },
  { id: "achievements", label: "Achievements", icon: <Trophy className="size-5" /> },
  { id: "profile", label: "Profile", icon: <User className="size-5" /> },
]

export function AppSidebar({
  activeScreen,
  onScreenChange,
  collapsed,
  onCollapsedChange,
}: AppSidebarProps) {
  const navRef = useRef<HTMLDivElement>(null)
  const [pillStyle, setPillStyle] = useState({ top: 0, height: 0 })
  const [isInitialized, setIsInitialized] = useState(false)

  // Update pill position when active screen changes
  useEffect(() => {
    if (!navRef.current) return

    const activeIndex = navItems.findIndex((item) => item.id === activeScreen)
    const buttons = navRef.current.querySelectorAll("button")
    const activeButton = buttons[activeIndex]

    if (activeButton) {
      const navRect = navRef.current.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()

      setPillStyle({
        top: buttonRect.top - navRect.top,
        height: buttonRect.height,
      })

      // Mark as initialized after first measurement
      if (!isInitialized) {
        requestAnimationFrame(() => setIsInitialized(true))
      }
    }
  }, [activeScreen, collapsed, isInitialized])

  return (
    <aside
      data-tour="sidebar"
      className={cn(
        "relative hidden flex-col border-r border-border/60 bg-sidebar lg:flex",
        "transition-[width] duration-200",
        collapsed ? "w-16" : "w-60"
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}
    >
      {/* Logo/Brand */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-border/60 px-4",
          collapsed ? "justify-center" : "gap-0"
        )}
      >
        {collapsed ? (
          <VectorIcon size={28} />
        ) : (
          <BrandLogo variant="full" size="md" />
        )}
      </div>

      {/* Navigation with animated pill */}
      <nav ref={navRef} className="relative flex-1 p-2">
        {/* Animated pill highlight */}
        <div
          className={cn(
            "nav-pill-highlight pointer-events-none absolute left-2 right-2",
            !isInitialized && "opacity-0"
          )}
          style={{
            top: pillStyle.top,
            height: pillStyle.height,
          }}
        />

        {/* Nav items */}
        <div className="relative z-10 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={cn(
                "nav-item flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                collapsed && "justify-center px-0",
                activeScreen === item.id
                  ? "text-foreground dark:text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border/60 p-2">
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="nav-item flex w-full items-center justify-center rounded-md py-1.5 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
