"use client"

import { useMemo, useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  subDays,
  subYears,
  isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight, ChevronDown, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useHistoryMonth, useRangeSummary, useTodaySummary } from "@/data/hooks"
import { fromDateKey, toDateKey } from "@/data/date"
import { Domain } from "@/data/types"

interface HistoryScreenProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

type SelectionMode = "single" | "range"
type Timeframe = "7D" | "30D" | "90D" | "1Y" | "All"

const ringColors = {
  primeScore: "var(--primary)",
  brain: "#3b82f6",
  build: "#f59e0b",
  body: "#ef4444",
  recovery: "#22c55e",
}

const heatColor = (score: number) => {
  if (score >= 90) return "#ef4444"
  if (score >= 75) return "#f59e0b"
  if (score >= 60) return "#22c55e"
  if (score >= 40) return "#3b82f6"
  return "#64748b"
}

export function HistoryScreen({ selectedDate, onDateChange }: HistoryScreenProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single")
  const [rangeStart, setRangeStart] = useState<Date | null>(null)
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>("30D")
  const [trendsOpen, setTrendsOpen] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const { data: monthData } = useHistoryMonth(currentMonth.getFullYear(), currentMonth.getMonth())

  const selectedDateKey = toDateKey(selectedDate)
  const { data: daySummary } = useTodaySummary(selectedDateKey)

  const rangeStartKey = rangeStart ? toDateKey(rangeStart) : ""
  const rangeEndKey = rangeEnd ? toDateKey(rangeEnd) : ""
  const { data: rangeSummary } = useRangeSummary(rangeStartKey, rangeEndKey)

  const handleDayClick = (day: Date) => {
    if (selectionMode === "single") {
      onDateChange(day)
    } else {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(day)
        setRangeEnd(null)
      } else {
        if (day < rangeStart) {
          setRangeEnd(rangeStart)
          setRangeStart(day)
        } else {
          setRangeEnd(day)
        }
      }
    }
  }

  const isInRange = (day: Date) => {
    if (!rangeStart || !rangeEnd) return false
    return isWithinInterval(day, { start: rangeStart, end: rangeEnd })
  }

  const isRangeStart = (day: Date) => rangeStart && isSameDay(day, rangeStart)
  const isRangeEnd = (day: Date) => rangeEnd && isSameDay(day, rangeEnd)

  const handleTimeframeSelect = (tf: Timeframe) => {
    setTimeframe(tf)
    setSelectionMode("range")
    const now = new Date()
    let start: Date

    switch (tf) {
      case "7D":
        start = subDays(now, 7)
        break
      case "30D":
        start = subDays(now, 30)
        break
      case "90D":
        start = subDays(now, 90)
        break
      case "1Y":
        start = subYears(now, 1)
        break
      case "All":
        start = subYears(now, 2)
        break
      default:
        start = subDays(now, 30)
    }

    setRangeStart(start)
    setRangeEnd(now)
  }

  const trendData = useMemo(() => {
    if (!rangeSummary) return []
    return rangeSummary.days.map((day) => ({
      date: format(fromDateKey(day.dateKey), "MMM d"),
      primeScore: day.primeScore,
      completion: day.completionAverage,
      brain: day.domains.brain.completionDisplay,
      build: day.domains.build.completionDisplay,
      body: day.domains.body.completionDisplay,
      recovery: day.domains.recovery.completionDisplay,
    }))
  }, [rangeSummary])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => {
              setSelectionMode("single")
              setRangeStart(null)
              setRangeEnd(null)
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
              selectionMode === "single"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Day
          </button>
          <button
            onClick={() => setSelectionMode("range")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
              selectionMode === "range"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Range
          </button>
        </div>

        {selectionMode === "range" && (
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {(["7D", "30D", "90D", "1Y", "All"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeSelect(tf)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-all duration-200",
                  timeframe === tf
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Calendar */}
      <Card className="card-premium" data-tour="history-calendar">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <CardTitle className="text-base font-semibold">{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-7 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dateKey = toDateKey(day)
              const data = monthData?.days[dateKey]
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectionMode === "single" && isSameDay(day, selectedDate)
              const inRange = selectionMode === "range" && isInRange(day)
              const isStart = selectionMode === "range" && isRangeStart(day)
              const isEnd = selectionMode === "range" && isRangeEnd(day)
              const isTodayDate = isToday(day)

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!isCurrentMonth}
                  className={cn(
                    "calendar-day relative flex h-14 flex-col items-center justify-center",
                    !isCurrentMonth && "opacity-30",
                    isCurrentMonth && "hover:bg-muted/60 dark:hover:bg-muted/40",
                    inRange && !isStart && !isEnd && "calendar-range-pill bg-primary/10 dark:bg-primary/20",
                    isStart && "calendar-range-pill rounded-l-full bg-primary text-primary-foreground",
                    isEnd && "calendar-range-pill rounded-r-full bg-primary text-primary-foreground",
                    isStart && isEnd && "rounded-full",
                    isSelected && "rounded-full bg-primary text-primary-foreground",
                    isTodayDate && !isSelected && !isStart && !isEnd && "ring-2 ring-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      (isSelected || isStart || isEnd) && "text-primary-foreground",
                      inRange && !isStart && !isEnd && "text-primary dark:text-primary",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {data && isCurrentMonth && (
                    <div className="absolute bottom-1 flex flex-col gap-[2px]">
                      {[0.4, 0.7, 1].map((opacity) => (
                        <span
                          key={opacity}
                          className="h-1 w-5 rounded-full"
                          style={{
                            backgroundColor: heatColor(data.primeScore),
                            opacity,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectionMode === "single" && daySummary && (
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Day Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <span className="text-xs font-medium text-muted-foreground">Prime Score</span>
                <p className="text-3xl font-bold tabular-nums text-foreground">{daySummary.primeScore}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <span className="text-xs font-medium text-muted-foreground">Completion</span>
                <p className="text-3xl font-bold tabular-nums text-foreground">{daySummary.completionAverage}%</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(["brain", "build", "body", "recovery"] as Domain[]).map((domain) => (
                <MetricCard
                  key={domain}
                  title={domain}
                  value={daySummary.domains[domain].completionDisplay}
                  suffix="%"
                  color={ringColors[domain]}
                  highlight={domain === "build"}
                />
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryTile label="Output Score" value={Math.round(daySummary.outputScore)} suffix="%" />
              <SummaryTile label="Focus Score" value={Math.round(daySummary.focusScore)} suffix="%" />
              <SummaryTile label="Recovery Score" value={Math.round(daySummary.recoveryScore)} suffix="%" />
            </div>
          </CardContent>
        </Card>
      )}

      {selectionMode === "range" && rangeSummary && (
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {timeframe} Summary
              </CardTitle>
              <span className="text-xs text-muted-foreground">{rangeSummary.totalDays} days</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <span className="text-xs font-medium text-muted-foreground">Avg Prime Score</span>
                <p className="text-3xl font-bold tabular-nums text-foreground">{rangeSummary.averagePrime}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <span className="text-xs font-medium text-muted-foreground">Avg Completion</span>
                <p className="text-3xl font-bold tabular-nums text-foreground">{rangeSummary.averageCompletion}%</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {(["brain", "build", "body", "recovery"] as Domain[]).map((domain) => (
                <MetricCard
                  key={domain}
                  title={domain}
                  value={rangeSummary.averageDomains[domain]}
                  suffix="%"
                  color={ringColors[domain]}
                  highlight={domain === "build"}
                />
              ))}
              <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                <Moon className="size-5 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Recovery</p>
                  <p className="text-xl font-bold tabular-nums text-foreground">
                    {Math.round(rangeSummary.averageRecovery)}
                    <span className="text-sm font-normal text-muted-foreground">%</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryTile label="Best Day" value={rangeSummary.bestDay?.primeScore ?? 0} suffix="Prime" />
              <SummaryTile label="Worst Day" value={rangeSummary.worstDay?.primeScore ?? 0} suffix="Prime" />
              <SummaryTile label="Current Streak" value={rangeSummary.currentStreak} suffix="days" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile label="Points Done" value={rangeSummary.doneDeliverablePoints} suffix="pts" />
              <SummaryTile label="Points Planned" value={rangeSummary.totalDeliverablePoints} suffix="pts" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collapsible Trends */}
      {selectionMode === "range" && trendData.length > 0 && (
        <Collapsible open={trendsOpen} onOpenChange={setTrendsOpen}>
          <Card className="card-premium">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer transition-colors hover:bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">View Trends</CardTitle>
                  <ChevronDown
                    className={cn(
                      "size-5 text-muted-foreground transition-transform duration-200",
                      trendsOpen && "rotate-180",
                    )}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-0">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Prime Score</h4>
                  <div className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="primeGradientHistory" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                          domain={[0, 100]}
                          width={30}
                        />
                        <Tooltip
                          cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                                <p className="text-xs text-muted-foreground">{data.date}</p>
                                <p className="font-semibold text-foreground">Prime: {data.primeScore}</p>
                              </div>
                            )
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="primeScore"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          fill="url(#primeGradientHistory)"
                          dot={false}
                          activeDot={{ r: 4, className: "chart-active-dot" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Domains</h4>
                  <div className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          {(["brain", "build", "body", "recovery"] as const).map((domain) => (
                            <linearGradient key={domain} id={`historyGradient-${domain}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={ringColors[domain]} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={ringColors[domain]} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                          domain={[0, 100]}
                          width={30}
                        />
                        <Tooltip
                          cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                                <p className="mb-1 text-xs text-muted-foreground">{data.date}</p>
                                {(["brain", "build", "body", "recovery"] as const).map((domain) => (
                                  <div key={domain} className="flex items-center gap-2 text-sm">
                                    <div className="size-2 rounded-full" style={{ backgroundColor: ringColors[domain] }} />
                                    <span className="capitalize text-muted-foreground">{domain}:</span>
                                    <span className="font-medium text-foreground">{data[domain]}%</span>
                                  </div>
                                ))}
                              </div>
                            )
                          }}
                        />
                        {(["brain", "build", "body", "recovery"] as const).map((domain) => (
                          <Area
                            key={domain}
                            type="monotone"
                            dataKey={domain}
                            stroke={ringColors[domain]}
                            strokeWidth={1.5}
                            fill={`url(#historyGradient-${domain})`}
                            dot={false}
                            activeDot={{ r: 3, className: "chart-active-dot" }}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  suffix?: string
  color: string
  highlight?: boolean
}

function MetricCard({ title, value, suffix = "", color, highlight }: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4 transition-all duration-200",
        highlight ? "border-amber-500/20 bg-amber-500/5" : "border-border/50 bg-card",
      )}
    >
      <div className="relative size-10">
        <svg viewBox="0 0 40 40" className="size-10 -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/20"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 16}
            strokeDashoffset={2 * Math.PI * 16 * (1 - Math.min(value, 100) / 100)}
            className="ring-stroke ring-glow"
            style={{ color }}
          />
        </svg>
      </div>
      <div>
        <p className="text-xs capitalize text-muted-foreground">{title}</p>
        <p className="text-xl font-bold tabular-nums text-foreground">
          {value}
          <span className="text-sm font-normal text-muted-foreground">{suffix}</span>
        </p>
      </div>
    </div>
  )
}

function SummaryTile({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-foreground">
        {value} <span className="text-xs font-normal text-muted-foreground">{suffix}</span>
      </p>
    </div>
  )
}
