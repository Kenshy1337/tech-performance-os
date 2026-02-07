"use client"

import { motion, type Variants } from "framer-motion"
import type { ReactNode } from "react"

type SectionRevealProps = {
  children: ReactNode
  delay?: number
  className?: string
}

const variants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function SectionReveal({ children, delay = 0, className }: SectionRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
