"use client"

import { useEffect, type ReactNode } from "react"

declare global {
  interface Window {
    __vectorPointer?: {
      x: number
      y: number
      velocity: number
      reducedMotion: boolean
    }
  }
}

type PointerProviderProps = {
  children: ReactNode
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function PointerProvider({ children }: PointerProviderProps) {
  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const state = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      targetX: window.innerWidth * 0.5,
      targetY: window.innerHeight * 0.5,
      prevX: window.innerWidth * 0.5,
      prevY: window.innerHeight * 0.5,
      velocity: 0,
      direction: 0,
      pointerDownAt: 0,
      reducedMotion: mediaQuery.matches,
    }

    const writeVars = (timeMs: number) => {
      root.style.setProperty("--mx", `${state.x.toFixed(2)}px`)
      root.style.setProperty("--my", `${state.y.toFixed(2)}px`)
      root.style.setProperty("--mv", state.velocity.toFixed(4))
      root.style.setProperty("--md", state.direction.toFixed(4))
      root.style.setProperty("--t", (timeMs / 1000).toFixed(3))
      root.style.setProperty("--pointer-down-age", ((performance.now() - state.pointerDownAt) / 1000).toFixed(3))
      window.__vectorPointer = {
        x: state.x,
        y: state.y,
        velocity: state.velocity,
        reducedMotion: state.reducedMotion,
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      state.targetX = event.clientX
      state.targetY = event.clientY
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      state.targetX = touch.clientX
      state.targetY = touch.clientY
    }

    const handlePointerDown = () => {
      state.pointerDownAt = performance.now()
    }

    const handleResize = () => {
      state.targetX = clamp(state.targetX, 0, window.innerWidth)
      state.targetY = clamp(state.targetY, 0, window.innerHeight)
    }

    const handleMotionPreference = () => {
      state.reducedMotion = mediaQuery.matches
    }

    let rafId = 0
    const tick = (timeMs: number) => {
      const easing = state.reducedMotion ? 0.25 : 0.12
      state.x += (state.targetX - state.x) * easing
      state.y += (state.targetY - state.y) * easing

      const deltaX = state.x - state.prevX
      const deltaY = state.y - state.prevY
      const rawVelocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      state.velocity = clamp(rawVelocity / 45, 0, 1.4)
      state.direction = Math.atan2(deltaY, deltaX)

      state.prevX = state.x
      state.prevY = state.y

      writeVars(timeMs)
      rafId = window.requestAnimationFrame(tick)
    }

    writeVars(0)
    rafId = window.requestAnimationFrame(tick)

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("pointerdown", handlePointerDown, { passive: true })
    window.addEventListener("resize", handleResize)
    mediaQuery.addEventListener("change", handleMotionPreference)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("resize", handleResize)
      mediaQuery.removeEventListener("change", handleMotionPreference)
    }
  }, [])

  return <>{children}</>
}
