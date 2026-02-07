"use client"

import { useEffect, useMemo, useRef } from "react"

type HeroGravityWordProps = {
  text: string
}

type LetterState = {
  baseX: number
  baseY: number
  x: number
  y: number
}

const RADIUS_PX = 420
const MAX_OFFSET_PX = 30
const EASING = 0.065

export function HeroGravityWord({ text }: HeroGravityWordProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([])
  const letterStatesRef = useRef<LetterState[]>([])

  const letters = useMemo(() => text.split(""), [text])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const container = containerRef.current
    if (!container) return

    const recomputeBasePositions = () => {
      const nextStates: LetterState[] = []
      letterRefs.current.forEach((node, index) => {
        if (!node) return
        const rect = node.getBoundingClientRect()
        nextStates[index] = {
          baseX: rect.left + rect.width / 2,
          baseY: rect.top + rect.height / 2,
          x: 0,
          y: 0,
        }
      })
      letterStatesRef.current = nextStates
    }

    recomputeBasePositions()

    const onResize = () => {
      recomputeBasePositions()
    }

    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onResize, { passive: true })

    const resizeObserver = new ResizeObserver(recomputeBasePositions)
    resizeObserver.observe(container)

    let rafId = 0
    const frame = () => {
      const reducedMotion = mediaQuery.matches
      const pointer = window.__vectorPointer

      letterRefs.current.forEach((node, index) => {
        if (!node) return
        const state = letterStatesRef.current[index]
        if (!state) return

        let targetX = 0
        let targetY = 0

        if (!reducedMotion && pointer) {
          const dx = pointer.x - state.baseX
          const dy = pointer.y - state.baseY
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < RADIUS_PX) {
            const strength = Math.pow(1 - distance / RADIUS_PX, 2)
            const pullScale = 0.16 + pointer.velocity * 0.08
            targetX = Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, dx * strength * pullScale))
            targetY = Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, dy * strength * pullScale))
          }
        }

        state.x += (targetX - state.x) * EASING
        state.y += (targetY - state.y) * EASING

        node.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`
      })

      rafId = window.requestAnimationFrame(frame)
    }

    rafId = window.requestAnimationFrame(frame)

    return () => {
      window.cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onResize)
    }
  }, [])

  return (
    <div className="hero-backdrop-word" aria-hidden ref={containerRef}>
      {letters.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="hero-backdrop-letter"
          ref={(node) => {
            letterRefs.current[index] = node
          }}
        >
          {char}
        </span>
      ))}
    </div>
  )
}
