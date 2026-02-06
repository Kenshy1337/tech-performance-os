"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { format, addDays, subDays } from "date-fns"
import {
  Plus,
  Check,
  Ship,
  ChevronLeft,
  ChevronRight,
  Moon,
  Minus,
  Brain,
  Dumbbell,
  Heart,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useActivityTypes,
  useAddActivityLog,
  useAddDeliverable,
  useTodaySummary,
  useToggleDeliverableDone,
  useUpsertDailyFocus,
  useUpsertDailyRecovery,
} from "@/data/hooks"
import { toDateKey } from "@/data/date"
import { ActivityType, Domain } from "@/data/types"

interface TodayScreenProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

const domainMeta: Record<Domain, { label: string; icon: React.ElementType; color: string }> = {
  brain: {
    label: "Brain",
    icon: Brain,
    color: "#3b82f6",
  },
  build: {
    label: "Build",
    icon: Ship,
    color: "#f59e0b",
  },
  body: {
    label: "Body",
    icon: Dumbbell,
    color: "#ef4444",
  },
  recovery: {
    label: "Recovery",
    icon: Heart,
    color: "#22c55e",
  },
}

const focusLevels = [
  { value: 1, label: "Scattered", multiplier: 0.6, score: 45, description: "Very distracted day" },
  { value: 2, label: "Distracted", multiplier: 0.8, score: 60, description: "Some focus issues" },
  { value: 3, label: "Focused", multiplier: 1.0, score: 75, description: "Normal focus" },
  { value: 4, label: "Deep", multiplier: 1.2, score: 88, description: "High focus sessions" },
  { value: 5, label: "Flow", multiplier: 1.4, score: 100, description: "Peak performance" },
]

const durationPresets = [15, 30, 45, 60, 90, 120]

const scoreToFocusLevel = (score: number) => {
  let closest = focusLevels[0]
  let distance = Math.abs(score - closest.score)
  focusLevels.forEach((level) => {
    const nextDistance = Math.abs(score - level.score)
    if (nextDistance < distance) {
      distance = nextDistance
      closest = level
    }
  })
  return closest.value
}

const parseDrivers = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

