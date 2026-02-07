"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ScreenType } from "@/app/app/page"

export type TourStep = {
  id: string
  title: string
  description: string
  selector: string
  screen?: ScreenType
}

interface OnboardingTourProps {
  open: boolean
  steps: TourStep[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onClose: () => void
  onNavigate?: (screen: ScreenType) => void
}

export function OnboardingTour({
  open,
  steps,
  currentIndex,
  onIndexChange,
  onClose,
  onNavigate,
}: OnboardingTourProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom")
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 180 })

  const step = steps[currentIndex]

  useEffect(() => {
    if (!open || !step) return
    if (step.screen && onNavigate) {
      onNavigate(step.screen)
    }
  }, [open, step, onNavigate])

  useEffect(() => {
    if (!open || !step) return

    const update = () => {
      const target = document.querySelector(step.selector)
      if (target) {
        const nextRect = target.getBoundingClientRect()
        const isValid = nextRect.width > 120 && nextRect.height > 40
        if (isValid) {
          setRect(nextRect)
          setPlacement(nextRect.top > window.innerHeight * 0.4 ? "top" : "bottom")
          return true
        }
        setRect(null)
        return false
      } else {
        setRect(null)
        return false
      }
    }

    const raf = requestAnimationFrame(update)
    const interval = window.setInterval(() => {
      if (update()) {
        clearInterval(interval)
      }
    }, 300)
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(interval)
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [open, step])

  useEffect(() => {
    if (!open) return
    const updateSize = () => {
      if (tooltipRef.current) {
        const rect = tooltipRef.current.getBoundingClientRect()
        setTooltipSize({ width: rect.width, height: rect.height })
      }
    }
    const raf = requestAnimationFrame(updateSize)
    window.addEventListener("resize", updateSize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", updateSize)
    }
  }, [open, step])

  const highlightStyle = useMemo(() => {
    if (!rect) return { width: 0, height: 0, top: 0, left: 0 }
    const padding = 10
    return {
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      top: rect.top - padding,
      left: rect.left - padding,
    }
  }, [rect])

  const tooltipStyle = useMemo(() => {
    const margin = 16
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    if (!rect) {
      return {
        top: Math.max(margin, viewportHeight / 2 - tooltipSize.height / 2),
        left: Math.max(margin, viewportWidth / 2 - tooltipSize.width / 2),
      }
    }
    const gap = 16
    const preferredTop =
      placement === "top" ? rect.top - gap - tooltipSize.height : rect.bottom + gap
    const clampedTop = Math.min(
      Math.max(margin, preferredTop),
      viewportHeight - tooltipSize.height - margin,
    )
    const preferredLeft = rect.left + rect.width / 2 - tooltipSize.width / 2
    const clampedLeft = Math.min(
      Math.max(margin, preferredLeft),
      viewportWidth - tooltipSize.width - margin,
    )
    return {
      top: clampedTop,
      left: clampedLeft,
    }
  }, [rect, placement, tooltipSize.height, tooltipSize.width])

  if (!open || !step) return null

  return (
    <>
      <div ref={overlayRef} className="fixed inset-0 z-40 pointer-events-none">
        {!rect && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
        )}
        {rect && (
          <>
            <div
              className="fixed left-0 top-0 w-full bg-black/65 backdrop-blur-sm"
              style={{ height: Math.max(0, highlightStyle.top) }}
            />
            <div
              className="fixed left-0 bg-black/65 backdrop-blur-sm"
              style={{
                top: highlightStyle.top,
                width: Math.max(0, highlightStyle.left),
                height: highlightStyle.height,
              }}
            />
            <div
              className="fixed bg-black/65 backdrop-blur-sm"
              style={{
                top: highlightStyle.top,
                left: highlightStyle.left + highlightStyle.width,
                width: Math.max(0, window.innerWidth - (highlightStyle.left + highlightStyle.width)),
                height: highlightStyle.height,
              }}
            />
            <div
              className="fixed left-0 bg-black/65 backdrop-blur-sm"
              style={{
                top: highlightStyle.top + highlightStyle.height,
                width: window.innerWidth,
                height: Math.max(0, window.innerHeight - (highlightStyle.top + highlightStyle.height)),
              }}
            />
          </>
        )}
        {rect && (
          <div
            className="tour-spotlight"
            style={{
              top: highlightStyle.top,
              left: highlightStyle.left,
              width: highlightStyle.width,
              height: highlightStyle.height,
            }}
          >
            <div className="tour-pulse" />
          </div>
        )}
      </div>

      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-60 w-[320px] rounded-xl border border-border/50 bg-card/95 p-4 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
        )}
        style={tooltipStyle}
      >
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </div>
        <div className="mt-2 text-base font-semibold text-foreground">{step.title}</div>
        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
        {!rect && (
          <p className="mt-2 text-xs text-muted-foreground">Loading highlight…</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Skip
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              Back
            </Button>
            {currentIndex < steps.length - 1 ? (
              <Button size="sm" onClick={() => onIndexChange(currentIndex + 1)}>
                Next
              </Button>
            ) : (
              <Button size="sm" onClick={onClose}>
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
