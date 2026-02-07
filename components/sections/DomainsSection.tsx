"use client"

import { BrainCog, Hammer, Dumbbell, MoonStar } from "lucide-react"
import { brand } from "@/lib/brand"
import { SpotlightCard } from "@/components/sections/SpotlightCard"
import { SectionReveal } from "@/components/sections/SectionReveal"

const domainIcons = {
  brain: BrainCog,
  build: Hammer,
  body: Dumbbell,
  recovery: MoonStar,
}

export function DomainsSection() {
  return (
    <section id="system" data-scene="domains" className="landing-section domains-section">
      <div className="landing-container">
        <SectionReveal>
          <p className="section-kicker">The System</p>
          <h2 className="section-title font-display">Four domains. One rhythm.</h2>
          <p className="section-copy">
            Vector keeps the operating model minimal: one score, four inputs, and a clear feedback loop.
          </p>
        </SectionReveal>

        <div className="domains-grid">
          {brand.domains.map((domain, index) => {
            const Icon = domainIcons[domain.id]
            return (
              <SectionReveal key={domain.id} delay={0.08 * index}>
                <SpotlightCard className="domain-card">
                  <div className="domain-icon" style={{ color: domain.accent }}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="domain-title font-display">{domain.label}</h3>
                  <p className="domain-description">{domain.description}</p>
                  <div className="domain-accent-line" style={{ backgroundColor: domain.accent }} />
                </SpotlightCard>
              </SectionReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