export function TodayScreen({ selectedDate, onDateChange }: TodayScreenProps) {
  const dateKey = toDateKey(selectedDate)
  const isToday = dateKey === toDateKey(new Date())

  const { data: summary } = useTodaySummary(dateKey)
  const { data: activityTypes = [] } = useActivityTypes()

  const addActivityLog = useAddActivityLog()
  const addDeliverable = useAddDeliverable()
  const toggleDeliverableDone = useToggleDeliverableDone()
  const upsertDailyFocus = useUpsertDailyFocus()
  const upsertDailyRecovery = useUpsertDailyRecovery()

  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(30)
  const [note, setNote] = useState("")

  const [deliverableTitle, setDeliverableTitle] = useState("")
  const [deliverablePoints, setDeliverablePoints] = useState(3)
  const [deliverableDomain, setDeliverableDomain] = useState<Domain>("build")

  const [focusLevel, setFocusLevel] = useState(3)
  const [deepMinutes, setDeepMinutes] = useState(0)
  const [longestBlockMinutes, setLongestBlockMinutes] = useState(0)
  const [switchesPerHour, setSwitchesPerHour] = useState(0)
  const [focusDrivers, setFocusDrivers] = useState("")
  const [focusDirty, setFocusDirty] = useState(false)

  const [sleepHours, setSleepHours] = useState(7)
  const [energyScore, setEnergyScore] = useState(70)
  const [mood, setMood] = useState<number | undefined>(undefined)
  const [recoveryDrivers, setRecoveryDrivers] = useState("")
  const [recoveryDirty, setRecoveryDirty] = useState(false)

  const focusInitialized = useRef(false)
  const recoveryInitialized = useRef(false)

  useEffect(() => {
    focusInitialized.current = false
    recoveryInitialized.current = false
  }, [dateKey])

  useEffect(() => {
    if (!summary) return
    setFocusLevel(scoreToFocusLevel(summary.focus.focusScore))
    setDeepMinutes(summary.focus.deepMinutes)
    setLongestBlockMinutes(summary.focus.longestBlockMinutes)
    setSwitchesPerHour(summary.focus.switchesPerHour)
    setFocusDrivers(summary.focus.drivers.join(", "))
    setFocusDirty(false)
    focusInitialized.current = true
  }, [summary?.dateKey])

  useEffect(() => {
    if (!summary) return
    setSleepHours(summary.recovery.sleepHours)
    setEnergyScore(summary.recovery.energyScore)
    setMood(summary.recovery.mood)
    setRecoveryDrivers(summary.recovery.recoveryDrivers.join(", "))
    setRecoveryDirty(false)
    recoveryInitialized.current = true
  }, [summary?.dateKey])

  useEffect(() => {
    if (!focusInitialized.current || !focusDirty) return
    const selected = focusLevels.find((level) => level.value === focusLevel) ?? focusLevels[2]
    const timeout = setTimeout(() => {
      upsertDailyFocus.mutate({
        dateKey,
        focusScore: selected.score,
        deepMinutes,
        longestBlockMinutes,
        switchesPerHour,
        drivers: parseDrivers(focusDrivers),
      })
    }, 500)
    return () => clearTimeout(timeout)
  }, [dateKey, focusLevel, deepMinutes, longestBlockMinutes, switchesPerHour, focusDrivers, focusDirty])

  useEffect(() => {
    if (!recoveryInitialized.current || !recoveryDirty) return
    const timeout = setTimeout(() => {
      upsertDailyRecovery.mutate({
        dateKey,
        sleepHours,
        sleepTargetHours: summary?.recovery.sleepTargetHours ?? 8,
        energyScore,
        mood,
        recoveryDrivers: parseDrivers(recoveryDrivers),
      })
    }, 500)
    return () => clearTimeout(timeout)
  }, [dateKey, sleepHours, energyScore, mood, recoveryDrivers, summary?.recovery.sleepTargetHours, recoveryDirty])

  const focusMultiplier = focusLevels.find((level) => level.value === focusLevel)?.multiplier ?? 1
  const focusScore = focusLevels.find((level) => level.value === focusLevel)?.score ?? 75

  const domainScores = {
    brain: summary?.domains.brain.completionDisplay ?? 0,
    build: summary?.domains.build.completionDisplay ?? 0,
    body: summary?.domains.body.completionDisplay ?? 0,
    recovery: summary?.domains.recovery.completionDisplay ?? 0,
  }

  const completion = summary?.completionAverage ?? 0
  const primeScore = summary?.primeScore ?? 0

  const activitiesByDomain = useMemo(() => {
    return activityTypes.reduce(
      (acc, type) => {
        acc[type.domain].push(type)
        return acc
      },
      { brain: [], build: [], body: [], recovery: [] } as Record<Domain, ActivityType[]>,
    )
  }, [activityTypes])

  const deliverables = summary?.deliverables ?? []
  const completedPoints = deliverables
    .filter((item) => item.isDone)
    .reduce((sum, item) => sum + item.pointsPlanned, 0)
  const totalPoints = deliverables.reduce((sum, item) => sum + item.pointsPlanned, 0)

  const handleAddLog = () => {
    if (!selectedDomain || !selectedActivity) return
    addActivityLog.mutate({
      dateKey,
      typeId: selectedActivity,
      minutes: selectedDuration,
      note: note.trim() ? note.trim() : undefined,
    })
    setNote("")
    setSelectedActivity(null)
  }

  const handleAddDeliverable = () => {
    if (!deliverableTitle.trim()) return
    addDeliverable.mutate({
      dateKey,
      title: deliverableTitle.trim(),
      domain: deliverableDomain,
      pointsPlanned: Math.max(1, deliverablePoints),
    })
    setDeliverableTitle("")
    setDeliverablePoints(3)
    setDeliverableDomain("build")
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDateChange(subDays(selectedDate, 1))}
              className="size-8"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {format(selectedDate, "EEEE")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "MMMM d, yyyy")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDateChange(addDays(selectedDate, 1))}
              className="size-8"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          {!isToday && (
            <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
              Today
            </Button>
          )}
        </div>

        {/* Prime Score Card */}
        <Card className="card-premium" data-tour="prime-score">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-between">
              {/* Prime Score Display */}
              <div className="flex items-center gap-6">
                {/* Ring */}
                <div className="relative">
                  <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(primeScore, 100) / 100)}
                      className="ring-stroke ring-glow"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold tabular-nums text-foreground">
                      {primeScore}
                    </span>
                    <span className="text-xs text-muted-foreground">Prime</span>
                  </div>
                </div>

                {/* Score Details */}
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Prime Score</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold tabular-nums text-foreground">
                        {primeScore}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help rounded-full bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                            {focusMultiplier}x
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Focus quality influences your Prime Score</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Completion:</span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {completion}%
                    </span>
                    <span className="text-muted-foreground">x</span>
                    <span className="text-muted-foreground">Focus:</span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {focusMultiplier}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Info className="size-3" />
                  <span>Domain Breakdown</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(domainMeta) as Domain[]).map((key) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <div className="flex cursor-help items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-2 py-1">
                          <div
                            className="size-2 rounded-full"
                            style={{ backgroundColor: domainMeta[key].color }}
                          />
                          <span className="text-xs font-medium capitalize text-foreground">
                            {key}
                          </span>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {domainScores[key]}%
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Daily completion for {domainMeta[key].label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pillar Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="domain-rings">
          {(Object.keys(domainMeta) as Domain[]).map((domain) => {
            const meta = domainMeta[domain]
            const summaryDomain = summary?.domains[domain]
            if (!summaryDomain) return null
            if (domain === "recovery") {
              return (
                <Card key={domain} className="border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-3 py-5">
                    <div className="relative">
                      <svg viewBox="0 0 100 100" className="size-20 -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-muted/20"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={meta.color}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 38}
                          strokeDashoffset={2 * Math.PI * 38 * (1 - Math.min(domainScores.recovery, 100) / 100)}
                          className="ring-stroke ring-glow"
                          style={{ color: meta.color }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold tabular-nums text-foreground">
                          {domainScores.recovery}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Heart className="size-4" style={{ color: meta.color }} />
                        <span className="font-semibold text-foreground">Recovery</span>
                      </div>
                      <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Moon className="size-3" />
                        <span>Sleep</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {summary?.recovery.sleepHours ?? 0}/{summary?.recovery.sleepTargetHours ?? 8}h
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <PillarCard
                key={domain}
                label={meta.label}
                icon={meta.icon}
                color={meta.color}
                percent={summaryDomain.completionDisplay}
                remaining={`${Math.max(0, summaryDomain.target - summaryDomain.minutes)} min left`}
                highlight={domain === "build"}
              />
            )
          })}
        </div>

        {/* Quick Log + Focus + Sleep */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Log */}
          <Card className="card-premium lg:col-span-2" data-tour="quick-log">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quick Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Choose Pillar */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">1. Choose pillar</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(domainMeta) as Domain[]).map((key) => {
                    const domain = domainMeta[key]
                    const Icon = domain.icon
                    const isSelected = selectedDomain === key
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedDomain(isSelected ? null : key)
                          setSelectedActivity(null)
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
                          isSelected
                            ? "border-transparent text-white"
                            : "border-border/50 bg-card text-foreground hover:bg-muted/50",
                        )}
                        style={{
                          backgroundColor: isSelected ? domain.color : undefined,
                        }}
                      >
                        <Icon className="size-4" />
                        {domain.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: Choose Activity */}
              {selectedDomain && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-xs font-medium text-muted-foreground">2. Choose activity</p>
                  <div className="flex flex-wrap gap-2">
                    {activitiesByDomain[selectedDomain].map((activity) => {
                      const isSelected = selectedActivity === activity.id
                      return (
                        <button
                          key={activity.id}
                          onClick={() => setSelectedActivity(isSelected ? null : activity.id)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200",
                            isSelected
                              ? "border-transparent text-white"
                              : "border-border/50 bg-card text-foreground hover:bg-muted/50",
                          )}
                          style={{
                            backgroundColor: isSelected ? domainMeta[selectedDomain].color : undefined,
                          }}
                        >
                          {activity.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Duration */}
              {selectedActivity && selectedDomain && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-xs font-medium text-muted-foreground">3. Duration</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {durationPresets.map((mins) => {
                      const isSelected = selectedDuration === mins
                      return (
                        <button
                          key={mins}
                          onClick={() => setSelectedDuration(mins)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200",
                            isSelected
                              ? "border-transparent text-white"
                              : "border-border/50 bg-card text-foreground hover:bg-muted/50",
                          )}
                          style={{
                            backgroundColor: isSelected ? domainMeta[selectedDomain].color : undefined,
                          }}
                        >
                          {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Optional note (context or outcome)"
                />
              </div>

              <Button
                className="w-full gap-2 transition-all duration-200"
                disabled={!selectedActivity}
                onClick={handleAddLog}
                style={{
                  backgroundColor: selectedDomain ? domainMeta[selectedDomain].color : undefined,
                }}
              >
                <Plus className="size-4" />
                Add to {selectedDomain ? domainMeta[selectedDomain].label : "..."}
              </Button>
            </CardContent>
          </Card>

          {/* Focus Quality + Sleep Input */}
          <div className="space-y-4" data-tour="focus-recovery">
            {/* Focus Quality */}
            <Card className="card-premium">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Focus Quality</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help rounded-full bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                        {focusMultiplier}x
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Focus quality shapes your Prime Score</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-center text-lg font-semibold text-foreground">
                  {focusLevels[focusLevel - 1].label}
                </p>
                <div className="flex items-center justify-between gap-1">
                  {focusLevels.map((level) => (
                    <Tooltip key={level.value}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            setFocusLevel(level.value)
                            setFocusDirty(true)
                          }}
                          className={cn(
                            "flex flex-1 flex-col items-center gap-0.5 rounded-lg border py-2 transition-all duration-200",
                            focusLevel === level.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                          )}
                        >
                          <span className="text-xs font-bold">{level.multiplier}x</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{level.label}</p>
                        <p className="text-xs text-muted-foreground">{level.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block">Focus Score</span>
                    <span className="text-sm font-semibold text-foreground">{focusScore}</span>
                  </div>
                  <div>
                    <span className="block">Deep Minutes</span>
                    <Input
                      type="number"
                      min={0}
                      value={deepMinutes}
                      onChange={(event) => {
                        setDeepMinutes(Number(event.target.value))
                        setFocusDirty(true)
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <span className="block">Longest Block</span>
                    <Input
                      type="number"
                      min={0}
                      value={longestBlockMinutes}
                      onChange={(event) => {
                        setLongestBlockMinutes(Number(event.target.value))
                        setFocusDirty(true)
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <span className="block">Switches/hr</span>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={switchesPerHour}
                      onChange={(event) => {
                        setSwitchesPerHour(Number(event.target.value))
                        setFocusDirty(true)
                      }}
                      className="h-8"
                    />
                  </div>
                </div>
                <Input
                  value={focusDrivers}
                  onChange={(event) => {
                    setFocusDrivers(event.target.value)
                    setFocusDirty(true)
                  }}
                  placeholder="Drivers (comma separated)"
                  className="h-8"
                />
              </CardContent>
            </Card>

            {/* Recovery */}
            <Card className="border-emerald-600/20 bg-emerald-600/5 dark:border-emerald-400/20 dark:bg-emerald-400/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Moon className="size-4" />
                  Recovery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10 border-emerald-600/30 hover:bg-emerald-600/10 bg-transparent dark:border-emerald-400/30 dark:hover:bg-emerald-400/10"
                    onClick={() => {
                      setSleepHours(Math.max(4, sleepHours - 0.5))
                      setRecoveryDirty(true)
                    }}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <div className="text-center">
                    <span className="text-3xl font-bold tabular-nums text-foreground">
                      {sleepHours}
                    </span>
                    <span className="ml-1 text-lg text-muted-foreground">h</span>
                    <p className="text-xs text-muted-foreground">
                      Target: {summary?.recovery.sleepTargetHours ?? 8}h
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10 border-emerald-600/30 hover:bg-emerald-600/10 bg-transparent dark:border-emerald-400/30 dark:hover:bg-emerald-400/10"
                    onClick={() => {
                      setSleepHours(Math.min(12, sleepHours + 0.5))
                      setRecoveryDirty(true)
                    }}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Energy Score</span>
                    <span className="font-semibold text-foreground">{energyScore}</span>
                  </div>
                  <Slider
                    value={[energyScore]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      setEnergyScore(value[0] ?? 0)
                      setRecoveryDirty(true)
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Mood</span>
                    <span className="font-semibold text-foreground">{mood ?? "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setMood(mood === value ? undefined : value)
                          setRecoveryDirty(true)
                        }}
                        className={cn(
                          "flex-1 rounded-md border py-1 text-xs font-medium",
                          mood === value
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "border-border/50 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  value={recoveryDrivers}
                  onChange={(event) => {
                    setRecoveryDrivers(event.target.value)
                    setRecoveryDirty(true)
                  }}
                  placeholder="Recovery drivers (comma separated)"
                  className="h-8"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deliverables */}
        <Card className="border-amber-600/20 bg-card dark:border-amber-400/20" data-tour="deliverables">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ship className="size-4 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-sm font-medium text-foreground">Deliverables</CardTitle>
              </div>
              <span className="text-sm font-medium tabular-nums text-muted-foreground">
                {completedPoints}
                <span className="text-muted-foreground/60">{" / "}{totalPoints} pts</span>
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {deliverables.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-all duration-200",
                  item.isDone && "bg-muted/30",
                )}
              >
                <button
                  onClick={() => toggleDeliverableDone.mutate({ id: item.id, done: !item.isDone })}
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200",
                    item.isDone
                      ? "border-amber-600 bg-amber-600 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-background"
                      : "border-border hover:border-amber-600 dark:hover:border-amber-400",
                  )}
                >
                  {item.isDone && <Check className="size-3" />}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm transition-all duration-200",
                    item.isDone && "text-muted-foreground line-through",
                  )}
                >
                  {item.title}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200",
                    item.isDone
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  +{item.pointsPlanned}
                </span>
              </div>
            ))}

            <div className="grid gap-2 rounded-lg border border-dashed border-border/50 p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                <Input
                  value={deliverableTitle}
                  onChange={(event) => setDeliverableTitle(event.target.value)}
                  placeholder="Add deliverable title"
                />
                <Input
                  type="number"
                  min={1}
                  value={deliverablePoints}
                  onChange={(event) => setDeliverablePoints(Number(event.target.value))}
                  className="sm:w-24"
                />
                <Select
                  value={deliverableDomain}
                  onValueChange={(value) => setDeliverableDomain(value as Domain)}
                >
                  <SelectTrigger className="h-10 sm:w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(domainMeta) as Domain[]).map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domainMeta[domain].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddDeliverable}
                variant="outline"
                className="h-9 w-full justify-start gap-2 border border-input bg-transparent px-3 text-sm font-normal text-muted-foreground shadow-xs hover:bg-transparent hover:text-foreground"
              >
                <Plus className="size-4 text-muted-foreground" />
                Add deliverable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

interface PillarCardProps {
  label: string
  icon: React.ElementType
  color: string
  percent: number
  remaining: string
  highlight?: boolean
}

function PillarCard({ label, icon: Icon, color, percent, remaining, highlight }: PillarCardProps) {
  const isComplete = percent >= 100

  return (
    <Card
      className={cn(
        "border-border/50 bg-card shadow-sm transition-all duration-200 hover:shadow-md",
        highlight && "border-amber-500/20",
      )}
    >
      <CardContent className="flex flex-col items-center gap-3 py-5">
        <div className="relative">
          <svg viewBox="0 0 100 100" className="size-20 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 38}
              strokeDashoffset={2 * Math.PI * 38 * (1 - Math.min(percent, 100) / 100)}
              className="ring-stroke ring-glow"
              style={{ color }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums text-foreground">{percent}%</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Icon className="size-4" style={{ color }} />
            <span className="font-semibold text-foreground">{label}</span>
          </div>
          {!isComplete && <p className="mt-0.5 text-xs text-muted-foreground">{remaining}</p>}
          {isComplete && <p className="mt-0.5 text-xs font-medium text-green-500">Complete</p>}
        </div>
      </CardContent>
    </Card>
  )
}
