"use client"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  variant?: "full" | "icon"
  size?: "sm" | "md" | "lg"
  className?: string
}

/**
 * VECTOR - Performance OS
 * 
 * Logo Concept: Vector Rings
 * - 3 thermal arcs (rings) representing Brain, Build, Body
 * - Sharp upward vector arrow cutting through center
 * - Looks crisp at 16-64px
 * 
 * Style:
 * - Light: Crisp slate with subtle thermal gradient accent
 * - Dark: Neon cyan with thermal glow
 */
export function BrandLogo({ variant = "full", size = "md", className }: BrandLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-sm", gap: "gap-2" },
    md: { icon: 28, text: "text-base", gap: "gap-2.5" },
    lg: { icon: 36, text: "text-lg", gap: "gap-3" },
  }

  const s = sizes[size]

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      {/* Icon: Vector Rings + Arrow */}
      <VectorIcon size={s.icon} />
      
      {/* Wordmark */}
      {variant === "full" && (
        <span
          className={cn(
            s.text,
            "font-semibold tracking-tight text-foreground"
          )}
        >
          Vector
        </span>
      )}
    </div>
  )
}

interface VectorIconProps {
  size?: number
  className?: string
}

export function VectorIcon({ size = 28, className }: VectorIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      {/* Background circle - subtle */}
      <circle
        cx="16"
        cy="16"
        r="14"
        className="fill-foreground/5 dark:fill-primary/10"
      />
      
      {/* Thermal rings - 3 arcs */}
      {/* Brain ring (blue) - top arc */}
      <path
        d="M 8 16 A 8 8 0 0 1 16 8"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-ring-brain dark:stroke-ring-brain"
      />
      
      {/* Build ring (amber) - right arc */}
      <path
        d="M 16 8 A 8 8 0 0 1 24 16"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-ring-build dark:stroke-ring-build"
      />
      
      {/* Body ring (red) - bottom arc */}
      <path
        d="M 24 16 A 8 8 0 0 1 16 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-ring-body dark:stroke-ring-body"
      />
      
      {/* Recovery ring (green) - left arc */}
      <path
        d="M 16 24 A 8 8 0 0 1 8 16"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-ring-recovery dark:stroke-ring-recovery"
      />
      
      {/* Vector arrow - cutting through center, pointing up-right */}
      <path
        d="M 12 20 L 20 12 M 20 12 L 15 12 M 20 12 L 20 17"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-foreground dark:stroke-primary"
      />
    </svg>
  )
}

/**
 * Alternative Logo Concepts (for reference):
 * 
 * B) Monogram: "VT" with integrated ring + forward motion notch
 * C) Pure Symbol: Abstract peak/pulse glyph with vector trajectory
 * 
 * The Vector Rings concept was chosen because:
 * 1. Directly represents the 4-ring system (Brain, Build, Body, Recovery)
 * 2. Arrow conveys direction, speed, growth
 * 3. Works at small sizes (16-64px)
 * 4. Distinct from generic productivity app icons
 */
