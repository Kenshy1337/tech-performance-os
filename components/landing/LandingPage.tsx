"use client"

import { useEffect } from "react"
import { BackgroundStage } from "@/components/bg/BackgroundStage"
import { HeroCinematic } from "@/components/sections/HeroCinematic"
import { DomainsSection } from "@/components/sections/DomainsSection"
import { ScreensStorySection } from "@/components/sections/ScreensStorySection"
import { PrimeScoreDemoSection } from "@/components/sections/PrimeScoreDemoSection"
import { ManifestoSection } from "@/components/sections/ManifestoSection"
import { PricingSection } from "@/components/sections/PricingSection"
import { FaqSection } from "@/components/sections/FaqSection"
import { SiteFooter } from "@/components/sections/SiteFooter"
import { SiteNavbar } from "@/components/sections/SiteNavbar"
import { PointerProvider } from "@/components/system/PointerProvider"
import { CursorAuras } from "@/components/system/CursorAuras"
import { useActiveScene } from "@/hooks/useActiveScene"

export function LandingPage() {
  const activeScene = useActiveScene("hero")

  useEffect(() => {
    const { history, location } = window
    const previousScrollRestoration = history.scrollRestoration
    history.scrollRestoration = "manual"

    const resetViewport = () => {
      if (location.hash) {
        history.replaceState(history.state, "", `${location.pathname}${location.search}`)
      }
      window.scrollTo(0, 0)
    }

    resetViewport()
    const rafId = window.requestAnimationFrame(resetViewport)

    return () => {
      window.cancelAnimationFrame(rafId)
      history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  return (
    <PointerProvider>
      <div className="landing-root">
        <BackgroundStage activeScene={activeScene} />
        <CursorAuras />
        <SiteNavbar />

        <main className="landing-main">
          <HeroCinematic />
          <DomainsSection />
          <ScreensStorySection />
          <PrimeScoreDemoSection />
          <ManifestoSection />
          <PricingSection />
          <FaqSection />
        </main>

        <SiteFooter />
      </div>
    </PointerProvider>
  )
}
