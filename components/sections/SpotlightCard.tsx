"use client"

import type { CSSProperties, ReactNode } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"

type SpotlightCardProps = {
  children: ReactNode
  className?: string
}

export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const [hovered, setHovered] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  return (
    <article
      className={cn("spotlight-card", hovered && "is-hovered", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setCoords({ x: event.clientX - rect.left, y: event.clientY - rect.top })
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ "--sx": `${coords.x}px`, "--sy": `${coords.y}px` } as CSSProperties}
    >
      {children}
    </article>
  )
}
