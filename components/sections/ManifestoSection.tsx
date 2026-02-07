"use client"

import { motion } from "framer-motion"

export function ManifestoSection() {
  return (
    <section data-scene="prime" className="landing-section manifesto-section">
      <div className="landing-container manifesto-shell">
        <motion.p
          className="section-kicker"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
        >
          Why this exists
        </motion.p>
        <motion.blockquote
          className="manifesto-copy font-display"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          "Most dashboards report noise. Vector is built to reduce decision fatigue: one score, four domains,
          and a repeatable system you can trust on low-energy days."
        </motion.blockquote>
      </div>
    </section>
  )
}
