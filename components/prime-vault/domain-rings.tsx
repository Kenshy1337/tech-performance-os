"use client"

import { cn } from "@/lib/utils"
import { Moon, Droplets, Leaf, Brain, Ship, Dumbbell, Heart } from "lucide-react"

interface DomainRing {
  current: number
  target: number
}

interface RecoveryData {
  score: number // Composite 0-100
  sleep: { current: number; target: number }
  meditation?: number
  other?: number
}

interface DomainRingsProps {
  rings: {
    brain: DomainRing
    build: DomainRing
    body: DomainRing
    recovery: RecoveryData
  }
  domainScores: {
    brain: number
    build: number
    body: number
    recovery: number
  }
  className?: string
}

const domainConfig = {
  brain: {
    label: "Brain",
    icon: Brain,
    colorVar: "--ring-brain",
    lightColor: "#2563eb",
    darkColor: "#60a5fa",
    unit: "min",
    description: "Learning & deep work",
  },
  build: {
    label: "Build",
    icon: Ship,
    colorVar: "--ring-build",
    lightColor: "#d97706",
    darkColor: "#fbbf24",
    unit: "min",
    description: "Ship something tangible",
    isPrimary: true,
  },
  body: {
    label: "Body",
    icon: Dumbbell,
    colorVar: "--ring-body",
    lightColor: "#dc2626",
    darkColor: "#f87171",
    unit: "min",
    description: "Exercise & movement",
  },
  recovery: {
    label: "Recovery",
    icon: Heart,
    colorVar: "--ring-recovery",
    lightColor: "#059669",
    darkColor: "#4ade80",
    unit: "%",
    description: "Sleep & rest",
  },
}

export function DomainRings({
  rings,
  domainScores,
  className,
}: DomainRingsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Rings Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {/* Brain Ring */}
        <RingCard
          key="brain"
          label="Brain"
          percent={domainScores.brain}
          remaining={`${Math.max(0, rings.brain.target - rings.brain.current)}m left`}
          config={domainConfig.brain}
        />

        {/* Build Ring (Primary) */}
        <RingCard
          key="build"
          label="Build"
          percent={domainScores.build}
          remaining={`${Math.max(0, rings.build.target - rings.build.current)}m left`}
          config={domainConfig.build}
          isPrimary
        />

        {/* Body Ring */}
        <RingCard
          key="body"
          label="Body"
          percent={domainScores.body}
          remaining={`${Math.max(0, rings.body.target - rings.body.current)}m left`}
          config={domainConfig.body}
        />

        {/* Recovery Ring (Composite Score) */}
        <RecoveryRingCard
          percent={domainScores.recovery}
          sleep={rings.recovery.sleep}
          meditation={rings.recovery.meditation}
          config={domainConfig.recovery}
        />
      </div>
    </div>
  )
}

interface RingCardProps {
  label: string
  percent: number
  remaining: string
  config: (typeof domainConfig)[keyof typeof domainConfig]
  isPrimary?: boolean
}

function RingCard({
  label,
  percent,
  remaining,
  config,
  isPrimary,
}: RingCardProps) {
  const isComplete = percent >= 100
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200",
        isPrimary
          ? "border-amber-500/30 bg-amber-500/5 dark:border-amber-400/20 dark:bg-amber-400/5"
          : "card-premium"
      )}
    >
      {/* Ring SVG */}
      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className={cn("size-16 -rotate-90 lg:size-20", isPrimary && "size-20 lg:size-24")}
        >
          <defs>
            <linearGradient
              id={`gradient-${label}-light`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={config.lightColor} />
              <stop offset="100%" stopColor={config.lightColor} stopOpacity={0.8} />
            </linearGradient>
            <linearGradient
              id={`gradient-${label}-dark`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={config.darkColor} />
              <stop offset="100%" stopColor={config.darkColor} stopOpacity={0.7} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth={isPrimary ? 9 : 7}
            className="text-muted/30 dark:text-muted/20"
          />

          {/* Progress arc - light mode */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            className="ring-stroke dark:hidden"
            stroke={`url(#gradient-${label}-light)`}
            strokeWidth={isPrimary ? 9 : 7}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(percent, 100) / 100)}
          />

          {/* Progress arc - dark mode with glow */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            className="ring-stroke ring-glow hidden dark:block"
            stroke={`url(#gradient-${label}-dark)`}
            strokeWidth={isPrimary ? 9 : 7}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(percent, 100) / 100)}
            style={{ color: config.darkColor }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-semibold tabular-nums text-foreground",
              isPrimary ? "text-xl lg:text-2xl" : "text-lg lg:text-xl"
            )}
          >
            {Math.round(percent)}%
          </span>
        </div>
      </div>

      {/* Label and remaining */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <Icon
            className={cn("size-3.5", isPrimary ? "size-4" : "")}
            style={{ color: `var(${config.colorVar})` }}
          />
          <span
            className={cn(
              "text-sm font-medium",
              isPrimary
                ? "text-amber-700 dark:text-amber-400"
                : "text-foreground"
            )}
          >
            {label}
          </span>
        </div>
        {!isComplete && (
          <span className="text-[11px] text-muted-foreground">{remaining}</span>
        )}
        {isComplete && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Complete
          </span>
        )}
      </div>
    </div>
  )
}

interface RecoveryRingCardProps {
  percent: number
  sleep: { current: number; target: number }
  meditation?: number
  config: (typeof domainConfig)["recovery"]
}

function RecoveryRingCard({
  percent,
  sleep,
  meditation,
  config,
}: RecoveryRingCardProps) {
  const isComplete = percent >= 100

  return (
    <div className="card-premium flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200">
      {/* Ring SVG */}
      <div className="relative">
        <svg viewBox="0 0 100 100" className="size-16 -rotate-90 lg:size-20">
          <defs>
            <linearGradient
              id="gradient-recovery-light"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={config.lightColor} />
              <stop offset="100%" stopColor={config.lightColor} stopOpacity={0.8} />
            </linearGradient>
            <linearGradient
              id="gradient-recovery-dark"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={config.darkColor} />
              <stop offset="100%" stopColor={config.darkColor} stopOpacity={0.7} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            className="text-muted/30 dark:text-muted/20"
          />

          {/* Progress arc - light mode */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            className="ring-stroke dark:hidden"
            stroke="url(#gradient-recovery-light)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(percent, 100) / 100)}
          />

          {/* Progress arc - dark mode with glow */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            className="ring-stroke ring-glow hidden dark:block"
            stroke="url(#gradient-recovery-dark)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(percent, 100) / 100)}
            style={{ color: config.darkColor }}
          />
        </svg>

        {/* Center content - Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums text-foreground lg:text-xl">
            {percent}%
          </span>
        </div>
      </div>

      {/* Label and sub-metrics */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <Heart className="size-3.5" style={{ color: `var(${config.colorVar})` }} />
          <span className="text-sm font-medium text-foreground">Recovery</span>
        </div>
        
        {/* Sleep sub-metric */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Moon className="size-2.5" />
          <span>Sleep</span>
          <span className="font-medium tabular-nums text-foreground">
            {sleep.current}/{sleep.target}h
          </span>
        </div>
        
        {/* Recovery contributors */}
        {(meditation && meditation > 0) && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Leaf className="size-2" />
              {meditation}m
            </span>
            <span className="flex items-center gap-0.5">
              <Droplets className="size-2" />
            </span>
          </div>
        )}
        
        {isComplete && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Well rested
          </span>
        )}
      </div>
    </div>
  )
}
