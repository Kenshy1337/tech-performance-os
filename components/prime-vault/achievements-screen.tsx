"use client"

import React, { useMemo, useState } from "react"
import { Search, ChevronDown, Star, Diamond, Trophy, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useAchievementsSummary } from "@/data/hooks"
import { AchievementView, Category, Tier } from "@/data/types"

const tierConfig: Record<
  Tier,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  bronze: {
    label: "BRONZE",
    color: "text-amber-700 dark:text-amber-500",
    bgColor: "bg-amber-500/10",
    icon: <Trophy className="size-4" />,
  },
  silver: {
    label: "SILVER",
    color: "text-slate-500 dark:text-slate-400",
    bgColor: "bg-slate-400/10",
    icon: <Trophy className="size-4" />,
  },
  gold: {
    label: "GOLD",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-400/10",
    icon: <Star className="size-4" />,
  },
  platinum: {
    label: "PLATINUM",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-400/10",
    icon: <Diamond className="size-4" />,
  },
  diamond: {
    label: "DIAMOND",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-400/10",
    icon: <Diamond className="size-4" />,
  },
  mythic: {
    label: "MYTHIC",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-400/10",
    icon: <Sparkles className="size-4" />,
  },
  impossiple: {
    label: "IMPOSSIPLE",
    color: "text-[#d4af37] dark:text-[#f5c542]",
    bgColor: "bg-[#d4af37]/10 dark:bg-[#f5c542]/10",
    icon: <Sparkles className="size-4" />,
  },
}

const categoryConfig: Record<Category, { label: string }> = {
  consistency: { label: "Consistency" },
  volume: { label: "Volume" },
  quality: { label: "Quality" },
  build: { label: "Build" },
  mythic: { label: "Mythic" },
  impossiple: { label: "Impossiple" },
}

export function AchievementsScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [selectedTier, setSelectedTier] = useState<Tier | "all">("all")
  const [mythicOpen, setMythicOpen] = useState(false)
  const [impossipleOpen, setImpossipleOpen] = useState(false)

  const { data: summary } = useAchievementsSummary()

  const unlocked = summary?.unlocked ?? []
  const nextUp = summary?.nextUp ?? []
  const mythic = summary?.mythic ?? []
  const impossiple = summary?.impossiple ?? []
  const totalAchievements = summary?.total ?? 250
  const coreUnlocked = unlocked.filter(
    (item) => item.category !== "mythic" && item.category !== "impossiple",
  )

  const filteredNextUp = useMemo(() => {
    return nextUp.filter((achievement) => {
      const matchesSearch =
        achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || achievement.category === selectedCategory
      const matchesTier = selectedTier === "all" || achievement.tier === selectedTier
      return matchesSearch && matchesCategory && matchesTier
    })
  }, [nextUp, searchQuery, selectedCategory, selectedTier])

  return (
    <div className="space-y-6">
      <Card className="card-premium" data-tour="achievements-trophy">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Trophy Shelf</CardTitle>
            <span className="text-sm text-muted-foreground">
              {unlocked.length} / {totalAchievements}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Unlocked
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {coreUnlocked.length}
              </span>
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {coreUnlocked.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} unlocked />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Next Up</CardTitle>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {filteredNextUp.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as Category | "all")}
            >
              <SelectTrigger className="h-9 min-w-[170px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(Object.keys(categoryConfig) as Category[])
                  .filter((key) => key !== "mythic" && key !== "impossiple")
                  .map((key) => (
                    <SelectItem key={key} value={key}>
                      {categoryConfig[key].label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={selectedTier} onValueChange={(value) => setSelectedTier(value as Tier | "all")}>
              <SelectTrigger className="h-9 min-w-[140px]">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {(Object.keys(tierConfig) as Tier[])
                  .filter((key) => key !== "mythic" && key !== "impossiple")
                  .map((key) => (
                    <SelectItem key={key} value={key}>
                      {tierConfig[key].label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filteredNextUp.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Collapsible open={mythicOpen} onOpenChange={setMythicOpen}>
        <Card className="border-pink-600/20 bg-card dark:border-pink-400/30">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer pb-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-pink-500/10">
                    <Sparkles className="size-4 text-pink-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium text-pink-600 dark:text-pink-400">
                      Mythic
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Near-impossible achievements. DensityIndex is your power metric.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-xs font-medium text-pink-500">
                    {mythic.filter((item) => item.unlockedAt).length} / {mythic.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 text-muted-foreground transition-transform duration-200",
                      mythicOpen && "rotate-180",
                    )}
                  />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mythic.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} mythic />
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={impossipleOpen} onOpenChange={setImpossipleOpen}>
        <Card className="border-[#d4af37]/30 bg-card dark:border-[#f5c542]/40">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer pb-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#d4af37]/15 dark:bg-[#f5c542]/15">
                    <Sparkles className="size-4 text-[#d4af37] dark:text-[#f5c542]" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium text-[#b38600] dark:text-[#f5c542]">
                      Impossiple
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Life-level milestones — legacy achievements beyond daily performance.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#d4af37]/10 px-2 py-0.5 text-xs font-medium text-[#b38600] dark:text-[#f5c542]">
                    {impossiple.filter((item) => item.unlockedAt).length} / {impossiple.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 text-muted-foreground transition-transform duration-200",
                      impossipleOpen && "rotate-180",
                    )}
                  />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {impossiple.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} impossiple />
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}

interface AchievementCardProps {
  achievement: AchievementView
  unlocked?: boolean
  mythic?: boolean
  impossiple?: boolean
}

function AchievementCard({ achievement, unlocked, mythic, impossiple }: AchievementCardProps) {
  const tier = tierConfig[achievement.tier]
  const category = categoryConfig[achievement.category]
  const progressPercent = Math.min(100, (achievement.progress / achievement.target) * 100)
  const formatValue = (value: number) =>
    new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value)

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4 transition-all duration-200",
        unlocked
          ? "border-primary/20 bg-primary/5 dark:border-primary/30"
          : impossiple
            ? "border-[#d4af37]/30 bg-[#d4af37]/5 dark:border-[#f5c542]/40 dark:bg-[#f5c542]/10"
            : mythic
              ? "border-pink-600/20 bg-pink-600/5 dark:border-pink-400/30 dark:bg-pink-400/10"
            : "border-border/40 bg-card hover:border-border/60 hover:shadow-sm",
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            unlocked ? "bg-primary/20 text-primary" : tier.bgColor,
            tier.color,
          )}
        >
          {unlocked ? <Star className="size-4 fill-current" /> : tier.icon}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", tier.bgColor, tier.color)}>
            {tier.label}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {category.label}
          </span>
        </div>
      </div>

      <h3
        className={cn(
          "mb-1 font-medium",
          impossiple
            ? "text-[#b38600] dark:text-[#f5c542]"
            : mythic
              ? "text-pink-600 dark:text-pink-400"
              : "text-foreground",
        )}
      >
        {achievement.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{achievement.description}</p>

      {unlocked ? (
        <p className="text-xs text-muted-foreground">Unlocked {achievement.unlockedAt}</p>
      ) : (
        <div className="space-y-1.5">
          <Progress
            value={progressPercent}
            className={cn(
              "h-1.5",
              mythic && "[&>div]:bg-pink-500",
              impossiple && "[&>div]:bg-[#d4af37] dark:[&>div]:bg-[#f5c542]",
            )}
          />
          <p className="text-right text-xs text-muted-foreground">
            {formatValue(achievement.progress)} / {formatValue(achievement.target)}
          </p>
        </div>
      )}
    </div>
  )
}
