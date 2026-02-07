"use client"

import { motion } from "framer-motion"

const faqs = [
  {
    q: "How is Prime Score calculated?",
    a: "Prime Score is a weighted blend of Output, Focus, and Recovery, then adjusted by execution quality rules.",
  },
  {
    q: "Do I own my data?",
    a: "Yes. Your logs remain exportable at any time. You can run local-first or sync to your own cloud stack.",
  },
  {
    q: "Can I use Vector only with email login?",
    a: "Yes. Vector supports Google sign-in and email-code authentication.",
  },
  {
    q: "Is this built for teams or individuals?",
    a: "The workflow starts solo-first and scales naturally to coaching and team contexts.",
  },
] as const

export function FaqSection() {
  return (
    <section id="faq" data-scene="faq" className="landing-section faq-section">
      <div className="landing-container">
        <p className="section-kicker">FAQ</p>
        <h2 className="section-title font-display">Clear model. No black box behavior.</h2>

        <div className="faq-list">
          {faqs.map((item, index) => (
            <motion.details
              key={item.q}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="faq-item"
            >
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  )
}
