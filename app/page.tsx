"use client"

import { useState, useEffect, useRef } from "react"
import { AppProviders } from "@/app/providers"
import { AppSidebar } from "@/components/prime-vault/app-sidebar"
import { AppTopbar } from "@/components/prime-vault/app-topbar"
import { TodayScreen } from "@/components/prime-vault/today-screen"
import { WeekScreen } from "@/components/prime-vault/week-screen"
import { HistoryScreen } from "@/components/prime-vault/history-screen"
import { AchievementsScreen } from "@/components/prime-vault/achievements-screen"
import { ProfileScreen } from "@/components/prime-vault/profile-screen"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

export type ScreenType = "today" | "week" | "history" | "achievements" | "profile"

export default function PrimeVault() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("today")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedScreen, setDisplayedScreen] = useState<ScreenType>("today")
  const prefersReducedMotion = useRef(false)

  // Check for reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  }, [])

  // Handle screen transitions
  const handleScreenChange = (newScreen: ScreenType) => {
    if (newScreen === activeScreen) return

    if (prefersReducedMotion.current) {
      // Instant transition for reduced motion
      setActiveScreen(newScreen)
      setDisplayedScreen(newScreen)
    } else {
      // Animated transition
      setIsTransitioning(true)
      setActiveScreen(newScreen)
      
      // Small delay to trigger re-mount animation
      requestAnimationFrame(() => {
        setDisplayedScreen(newScreen)
        setIsTransitioning(false)
      })
    }
  }

  const screenTitles: Record<ScreenType, string> = {
    today: "Today",
    week: "Week",
    history: "History",
    achievements: "Achievements",
    profile: "Profile",
  }

  const renderScreen = () => {
    switch (displayedScreen) {
      case "today":
        return (
          <TodayScreen
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        )
      case "week":
        return <WeekScreen />
      case "history":
        return (
          <HistoryScreen
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        )
      case "achievements":
        return <AchievementsScreen />
      case "profile":
        return <ProfileScreen />
    }
  }

  return (
    <AppProviders>
      <div className="flex min-h-screen bg-background">
        {/* Collapsible Sidebar */}
        <AppSidebar
          activeScreen={activeScreen}
          onScreenChange={handleScreenChange}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <AppTopbar
            title={screenTitles[activeScreen]}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />

          <main className="flex-1 overflow-y-auto px-6 py-6">
            <div
              key={displayedScreen}
              className={cn(
                "mx-auto max-w-6xl",
                !isTransitioning && "page-enter"
              )}
            >
              {renderScreen()}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </AppProviders>
  )
}
