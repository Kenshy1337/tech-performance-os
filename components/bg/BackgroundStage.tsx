"use client"

import { useEffect, useRef } from "react"
import { brand, type LandingScene } from "@/lib/brand"

type BackgroundStageProps = {
  activeScene: LandingScene
}

type Star = {
  x: number
  y: number
  z: number
  size: number
  drift: number
}

type Glyph = {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  char: string
  size: number
}

type Rgb = { r: number; g: number; b: number }

const GLYPHS = ["#", "+", "*", "·", "░", "▒", "/", "~", "="]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const hexToRgb = (hex: string): Rgb => {
  const normalized = hex.replace("#", "")
  const full = normalized.length === 3
    ? normalized
        .split("")
        .map((ch) => ch + ch)
        .join("")
    : normalized

  const int = Number.parseInt(full, 16)
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

const mixRgb = (from: Rgb, to: Rgb, t: number): Rgb => ({
  r: from.r + (to.r - from.r) * t,
  g: from.g + (to.g - from.g) * t,
  b: from.b + (to.b - from.b) * t,
})

const rgbString = (color: Rgb, alpha = 1) =>
  `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`

export function BackgroundStage({ activeScene }: BackgroundStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sceneRef = useRef<LandingScene>(activeScene)

  useEffect(() => {
    sceneRef.current = activeScene
  }, [activeScene])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const sceneEntries = Object.entries(brand.scenes) as Array<[LandingScene, (typeof brand.scenes)[LandingScene]]>
    const sceneOrder = sceneEntries.map(([scene]) => scene)
    const sceneLookup = new Map(sceneEntries)

    const stars: Star[] = []
    const glyphs: Glyph[] = []

    const state = {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: 1,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      mobile: window.innerWidth < 900,
      time: 0,
      scrollProgress: 0,
      sceneIndex: 0,
      targetSceneIndex: 0,
      running: true,
      colors: {
        top: hexToRgb(brand.scenes.hero.top),
        bottom: hexToRgb(brand.scenes.hero.bottom),
        accentA: hexToRgb(brand.scenes.hero.accentA),
        accentB: hexToRgb(brand.scenes.hero.accentB),
      },
    }

    const pointer = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      velocity: 0,
    }

    const resize = () => {
      state.width = window.innerWidth
      state.height = window.innerHeight
      state.mobile = state.width < 900
      state.dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(state.width * state.dpr)
      canvas.height = Math.floor(state.height * state.dpr)
      canvas.style.width = `${state.width}px`
      canvas.style.height = `${state.height}px`

      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)

      const starCount = state.mobile ? 90 : 190
      const glyphCount = state.mobile ? 45 : 120

      stars.length = 0
      glyphs.length = 0

      for (let i = 0; i < starCount; i += 1) {
        stars.push({
          x: Math.random() * state.width,
          y: Math.random() * state.height,
          z: 0.35 + Math.random() * 1.8,
          size: 0.5 + Math.random() * 1.8,
          drift: (Math.random() - 0.5) * 0.25,
        })
      }

      for (let i = 0; i < glyphCount; i += 1) {
        glyphs.push({
          x: Math.random() * state.width,
          y: Math.random() * state.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          alpha: 0.05 + Math.random() * 0.35,
          char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          size: state.mobile ? 10 + Math.random() * 2 : 10 + Math.random() * 4,
        })
      }
    }

    const updateTargetScene = () => {
      const index = sceneOrder.indexOf(sceneRef.current)
      state.targetSceneIndex = index < 0 ? 0 : index
    }

    const updateScroll = () => {
      const maxScrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      state.scrollProgress = clamp(window.scrollY / maxScrollable, 0, 1)
    }

    const updatePointer = () => {
      if (!window.__vectorPointer) return
      pointer.x = window.__vectorPointer.x
      pointer.y = window.__vectorPointer.y
      pointer.velocity = window.__vectorPointer.velocity
    }

    const drawNebula = () => {
      const nTime = state.time * 0.00008
      const radiusBoost = 120 + pointer.velocity * 40
      const centerA = {
        x: state.width * (0.2 + Math.sin(nTime * 1.2) * 0.07) + (pointer.x - state.width * 0.5) * 0.03,
        y: state.height * (0.26 + Math.cos(nTime * 0.9) * 0.08),
      }
      const centerB = {
        x: state.width * (0.75 + Math.sin(nTime * 0.7) * 0.08) - (pointer.x - state.width * 0.5) * 0.04,
        y: state.height * (0.64 + Math.cos(nTime * 1.1) * 0.06),
      }

      const gA = ctx.createRadialGradient(centerA.x, centerA.y, 0, centerA.x, centerA.y, state.width * 0.46 + radiusBoost)
      gA.addColorStop(0, rgbString(state.colors.accentA, 0.24))
      gA.addColorStop(1, rgbString(state.colors.accentA, 0))
      ctx.fillStyle = gA
      ctx.fillRect(0, 0, state.width, state.height)

      const gB = ctx.createRadialGradient(centerB.x, centerB.y, 0, centerB.x, centerB.y, state.width * 0.42 + radiusBoost)
      gB.addColorStop(0, rgbString(state.colors.accentB, 0.2))
      gB.addColorStop(1, rgbString(state.colors.accentB, 0))
      ctx.fillStyle = gB
      ctx.fillRect(0, 0, state.width, state.height)
    }

    const drawStars = () => {
      for (const star of stars) {
        const dx = pointer.x - star.x
        const dy = pointer.y - star.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const pull = Math.max(0, 1 - dist / 320)

        const swirlAngle = Math.atan2(dy, dx) + Math.PI / 2
        star.x += star.drift * star.z + Math.cos(swirlAngle) * pull * 0.22 * star.z
        star.y += Math.sin(state.time * 0.0001 + star.z) * 0.12 + Math.sin(swirlAngle) * pull * 0.22 * star.z

        if (star.x < -20) star.x = state.width + 20
        if (star.x > state.width + 20) star.x = -20
        if (star.y < -20) star.y = state.height + 20
        if (star.y > state.height + 20) star.y = -20

        const twinkle = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(state.time * 0.0015 + star.z * 4))
        const alpha = clamp(0.18 + twinkle * 0.75, 0, 1)
        ctx.fillStyle = rgbString(state.colors.accentA, alpha)
        ctx.fillRect(star.x, star.y, star.size, star.size)
      }
    }

    const drawGlyphs = () => {
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      for (const glyph of glyphs) {
        const dx = pointer.x - glyph.x
        const dy = pointer.y - glyph.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const influence = clamp(1 - dist / 280, 0, 1)

        const tangent = Math.atan2(dy, dx) + Math.PI / 2
        glyph.x += glyph.vx + Math.cos(tangent) * influence * 0.35
        glyph.y += glyph.vy + Math.sin(tangent) * influence * 0.35

        glyph.x += Math.sin(state.time * 0.00035 + glyph.y * 0.01) * 0.05
        glyph.y += Math.cos(state.time * 0.00025 + glyph.x * 0.01) * 0.05

        if (glyph.x < -30) glyph.x = state.width + 30
        if (glyph.x > state.width + 30) glyph.x = -30
        if (glyph.y < -30) glyph.y = state.height + 30
        if (glyph.y > state.height + 30) glyph.y = -30

        ctx.font = `${glyph.size}px var(--font-mono), monospace`
        ctx.fillStyle = rgbString(state.colors.accentB, glyph.alpha * (state.mobile ? 0.45 : 0.6))
        ctx.fillText(glyph.char, glyph.x, glyph.y)
      }
    }

    const render = () => {
      const targetScene = sceneOrder[state.targetSceneIndex] ?? "hero"
      const sceneData = sceneLookup.get(targetScene) ?? brand.scenes.hero

      state.sceneIndex += (state.targetSceneIndex - state.sceneIndex) * 0.04

      state.colors.top = mixRgb(state.colors.top, hexToRgb(sceneData.top), 0.03)
      state.colors.bottom = mixRgb(state.colors.bottom, hexToRgb(sceneData.bottom), 0.03)
      state.colors.accentA = mixRgb(state.colors.accentA, hexToRgb(sceneData.accentA), 0.03)
      state.colors.accentB = mixRgb(state.colors.accentB, hexToRgb(sceneData.accentB), 0.03)

      const gradient = ctx.createLinearGradient(0, 0, 0, state.height)
      gradient.addColorStop(0, rgbString(state.colors.top))
      gradient.addColorStop(1, rgbString(state.colors.bottom))
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, state.width, state.height)

      drawNebula()
      drawStars()
      drawGlyphs()

      const horizon = 0.22 + state.scrollProgress * 0.55
      const overlay = ctx.createLinearGradient(0, state.height * horizon, 0, state.height)
      overlay.addColorStop(0, "rgba(0,0,0,0)")
      overlay.addColorStop(1, "rgba(1,4,10,0.65)")
      ctx.fillStyle = overlay
      ctx.fillRect(0, 0, state.width, state.height)
    }

    let rafId = 0
    const animate = (time: number) => {
      if (!state.running) return

      state.time = time
      updateTargetScene()
      updatePointer()

      if (!state.reducedMotion) {
        render()
      } else {
        render()
      }

      rafId = window.requestAnimationFrame(animate)
    }

    const onVisibilityChange = () => {
      state.running = !document.hidden
      if (state.running) {
        rafId = window.requestAnimationFrame(animate)
      } else {
        window.cancelAnimationFrame(rafId)
      }
    }

    resize()
    updateScroll()
    updateTargetScene()

    window.addEventListener("resize", resize)
    window.addEventListener("scroll", updateScroll, { passive: true })
    document.addEventListener("visibilitychange", onVisibilityChange)
    rafId = window.requestAnimationFrame(animate)

    return () => {
      state.running = false
      window.cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("scroll", updateScroll)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  return (
    <div className="background-stage" aria-hidden>
      <canvas ref={canvasRef} className="background-stage-canvas" />
      <div className="background-stage-scanlines" />
      <div className="background-stage-grain" />
      <div className="background-stage-vignette" />
    </div>
  )
}
