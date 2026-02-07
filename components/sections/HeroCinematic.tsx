"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ArrowDownRight } from "lucide-react"
import { brand } from "@/lib/brand"
import { MagneticButton } from "@/components/sections/MagneticButton"
import { SectionReveal } from "@/components/sections/SectionReveal"
import { HeroGravityWord } from "@/components/sections/HeroGravityWord"

export function HeroCinematic() {
  return (
    <section id="hero" data-scene="hero" className="landing-section hero-section">
      <HeroGravityWord text="VECTOR" />

      <div className="landing-container hero-content">
        <SectionReveal>
          <div className="hero-badge">
            <Sparkles className="size-4" aria-hidden />
            <span>{brand.badge}</span>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.06}>
          <h1 className="hero-title font-display">
            {brand.headline}
          </h1>
        </SectionReveal>

        <SectionReveal delay={0.12}>
          <p className="hero-copy">
            {brand.tagline}
          </p>
        </SectionReveal>

        <SectionReveal delay={0.18} className="hero-actions">
          <MagneticButton href={brand.routes.login}>
            Get Started
          </MagneticButton>
          <Link href="#screens" className="hero-inline-link">
            See Screens
          </Link>
        </SectionReveal>

        <SectionReveal delay={0.24}>
          <div className="hero-metrics">
            <div className="hero-metric">
              <span className="hero-metric-label">Prime Score</span>
              <span className="hero-metric-value">0-120</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-label">Domains</span>
              <span className="hero-metric-value">4 Core Loops</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-label">Signal</span>
              <span className="hero-metric-value">Daily + Weekly</span>
            </div>
          </div>
        </SectionReveal>

        <motion.div
          className="hero-scroll-cue"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Link href="#system" className="hero-scroll-link">
            Explore System
            <ArrowDownRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
