"use client"

import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { useMemo } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type MagneticButtonProps = {
  href: string
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary"
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function MagneticButton({ href, children, className, variant = "primary" }: MagneticButtonProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.5 })

  const baseClass = useMemo(
    () =>
      variant === "primary"
        ? "magnetic-btn magnetic-btn-primary"
        : "magnetic-btn magnetic-btn-secondary",
    [variant],
  )

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const localX = event.clientX - (rect.left + rect.width / 2)
        const localY = event.clientY - (rect.top + rect.height / 2)
        x.set(clamp(localX * 0.18, -14, 14))
        y.set(clamp(localY * 0.18, -14, 14))
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      <Link href={href} className={cn(baseClass, className)}>
        {children}
      </Link>
    </motion.div>
  )
}
