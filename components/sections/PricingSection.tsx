"use client"

import { Check } from "lucide-react"
import { MagneticButton } from "@/components/sections/MagneticButton"

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    highlighted: false,
    features: ["Today + Week tracking", "Prime Score engine", "Local history"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    highlighted: true,
    features: ["Everything in Starter", "Achievement depth", "Cloud sync + backups", "Team-ready analytics"],
  },
  {
    name: "Elite",
    price: "$49",
    period: "/month",
    highlighted: false,
    features: ["Everything in Pro", "Advanced automations", "Priority roadmap input"],
  },
] as const

export function PricingSection() {
  return (
    <section id="pricing" data-scene="pricing" className="landing-section pricing-section">
      <div className="landing-container">
        <p className="section-kicker">Pricing</p>
        <h2 className="section-title font-display">Built to scale from solo focus to serious systems.</h2>

        <div className="pricing-grid">
          {tiers.map((tier) => (
            <article key={tier.name} className={`pricing-card ${tier.highlighted ? "is-highlighted" : ""}`}>
              <header>
                <p className="pricing-name">{tier.name}</p>
                <h3>
                  {tier.price}
                  <span>{tier.period}</span>
                </h3>
              </header>

              <ul>
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <Check className="size-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <MagneticButton href="/login" variant={tier.highlighted ? "primary" : "secondary"}>
                Get Started
              </MagneticButton>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
