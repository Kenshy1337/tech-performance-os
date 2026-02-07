"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"

type ChartPoint = {
  x: number
  y: number
  score: number
  label: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function PrimeScoreDemoSection() {
  const [focus, setFocus] = useState(72)
  const [output, setOutput] = useState(66)
  const [recovery, setRecovery] = useState(70)
  const [sleep, setSleep] = useState(7.4)

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const score = useMemo(() => {
    const sleepRatio = clamp(sleep / 8, 0, 1.2)
    const adjustedRecovery = clamp(recovery * 0.65 + sleepRatio * 35, 0, 120)
    const result = output * 0.4 + focus * 0.3 + adjustedRecovery * 0.3
    return Math.round(clamp(result, 0, 120))
  }, [focus, output, recovery, sleep])

  const chart = useMemo(() => {
    const width = 700
    const height = 220
    const padTop = 22
    const padBottom = 30
    const padX = 20
    const minScore = 30
    const maxScore = 120
    const range = maxScore - minScore
    const count = 22

    const points: ChartPoint[] = Array.from({ length: count }, (_, index) => {
      const t = index / (count - 1)
      const waveA = Math.sin(index * 0.44 + focus * 0.01) * 8
      const waveB = Math.cos(index * 0.21 + output * 0.01) * 5
      const trend = (score - 58) * 0.3
      const localScore = clamp(58 + trend + waveA + waveB + t * 20, minScore, maxScore)
      const yNorm = (localScore - minScore) / range
      return {
        x: padX + t * (width - padX * 2),
        y: height - padBottom - yNorm * (height - padTop - padBottom),
        score: Math.round(localScore),
        label: `Day ${index + 1}`,
      }
    })

    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ")

    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(height - padBottom).toFixed(2)} L ${points[0].x.toFixed(2)} ${(height - padBottom).toFixed(2)} Z`

    return { width, height, padBottom, points, linePath, areaPath }
  }, [focus, output, recovery, sleep, score])

  const activeIndex = hoveredIndex ?? chart.points.length - 1
  const activePoint = chart.points[activeIndex]

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left

    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    chart.points.forEach((point, index) => {
      const normalizedX = (point.x / chart.width) * rect.width
      const distance = Math.abs(normalizedX - x)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    setHoveredIndex(nearestIndex)
  }

  return (
    <section id="prime-score" data-scene="prime" className="landing-section prime-section">
      <div className="landing-container prime-layout">
        <div>
          <p className="section-kicker">Prime Score</p>
          <h2 className="section-title font-display">A single signal. Deterministic and explainable.</h2>
          <p className="section-copy">
            Tune inputs and immediately see how quality and output shift your score trajectory.
          </p>
        </div>

        <motion.div
          className="prime-simulator"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="prime-score-head">
            <div>
              <p>Computed Prime Score</p>
              <h3>{score}</h3>
            </div>
            <span className="prime-score-pill">Live model</span>
          </div>

          <div className="prime-slider-grid">
            <Slider label="Focus" value={focus} min={0} max={100} step={1} onChange={setFocus} />
            <Slider label="Output" value={output} min={0} max={120} step={1} onChange={setOutput} />
            <Slider label="Recovery" value={recovery} min={0} max={100} step={1} onChange={setRecovery} />
            <Slider label="Sleep" value={sleep} min={4} max={10} step={0.1} suffix="h" onChange={setSleep} />
          </div>

          <div className="prime-chart-shell" aria-label="Prime Score trend preview">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="prime-chart"
              role="img"
              aria-label="Prime Score trend line chart"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="primeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgba(44,208,239,0.32)" />
                  <stop offset="1" stopColor="rgba(44,208,239,0.02)" />
                </linearGradient>
                <linearGradient id="primeLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop stopColor="#25cfed" offset="0" />
                  <stop stopColor="#8ba4ff" offset="0.55" />
                  <stop stopColor="#ffb38a" offset="1" />
                </linearGradient>
              </defs>

              <line
                x1={activePoint.x}
                y1={14}
                x2={activePoint.x}
                y2={chart.height - chart.padBottom + 2}
                className="prime-chart-crosshair"
              />

              <path d={chart.areaPath} fill="url(#primeAreaGradient)" />
              <path d={chart.linePath} fill="none" stroke="url(#primeLineGradient)" strokeWidth="3" strokeLinecap="round" />

              <circle cx={activePoint.x} cy={activePoint.y} r={6} className="prime-chart-point-glow" />
              <circle cx={activePoint.x} cy={activePoint.y} r={4.4} className="prime-chart-point-core" />
            </svg>

            <div
              className="prime-chart-tooltip"
              style={{
                left: `${(activePoint.x / chart.width) * 100}%`,
                top: `${(activePoint.y / chart.height) * 100}%`,
              }}
            >
              <span>{activePoint.label}</span>
              <strong>{activePoint.score}</strong>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
}

function Slider({ label, value, min, max, step, suffix, onChange }: SliderProps) {
  return (
    <label className="prime-slider-row">
      <span>{label}</span>
      <strong>
        {value}
        {suffix ?? ""}
      </strong>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
