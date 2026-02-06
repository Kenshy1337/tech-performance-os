"use client"

import { useState } from "react"
import { format, startOfWeek, addDays, subWeeks, addWeeks, isToday } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Flame,
  Calendar,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useWeekSummary } from "@/data/hooks"
import { fromDateKey, toDateKey } from "@/data/date"

const ringColors = {
  brain: "#3b82f6",
  build: "#f59e0b",
  body: "#ef4444",
  recovery: "#22c55e",
}

export function WeekScreen() {
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  )
  const [trendsOpen, setTrendsOpen] = useState(false)

  const weekStartKey = toDateKey(currentWeek)
  const { data: summary } = useWeekSummary(weekStartKey)

  const weekDays = summary?.days ?? []
  const trendData = summary?.trend ?? []

  const bestDay = summary?.bestDay
  const avgScores = summary

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between" data-tour="week-header">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d, yyyy")}
          </h2>
          <p className="text-sm text-muted-foreground">Weekly overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          >
            This Week
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* 7-Day Mini Cards */}
      <div className="grid grid-cols-7 gap-2" data-tour="week-overview">
        {weekDays.map((day) => {
          const date = fromDateKey(day.dateKey)
          return (
            <Card
              key={day.dateKey}
              className={cn(
                "border-border/50 transition-all duration-200",
                bestDay?.dateKey === day.dateKey && "border-primary/30 bg-primary/5",
                isToday(date) && "ring-2 ring-primary/30",
              )}
            >
              <CardContent className="flex flex-col items-center gap-2 p-3">
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground">{format(date, "EEE")}</p>
                  <p className={cn("text-sm font-semibold", isToday(date) && "text-primary")}>
                    {format(date, "d")}
                  </p>
                </div>

                <div className="relative size-12">
                  <svg viewBox="0 0 48 48" className="size-12 -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-muted/20"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - Math.min(day.primeScore, 100) / 100)}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {day.primeScore}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {(["brain", "build", "body", "recovery"] as const).map((domain) => (
                    <div
                      key={domain}
                      className="ring-dot size-2"
                      style={{
                        backgroundColor: ringColors[domain],
                        opacity: Math.max(0.4, day.domains[domain].completionDisplay / 100),
                        color: ringColors[domain],
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-premium">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Prime Score</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {avgScores?.averagePrime ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
              <Calendar className="size-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Completion</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {avgScores?.averageCompletion ?? 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
              <TrendingUp className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Day</p>
              <p className="font-semibold text-foreground">
                {bestDay ? format(new Date(bestDay.dateKey), "EEEE") : "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                Score: {bestDay?.primeScore ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-orange-500/10">
              <Flame className="size-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {avgScores?.currentStreak ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domain Averages */}
      <Card className="card-premium">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Domain Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {(["brain", "build", "body", "recovery"] as const).map((domain) => {
              const avg = avgScores?.averageDomains?.[domain] ?? 0
              const isBuild = domain === "build"
              return (
                <div key={domain} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <svg viewBox="0 0 64 64" className={cn("size-14 -rotate-90", isBuild && "size-16")}>
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={isBuild ? 6 : 5}
                        className="text-muted/20"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke={ringColors[domain]}
                        strokeWidth={isBuild ? 6 : 5}
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - Math.min(avg, 100) / 100)}
                        className="ring-stroke ring-glow transition-all duration-500"
                        style={{ color: ringColors[domain] }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold tabular-nums text-foreground">{avg}%</span>
                    </div>
                  </div>
                  <span className={cn("text-xs font-medium capitalize", isBuild ? "text-amber-500" : "text-muted-foreground")}>
                    {domain}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Collapsible Trends */}
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
              {/* Prime Score Trend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Prime Score</h4>
                  <span className="text-xs text-muted-foreground">Last 30 days</span>
                </div>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="primeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="label"
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
                              <p className="text-xs text-muted-foreground">{data.label}</p>
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
                        fill="url(#primeGradient)"
                        dot={false}
                        activeDot={{ r: 4, className: "chart-active-dot" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Domain Trends */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Domains</h4>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        {(["brain", "build", "body", "recovery"] as const).map((domain) => (
                          <linearGradient key={domain} id={`gradient-${domain}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ringColors[domain]} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={ringColors[domain]} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="label"
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
                              <p className="mb-1 text-xs text-muted-foreground">{data.label}</p>
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
                          fill={`url(#gradient-${domain})`}
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
    </div>
  )
}
