"use client"

import { useEffect, useState } from "react"
import type { LandingScene } from "@/lib/brand"

const OBSERVER_THRESHOLDS = [0.1, 0.2, 0.35, 0.5, 0.7, 0.9]

export function useActiveScene(defaultScene: LandingScene = "hero") {
  const [activeScene, setActiveScene] = useState<LandingScene>(defaultScene)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"))
    if (sections.length === 0) return

    const sceneRatios = new Map<LandingScene, number>()

    const resolveTopScene = () => {
      let best: LandingScene = defaultScene
      let bestRatio = -1

      for (const [scene, ratio] of sceneRatios.entries()) {
        if (ratio > bestRatio) {
          bestRatio = ratio
          best = scene
        }
      }

      if (bestRatio >= 0) {
        setActiveScene((prev) => (prev === best ? prev : best))
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const scene = entry.target.getAttribute("data-scene") as LandingScene | null
          if (!scene) continue
          sceneRatios.set(scene, entry.isIntersecting ? entry.intersectionRatio : 0)
        }
        resolveTopScene()
      },
      {
        threshold: OBSERVER_THRESHOLDS,
        rootMargin: "-20% 0px -20% 0px",
      },
    )

    for (const section of sections) {
      const scene = section.getAttribute("data-scene") as LandingScene | null
      if (scene) {
        sceneRatios.set(scene, 0)
      }
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [defaultScene])

  return activeScene
}
