"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { brand } from "@/lib/brand"
import { MagneticButton } from "@/components/sections/MagneticButton"

const links = [
  { href: "#system", label: "Product" },
  { href: "#system", label: "System" },
  { href: "#screens", label: "Screens" },
  { href: "#prime-score", label: "Prime Score" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const

export function SiteNavbar() {
  return (
    <motion.header
      className="site-navbar"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="landing-container navbar-inner">
        <Link href="#hero" className="navbar-logo font-display">
          {brand.productName}
        </Link>

        <nav aria-label="Main" className="navbar-links">
          {links.map((item) => (
            <Link key={item.href + item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <MagneticButton href={brand.routes.login} className="navbar-cta">
          Get Started
        </MagneticButton>
      </div>
    </motion.header>
  )
}
