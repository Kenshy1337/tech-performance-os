"use client"

import Image from "next/image"
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { screenStory } from "@/lib/brand"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function ScreensStorySection() {
  const containerRef = useRef<HTMLElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [imageSrc, setImageSrc] = useState<string>(screenStory[0].image)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = clamp(Math.floor(value * screenStory.length), 0, screenStory.length - 1)
    setActiveIndex(next)
  })

  useEffect(() => {
    setImageSrc(screenStory[activeIndex].image)
  }, [activeIndex])

  const rotateX = useSpring(0, { stiffness: 240, damping: 24 })
  const rotateY = useSpring(0, { stiffness: 240, damping: 24 })

  return (
    <section id="screens" data-scene="screens" className="landing-section screens-section" ref={containerRef}>
      <div className="landing-container screens-layout">
        <div className="screens-copy-column">
          <p className="section-kicker">Product Proof</p>
          <h2 className="section-title font-display">Every screen is built around action speed.</h2>
          <p className="section-copy">
            Today, Week, History, and Achievements are designed as one operating loop, not isolated dashboards.
          </p>

          <ol className="screens-steps" aria-label="Product flow">
            {screenStory.map((step, index) => (
              <li
                key={step.key}
                className={index === activeIndex ? "is-active" : ""}
              >
                <button
                  type="button"
                  className="screen-step-trigger"
                  onClick={() => setActiveIndex(index)}
                >
                  <span className="screen-step-index">0{index + 1}</span>
                  <span className="screen-step-text">
                    <strong>{step.title}</strong>
                    <small>{step.subtitle}</small>
                  </span>
                </button>
                <p className="screen-step-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="screens-frame-column">
          <motion.div
            className="screens-frame-sticky"
            style={{ rotateX, rotateY }}
            onPointerMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              const offsetX = (event.clientX - rect.left) / rect.width - 0.5
              const offsetY = (event.clientY - rect.top) / rect.height - 0.5
              rotateX.set(clamp(-offsetY * 6, -5, 5))
              rotateY.set(clamp(offsetX * 7, -6, 6))
            }}
            onPointerLeave={() => {
              rotateX.set(0)
              rotateY.set(0)
            }}
          >
            <div className="screens-frame-glow" />
            <motion.div
              key={screenStory[activeIndex].key}
              className="screens-frame-image-shell"
              initial={{ opacity: 0, y: 20, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={imageSrc}
                alt={`${screenStory[activeIndex].title} screenshot`}
                width={1200}
                height={760}
                className="screens-image"
                priority
                onError={() => setImageSrc("/placeholder.jpg")}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
