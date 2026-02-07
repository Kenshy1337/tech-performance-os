"use client"

import { useEffect, useState } from "react"

type Shockwave = {
  id: number
  x: number
  y: number
}

const SHOCKWAVE_LIFETIME_MS = 680

export function CursorAuras() {
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([])
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mediaQuery.matches)

    const handleChange = () => setReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const onPointerDown = (event: PointerEvent) => {
      const wave: Shockwave = {
        id: performance.now(),
        x: event.clientX,
        y: event.clientY,
      }
      setShockwaves((prev) => [...prev, wave])

      window.setTimeout(() => {
        setShockwaves((prev) => prev.filter((item) => item.id !== wave.id))
      }, SHOCKWAVE_LIFETIME_MS)
    }

    window.addEventListener("pointerdown", onPointerDown, { passive: true })
    return () => window.removeEventListener("pointerdown", onPointerDown)
  }, [reducedMotion])

  return (
    <div aria-hidden className="cursor-auras-layer">
      <div className="cursor-aura-main" />
      <div className="cursor-aura-velocity" />
      {shockwaves.map((wave) => (
        <span
          key={wave.id}
          className="cursor-shockwave"
          style={{
            left: `${wave.x}px`,
            top: `${wave.y}px`,
          }}
        />
      ))}
    </div>
  )
}
