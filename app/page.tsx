"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AppSidebar } from "@/components/prime-vault/app-sidebar"
import { AppTopbar } from "@/components/prime-vault/app-topbar"
import { TodayScreen } from "@/components/prime-vault/today-screen"
import { WeekScreen } from "@/components/prime-vault/week-screen"
import { HistoryScreen } from "@/components/prime-vault/history-screen"
import { AchievementsScreen } from "@/components/prime-vault/achievements-screen"
import { ProfileScreen } from "@/components/prime-vault/profile-screen"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { useProfile, useUpdateProfile } from "@/data/hooks"
import { OnboardingFlow } from "@/components/prime-vault/onboarding-flow"
import { OnboardingTour, TourStep } from "@/components/prime-vault/onboarding-tour"

export type ScreenType = "today" | "week" | "history" | "achievements" | "profile"

export default function PrimeVault() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()

  const TOUR_STORAGE_KEY = "vector-tour-state"

  const [activeScreen, setActiveScreen] = useState<ScreenType>("today")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedScreen, setDisplayedScreen] = useState<ScreenType>("today")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [tourIndex, setTourIndex] = useState(0)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

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

  const tourSteps: TourStep[] = useMemo(
    () => [
      {
        id: "sidebar",
        title: "Navigation",
        description: "Move between Today, Week, History, Achievements, and Profile anytime.",
        selector: "[data-tour='sidebar']",
      },
      {
        id: "prime-score",
        title: "Prime Score",
        description: "Your main performance signal. It blends Output, Focus, and Recovery.",
        selector: "[data-tour='prime-score']",
        screen: "today",
      },
      {
        id: "domains",
        title: "Domain Rings",
        description: "Brain, Build, Body, Recovery — each ring shows your daily completion.",
        selector: "[data-tour='domain-rings']",
        screen: "today",
      },
      {
        id: "quick-log",
        title: "Quick Log",
        description: "Capture work in seconds. Pick a pillar, activity, and minutes.",
        selector: "[data-tour='quick-log']",
        screen: "today",
      },
      {
        id: "focus-recovery",
        title: "Focus & Recovery",
        description: "Tune quality and sleep to lift your Prime Score.",
        selector: "[data-tour='focus-recovery']",
        screen: "today",
      },
      {
        id: "deliverables",
        title: "Deliverables",
        description: "Plan and ship outputs. Output Score drives Prime Score momentum.",
        selector: "[data-tour='deliverables']",
        screen: "today",
      },
      {
        id: "week",
        title: "Weekly Overview",
        description: "See trends and averages for the current week.",
        selector: "[data-tour='week-header']",
        screen: "week",
      },
      {
        id: "history",
        title: "History Calendar",
        description: "Review any date or range with performance highlights.",
        selector: "[data-tour='history-calendar']",
        screen: "history",
      },
      {
        id: "achievements",
        title: "Achievements",
        description: "Unlock milestones and track what’s next.",
        selector: "[data-tour='achievements-trophy']",
        screen: "achievements",
      },
      {
        id: "profile",
        title: "Profile",
        description: "Update your identity and life metrics anytime.",
        selector: "[data-tour='profile-summary']",
        screen: "profile",
      },
    ],
    [],
  )

  useEffect(() => {
    if (status !== "authenticated" || !profile) return
    if (profile.onboardingStatus !== "completed") {
      setShowOnboarding(true)
    }
  }, [status, profile])

  useEffect(() => {
    if (status !== "authenticated" || !profile) return
    const raw = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as { active?: boolean; index?: number }
      if (parsed.active) {
        const maxIndex = Math.max(0, tourSteps.length - 1)
        const clamped = Math.max(0, Math.min(parsed.index ?? 0, maxIndex))
        setTourIndex(clamped)
        setShowTour(true)
      }
    } catch {
      localStorage.removeItem(TOUR_STORAGE_KEY)
    }
  }, [status, profile, tourSteps.length])

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

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <>
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
        <Toaster />
      </div>

      <OnboardingFlow
        open={showOnboarding}
        profile={profile}
        sessionName={session?.user?.name ?? undefined}
        sessionTimezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
        onComplete={(payload) => {
          updateProfile.mutate({
            ...payload,
            onboardingStatus: "completed",
            onboardingCompletedAt: new Date().toISOString(),
          })
          setShowOnboarding(false)
          setTourIndex(0)
          setShowTour(true)
          localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({ active: true, index: 0 }))
        }}
      />

      <OnboardingTour
        open={showTour}
        steps={tourSteps}
        onNavigate={handleScreenChange}
        currentIndex={tourIndex}
        onIndexChange={(nextIndex) => {
          const clamped = Math.max(0, Math.min(nextIndex, tourSteps.length - 1))
          setTourIndex(clamped)
          localStorage.setItem(
            TOUR_STORAGE_KEY,
            JSON.stringify({ active: true, index: clamped }),
          )
        }}
        onClose={() => {
          setShowTour(false)
          localStorage.removeItem(TOUR_STORAGE_KEY)
        }}
      />
    </>
  )
}
