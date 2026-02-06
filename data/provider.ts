"use client"

import {
  ActivityLog,
  ActivityType,
  AchievementsSummary,
  DailyFocus,
  DailyRecovery,
  DaySummary,
  Deliverable,
  Domain,
  ExportBundle,
  HistoryMonthData,
  RangeSummary,
  StatsSummary,
  Targets,
  UserProfile,
  WeekSummary,
} from "./types"
import {
  bulkPut,
  count,
  getAll,
  getAllFromIndex,
  getByKey,
  openDb,
  put,
  STORES,
} from "./idb"
import { DEFAULT_ACTIVITY_TYPES, DEFAULT_PROFILE } from "./seed"
import { DEFAULT_FOCUS, DEFAULT_RECOVERY, DEFAULT_TARGETS, DOMAIN_ORDER } from "./constants"
import { buildDateKeyRange, clampDateRange, fromDateKey, toDateKey } from "./date"
import {
  computeCompletionAverage,
  computeDomainCompletion,
  computeOutputScore,
  computePrimeScore,
} from "./scoring"
import { ACHIEVEMENT_DEFINITIONS } from "./achievements/definitions"
import { computeAchievementViews } from "./achievements/engine"

export interface DataProvider {
  getActivityTypes(): Promise<ActivityType[]>
  getTargets(): Promise<Targets>
  updateTargets(partial: Partial<Targets>): Promise<Targets>
  getProfile(): Promise<UserProfile>
  updateProfile(partial: Partial<UserProfile>): Promise<UserProfile>
  getTodaySummary(dateKey: string): Promise<DaySummary>
  getWeekSummary(weekStartKey: string): Promise<WeekSummary>
  getHistoryMonth(year: number, month: number): Promise<HistoryMonthData>
  getRangeSummary(startKey: string, endKey: string): Promise<RangeSummary>
  addActivityLog(input: {
    dateKey: string
    typeId: string
    minutes: number
    note?: string
  }): Promise<void>
  upsertDailyFocus(input: Omit<DailyFocus, "updatedAt">): Promise<void>
  upsertDailyRecovery(input: Omit<DailyRecovery, "updatedAt">): Promise<void>
  addDeliverable(input: Omit<Deliverable, "id" | "createdAt" | "isDone">): Promise<void>
  toggleDeliverableDone(id: string, done: boolean): Promise<void>
  getAchievementsSummary(): Promise<AchievementsSummary>
  getStatsSummary(): Promise<StatsSummary>
  exportData(): Promise<ExportBundle>
  importData(bundle: ExportBundle): Promise<void>
}

const generateId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

const ensureSeeded = async () => {
  await openDb()
  const typesCount = await count(STORES.activityTypes)
  if (typesCount === 0) {
    await bulkPut(STORES.activityTypes, DEFAULT_ACTIVITY_TYPES)
  }
  const profile = await getByKey(STORES.profile, "local")
  if (!profile) {
    await put(STORES.profile, DEFAULT_PROFILE)
  }
  const targets = await getByKey(STORES.targets, "default")
  if (!targets) {
    await put(STORES.targets, DEFAULT_TARGETS)
  }
}

const buildDefaultFocus = (dateKey: string): DailyFocus => ({
  dateKey,
  ...DEFAULT_FOCUS,
  updatedAt: new Date().toISOString(),
})

const buildDefaultRecovery = (dateKey: string, targets: Targets): DailyRecovery => ({
  dateKey,
  sleepHours: DEFAULT_RECOVERY.sleepHours,
  sleepTargetHours: targets.sleepTargetHours,
  energyScore: DEFAULT_RECOVERY.energyScore,
  mood: DEFAULT_RECOVERY.mood,
  recoveryDrivers: DEFAULT_RECOVERY.recoveryDrivers,
  updatedAt: new Date().toISOString(),
})

const sumMinutesByDomain = (logs: ActivityLog[]): Record<Domain, number> => {
  return logs.reduce(
    (acc, log) => {
      acc[log.domain] += log.minutes
      return acc
    },
    {
      brain: 0,
      build: 0,
      body: 0,
      recovery: 0,
    } as Record<Domain, number>,
  )
}

const groupLogsByType = (logs: ActivityLog[]): Record<string, number> => {
  return logs.reduce((acc, log) => {
    acc[log.typeId] = (acc[log.typeId] ?? 0) + log.minutes
    return acc
  }, {} as Record<string, number>)
}

const buildTopActivities = (
  logs: ActivityLog[],
  types: ActivityType[],
  domain: Domain,
): { typeId: string; name: string; minutes: number }[] => {
  const domainLogs = logs.filter((log) => log.domain === domain)
  if (domainLogs.length === 0) return []
  const minutesByType = groupLogsByType(domainLogs)
  return Object.entries(minutesByType)
    .map(([typeId, minutes]) => {
      const type = types.find((item) => item.id === typeId)
      return { typeId, name: type?.name ?? "Unknown", minutes }
    })
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 3)
}

const computeDaySummary = (
  dateKey: string,
  logs: ActivityLog[],
  deliverables: Deliverable[],
  focus: DailyFocus,
  recovery: DailyRecovery,
  targets: Targets,
  types: ActivityType[],
): DaySummary => {
  const sortedDeliverables = [...deliverables].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const domainMinutes = sumMinutesByDomain(logs)
  const completion = computeDomainCompletion(domainMinutes, recovery, targets)

  const plannedPoints = sortedDeliverables.reduce((sum, item) => sum + item.pointsPlanned, 0)
  const donePoints = sortedDeliverables
    .filter((item) => item.isDone)
    .reduce((sum, item) => sum + item.pointsPlanned, 0)
  const outputScore = computeOutputScore(plannedPoints, donePoints)

  const { primeScore, baseScore, buildModifier, drivers } = computePrimeScore({
    outputScore,
    focusScore: focus.focusScore,
    recoveryScore: completion.completion.recovery,
    buildCompletion: completion.completion.build,
  })

  const completionAverage = computeCompletionAverage(completion.completionDisplay)

  const domains: Record<Domain, DaySummary["domains"][Domain]> = {
    brain: {
      domain: "brain",
      minutes: domainMinutes.brain,
      target: targets.brain,
      completion: completion.completion.brain,
      completionDisplay: completion.completionDisplay.brain,
      topActivities: buildTopActivities(logs, types, "brain"),
    },
    build: {
      domain: "build",
      minutes: domainMinutes.build,
      target: targets.build,
      completion: completion.completion.build,
      completionDisplay: completion.completionDisplay.build,
      topActivities: buildTopActivities(logs, types, "build"),
    },
    body: {
      domain: "body",
      minutes: domainMinutes.body,
      target: targets.body,
      completion: completion.completion.body,
      completionDisplay: completion.completionDisplay.body,
      topActivities: buildTopActivities(logs, types, "body"),
    },
    recovery: {
      domain: "recovery",
      minutes: domainMinutes.recovery,
      target: targets.recovery,
      completion: completion.completion.recovery,
      completionDisplay: completion.completionDisplay.recovery,
      topActivities: buildTopActivities(logs, types, "recovery"),
    },
  }

  return {
    dateKey,
    primeScore,
    primeBaseScore: baseScore,
    buildModifier,
    drivers,
    completionAverage,
    outputScore,
    focusScore: focus.focusScore,
    recoveryScore: completion.completion.recovery,
    domains,
    deliverables: sortedDeliverables,
    focus,
    recovery,
  }
}

const mapByDateKey = <T extends { dateKey: string }>(items: T[]): Record<string, T> => {
  return items.reduce((acc, item) => {
    acc[item.dateKey] = item
    return acc
  }, {} as Record<string, T>)
}

const groupByDateKey = <T extends { dateKey: string }>(items: T[]): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    if (!acc[item.dateKey]) acc[item.dateKey] = []
    acc[item.dateKey].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export class IndexedDbProvider implements DataProvider {
  async getActivityTypes() {
    await ensureSeeded()
    return getAll(STORES.activityTypes)
  }

  async getTargets() {
    await ensureSeeded()
    const targets = await getByKey(STORES.targets, "default")
    return (targets ?? DEFAULT_TARGETS) as Targets
  }

  async updateTargets(partial: Partial<Targets>) {
    const current = await this.getTargets()
    const next = { ...current, ...partial, id: "default" }
    await put(STORES.targets, next)
    return next
  }

  async getProfile() {
    await ensureSeeded()
    const profile = await getByKey(STORES.profile, "local")
    return (profile ?? DEFAULT_PROFILE) as UserProfile
  }

  async updateProfile(partial: Partial<UserProfile>) {
    const current = await this.getProfile()
    const next = { ...current, ...partial, id: "local" }
    await put(STORES.profile, next)
    return next
  }

  async getTodaySummary(dateKey: string) {
    await ensureSeeded()
    const targets = await this.getTargets()
    const types = await this.getActivityTypes()
    const [logs, deliverables, focus, recovery] = await Promise.all([
      getAllFromIndex(STORES.activityLogs, "dateKey", dateKey),
      getAllFromIndex(STORES.deliverables, "dateKey", dateKey),
      getByKey(STORES.dailyFocus, dateKey),
      getByKey(STORES.dailyRecovery, dateKey),
    ])

    const focusData = focus ?? buildDefaultFocus(dateKey)
    const recoveryData = recovery ?? buildDefaultRecovery(dateKey, targets)

    return computeDaySummary(
      dateKey,
      logs,
      deliverables,
      focusData,
      recoveryData,
      targets,
      types,
    )
  }

  async getWeekSummary(weekStartKey: string) {
    await ensureSeeded()
    const targets = await this.getTargets()
    const types = await this.getActivityTypes()

    const startDate = fromDateKey(weekStartKey)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    const endKey = toDateKey(endDate)

    const range = IDBKeyRange.bound(weekStartKey, endKey)

    const [logs, deliverables, focuses, recoveries] = await Promise.all([
      getAllFromIndex(STORES.activityLogs, "dateKey", range),
      getAllFromIndex(STORES.deliverables, "dateKey", range),
      getAllFromIndex(STORES.dailyFocus, "dateKey", range),
      getAllFromIndex(STORES.dailyRecovery, "dateKey", range),
    ])

    const focusMap = mapByDateKey(focuses)
    const recoveryMap = mapByDateKey(recoveries)
    const logsByDate = groupByDateKey(logs)
    const deliverablesByDate = groupByDateKey(deliverables)

    const dateKeys = buildDateKeyRange(weekStartKey, endKey)
    const days = dateKeys.map((key) => {
      const dayLogs = logsByDate[key] ?? []
      const dayDeliverables = deliverablesByDate[key] ?? []
      const focus = focusMap[key] ?? buildDefaultFocus(key)
      const recovery = recoveryMap[key] ?? buildDefaultRecovery(key, targets)
      return computeDaySummary(key, dayLogs, dayDeliverables, focus, recovery, targets, types)
    })

    const averagePrime = Math.round(
      days.reduce((sum, day) => sum + day.primeScore, 0) / days.length,
    )
    const averageCompletion = Math.round(
      days.reduce((sum, day) => sum + day.completionAverage, 0) / days.length,
    )
    const averageDomains = DOMAIN_ORDER.reduce((acc, domain) => {
      acc[domain] =
        Math.round(
          days.reduce((sum, day) => sum + day.domains[domain].completionDisplay, 0) /
            days.length,
        )
      return acc
    }, {} as Record<Domain, number>)

    const bestDay = days.reduce((best, day) => (day.primeScore > best.primeScore ? day : best), days[0])

    const currentStreak = days.reduce((streak, day) => (day.primeScore > 0 ? streak + 1 : 0), 0)

    const trendEnd = endDate
    const trendStart = new Date(trendEnd)
    trendStart.setDate(trendEnd.getDate() - 29)
    const trendRange = IDBKeyRange.bound(toDateKey(trendStart), toDateKey(trendEnd))
    const [trendLogs, trendDeliverables, trendFocus, trendRecovery] = await Promise.all([
      getAllFromIndex(STORES.activityLogs, "dateKey", trendRange),
      getAllFromIndex(STORES.deliverables, "dateKey", trendRange),
      getAllFromIndex(STORES.dailyFocus, "dateKey", trendRange),
      getAllFromIndex(STORES.dailyRecovery, "dateKey", trendRange),
    ])
    const trendFocusMap = mapByDateKey(trendFocus)
    const trendRecoveryMap = mapByDateKey(trendRecovery)
    const trendLogsByDate = groupByDateKey(trendLogs)
    const trendDeliverablesByDate = groupByDateKey(trendDeliverables)
    const trendKeys = buildDateKeyRange(toDateKey(trendStart), toDateKey(trendEnd))
    const trend = trendKeys.map((key) => {
      const dayLogs = trendLogsByDate[key] ?? []
      const dayDeliverables = trendDeliverablesByDate[key] ?? []
      const focus = trendFocusMap[key] ?? buildDefaultFocus(key)
      const recovery = trendRecoveryMap[key] ?? buildDefaultRecovery(key, targets)
      const summary = computeDaySummary(key, dayLogs, dayDeliverables, focus, recovery, targets, types)
      return {
        dateKey: key,
        label: fromDateKey(key).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        primeScore: summary.primeScore,
        completionAverage: summary.completionAverage,
        brain: summary.domains.brain.completionDisplay,
        build: summary.domains.build.completionDisplay,
        body: summary.domains.body.completionDisplay,
        recovery: summary.domains.recovery.completionDisplay,
      }
    })

    return {
      weekStartKey,
      days,
      averagePrime,
      averageCompletion,
      averageDomains,
      bestDay,
      currentStreak,
      trend,
    }
  }

  async getHistoryMonth(year: number, month: number) {
    await ensureSeeded()
    const targets = await this.getTargets()
    const types = await this.getActivityTypes()

    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)

    const range = IDBKeyRange.bound(toDateKey(monthStart), toDateKey(monthEnd))

    const [logs, deliverables, focuses, recoveries] = await Promise.all([
      getAllFromIndex(STORES.activityLogs, "dateKey", range),
      getAllFromIndex(STORES.deliverables, "dateKey", range),
      getAllFromIndex(STORES.dailyFocus, "dateKey", range),
      getAllFromIndex(STORES.dailyRecovery, "dateKey", range),
    ])

    const focusMap = mapByDateKey(focuses)
    const recoveryMap = mapByDateKey(recoveries)

    const days = buildDateKeyRange(toDateKey(monthStart), toDateKey(monthEnd))

    const result: HistoryMonthData["days"] = {}
    days.forEach((key) => {
      const dayLogs = logsByDate[key] ?? []
      const dayDeliverables = deliverablesByDate[key] ?? []
      const focus = focusMap[key] ?? buildDefaultFocus(key)
      const recovery = recoveryMap[key] ?? buildDefaultRecovery(key, targets)
      const summary = computeDaySummary(key, dayLogs, dayDeliverables, focus, recovery, targets, types)
      result[key] = {
        primeScore: summary.primeScore,
        completionAverage: summary.completionAverage,
        brain: summary.domains.brain.completionDisplay,
        build: summary.domains.build.completionDisplay,
        body: summary.domains.body.completionDisplay,
        recovery: summary.domains.recovery.completionDisplay,
      }
    })

    return {
      year,
      month,
      days: result,
    }
  }

  async getRangeSummary(startKey: string, endKey: string) {
    await ensureSeeded()
    const targets = await this.getTargets()
    const types = await this.getActivityTypes()

    const [start, end] = clampDateRange(startKey, endKey)
    const range = IDBKeyRange.bound(start, end)
    const [logs, deliverables, focuses, recoveries] = await Promise.all([
      getAllFromIndex(STORES.activityLogs, "dateKey", range),
      getAllFromIndex(STORES.deliverables, "dateKey", range),
      getAllFromIndex(STORES.dailyFocus, "dateKey", range),
      getAllFromIndex(STORES.dailyRecovery, "dateKey", range),
    ])

    const focusMap = mapByDateKey(focuses)
    const recoveryMap = mapByDateKey(recoveries)
    const logsByDate = groupByDateKey(logs)
    const deliverablesByDate = groupByDateKey(deliverables)

    const days = buildDateKeyRange(start, end).map((key) => {
      const dayLogs = logsByDate[key] ?? []
      const dayDeliverables = deliverablesByDate[key] ?? []
      const focus = focusMap[key] ?? buildDefaultFocus(key)
      const recovery = recoveryMap[key] ?? buildDefaultRecovery(key, targets)
      return computeDaySummary(key, dayLogs, dayDeliverables, focus, recovery, targets, types)
    })

    const totalDays = days.length
    const averagePrime = Math.round(days.reduce((sum, day) => sum + day.primeScore, 0) / totalDays)
    const averageCompletion = Math.round(
      days.reduce((sum, day) => sum + day.completionAverage, 0) / totalDays,
    )
    const averageDomains = DOMAIN_ORDER.reduce((acc, domain) => {
      acc[domain] = Math.round(
        days.reduce((sum, day) => sum + day.domains[domain].completionDisplay, 0) / totalDays,
      )
      return acc
    }, {} as Record<Domain, number>)
    const averageOutput = Math.round(days.reduce((sum, day) => sum + day.outputScore, 0) / totalDays)
    const averageFocus = Math.round(days.reduce((sum, day) => sum + day.focusScore, 0) / totalDays)
    const averageRecovery = Math.round(
      days.reduce((sum, day) => sum + day.recoveryScore, 0) / totalDays,
    )

    const totalDeliverablePoints = days.reduce(
      (sum, day) => sum + day.deliverables.reduce((sub, item) => sub + item.pointsPlanned, 0),
      0,
    )
    const doneDeliverablePoints = days.reduce(
      (sum, day) =>
        sum +
        day.deliverables.filter((item) => item.isDone).reduce((sub, item) => sub + item.pointsPlanned, 0),
      0,
    )

    const bestDay = days.reduce((best, day) => (day.primeScore > best.primeScore ? day : best), days[0])
    const worstDay = days.reduce((worst, day) => (day.primeScore < worst.primeScore ? day : worst), days[0])

    const currentStreak = days.reduce((streak, day) => (day.primeScore > 0 ? streak + 1 : 0), 0)

    return {
      startKey: start,
      endKey: end,
      totalDays,
      averagePrime,
      averageCompletion,
      averageDomains,
      averageOutput,
      averageFocus,
      averageRecovery,
      totalDeliverablePoints,
      doneDeliverablePoints,
      bestDay,
      worstDay,
      currentStreak,
      days,
    }
  }

  async addActivityLog(input: { dateKey: string; typeId: string; minutes: number; note?: string }) {
    await ensureSeeded()
    const types = await this.getActivityTypes()
    const type = types.find((item) => item.id === input.typeId)
    if (!type) return

    const log: ActivityLog = {
      id: generateId("log"),
      dateKey: input.dateKey,
      typeId: input.typeId,
      domain: type.domain,
      minutes: input.minutes,
      note: input.note,
      createdAt: new Date().toISOString(),
    }
    await put(STORES.activityLogs, log)
  }

  async upsertDailyFocus(input: Omit<DailyFocus, "updatedAt">) {
    await ensureSeeded()
    const focus: DailyFocus = {
      ...input,
      updatedAt: new Date().toISOString(),
    }
    await put(STORES.dailyFocus, focus)
  }

  async upsertDailyRecovery(input: Omit<DailyRecovery, "updatedAt">) {
    await ensureSeeded()
    const recovery: DailyRecovery = {
      ...input,
      updatedAt: new Date().toISOString(),
    }
    await put(STORES.dailyRecovery, recovery)
  }

  async addDeliverable(input: Omit<Deliverable, "id" | "createdAt" | "isDone">) {
    await ensureSeeded()
    const deliverable: Deliverable = {
      ...input,
      id: generateId("deliverable"),
      isDone: false,
      createdAt: new Date().toISOString(),
    }
    await put(STORES.deliverables, deliverable)
  }

  async toggleDeliverableDone(id: string, done: boolean) {
    await ensureSeeded()
    const existing = await getByKey(STORES.deliverables, id)
    if (!existing) return
    await put(STORES.deliverables, { ...existing, isDone: done })
  }

  async getAchievementsSummary() {
    await ensureSeeded()
    const targets = await this.getTargets()
    const types = await this.getActivityTypes()
    const [logs, deliverables, focuses, recoveries, unlocks] = await Promise.all([
      getAll(STORES.activityLogs),
      getAll(STORES.deliverables),
      getAll(STORES.dailyFocus),
      getAll(STORES.dailyRecovery),
      getAll(STORES.achievementUnlocks),
    ])
    const profile = await this.getProfile()

    const focusMap = mapByDateKey(focuses)
    const recoveryMap = mapByDateKey(recoveries)
    const logsByDate = groupByDateKey(logs)
    const deliverablesByDate = groupByDateKey(deliverables)

    const dateKeysSet = new Set<string>([
      ...Object.keys(logsByDate),
      ...Object.keys(deliverablesByDate),
      ...Object.keys(focusMap),
      ...Object.keys(recoveryMap),
    ])

    const summaryByKey: Record<string, DaySummary> = {}
    const dateKeys = Array.from(dateKeysSet).sort()

    dateKeys.forEach((key) => {
      const dayLogs = logsByDate[key] ?? []
      const dayDeliverables = deliverablesByDate[key] ?? []
      const focus = focusMap[key] ?? buildDefaultFocus(key)
      const recovery = recoveryMap[key] ?? buildDefaultRecovery(key, targets)
      summaryByKey[key] = computeDaySummary(
        key,
        dayLogs,
        dayDeliverables,
        focus,
        recovery,
        targets,
        types,
      )
    })

    const domainMinutesTotals = logs.reduce(
      (acc, log) => {
        acc[log.domain] += log.minutes
        return acc
      },
      { brain: 0, build: 0, body: 0, recovery: 0 } as Record<Domain, number>,
    )

    const domainDaysLogged = {
      brain: 0,
      build: 0,
      body: 0,
      recovery: 0,
    }

    Object.values(summaryByKey).forEach((summary) => {
      DOMAIN_ORDER.forEach((domain) => {
        if (summary.domains[domain].minutes > 0) {
          domainDaysLogged[domain] += 1
        }
      })
    })

    const deliverablePointsDone = deliverables
      .filter((item) => item.isDone)
      .reduce((sum, item) => sum + item.pointsPlanned, 0)
    const deliverablesCreated = deliverables.length
    const activityLogCount = logs.length

    const maxPrimeScore = Object.values(summaryByKey).reduce(
      (max, summary) => Math.max(max, summary.primeScore),
      0,
    )
    const maxOutputScore = Object.values(summaryByKey).reduce(
      (max, summary) => Math.max(max, summary.outputScore),
      0,
    )
    const maxDomainCompletion = DOMAIN_ORDER.reduce((acc, domain) => {
      acc[domain] = Object.values(summaryByKey).reduce(
        (max, summary) => Math.max(max, summary.domains[domain].completion),
        0,
      )
      return acc
    }, {} as Record<Domain, number>)

    const todayKey = toDateKey(new Date())
    const last7Keys = buildDateKeyRange(
      toDateKey(new Date(new Date().setDate(new Date().getDate() - 6))),
      todayKey,
    )
    const outputPointsLast7 = last7Keys.reduce((sum, key) => {
      const summary = summaryByKey[key]
      if (!summary) return sum
      return (
        sum +
        summary.deliverables
          .filter((item) => item.isDone)
          .reduce((sub, item) => sub + item.pointsPlanned, 0)
      )
    }, 0)

    const unlockMap = unlocks.reduce((acc, unlock) => {
      acc[unlock.id] = unlock.unlockedAt
      return acc
    }, {} as Record<string, string>)

    const { views, newlyUnlocked } = computeAchievementViews(
      ACHIEVEMENT_DEFINITIONS,
      {
        todayKey,
        summaryByKey,
        recoveryByKey: recoveryMap,
        domainMinutesTotals,
        domainDaysLogged,
        deliverablePointsDone,
        deliverablesCreated,
        activityLogCount,
        maxPrimeScore,
        maxOutputScore,
        maxDomainCompletion,
        outputPointsLast7,
        profile,
      },
      unlockMap,
    )

    if (newlyUnlocked.length > 0) {
      await bulkPut(
        STORES.achievementUnlocks,
        newlyUnlocked.map((item) => ({ id: item.id, unlockedAt: item.unlockedAt ?? todayKey })),
      )
    }

    const unlocked = views.filter((item) => item.unlockedAt)
    const mythic = views.filter((item) => item.category === "mythic")
    const impossiple = views.filter((item) => item.category === "impossiple")
    const nextUp = views
      .filter((item) => !item.unlockedAt && item.category !== "mythic" && item.category !== "impossiple")
      .sort((a, b) => b.progress / b.target - a.progress / a.target)

    return {
      total: views.length,
      unlockedCount: unlocked.length,
      unlocked,
      nextUp,
      mythic,
      impossiple,
      all: views,
    }
  }

  async getStatsSummary() {
    const achievements = await this.getAchievementsSummary()
    const targets = await this.getTargets()
    const types = await this.getActivityTypes()
    const [logs, deliverables, focuses, recoveries] = await Promise.all([
      getAll(STORES.activityLogs),
      getAll(STORES.deliverables),
      getAll(STORES.dailyFocus),
      getAll(STORES.dailyRecovery),
    ])

    const logsByDate = groupByDateKey(logs)
    const deliverablesByDate = groupByDateKey(deliverables)
    const focusMap = mapByDateKey(focuses)
    const recoveryMap = mapByDateKey(recoveries)

    const dateKeysSet = new Set<string>([
      ...Object.keys(logsByDate),
      ...Object.keys(deliverablesByDate),
      ...Object.keys(focusMap),
      ...Object.keys(recoveryMap),
    ])

    if (dateKeysSet.size === 0) {
      return {
        daysTracked: 0,
        currentStreak: 0,
        averagePrime: 0,
        achievementsUnlocked: achievements.unlockedCount,
        totalAchievements: achievements.total,
      }
    }

    const summaryByKey: Record<string, DaySummary> = {}
    Array.from(dateKeysSet)
      .sort()
      .forEach((key) => {
        const dayLogs = logsByDate[key] ?? []
        const dayDeliverables = deliverablesByDate[key] ?? []
        const focus = focusMap[key] ?? buildDefaultFocus(key)
        const recovery = recoveryMap[key] ?? buildDefaultRecovery(key, targets)
        summaryByKey[key] = computeDaySummary(
          key,
          dayLogs,
          dayDeliverables,
          focus,
          recovery,
          targets,
          types,
        )
      })

    const daysTracked = Object.keys(summaryByKey).length
    const averagePrime = Math.round(
      Object.values(summaryByKey).reduce((sum, day) => sum + day.primeScore, 0) / daysTracked,
    )

    const dateKeys = buildDateKeyRange(
      Object.keys(summaryByKey).sort()[0],
      toDateKey(new Date()),
    )
    let currentStreak = 0
    for (let i = dateKeys.length - 1; i >= 0; i -= 1) {
      const summary = summaryByKey[dateKeys[i]]
      if (!summary || summary.primeScore <= 0) break
      currentStreak += 1
    }

    return {
      daysTracked,
      currentStreak,
      averagePrime,
      achievementsUnlocked: achievements.unlockedCount,
      totalAchievements: achievements.total,
    }
  }

  async exportData(): Promise<ExportBundle> {
    await ensureSeeded()
    const [activityTypes, activityLogs, deliverables, dailyFocus, dailyRecovery, profile, targets, achievementUnlocks] =
      await Promise.all([
        getAll(STORES.activityTypes),
        getAll(STORES.activityLogs),
        getAll(STORES.deliverables),
        getAll(STORES.dailyFocus),
        getAll(STORES.dailyRecovery),
        getAll(STORES.profile),
        getAll(STORES.targets),
        getAll(STORES.achievementUnlocks),
      ])

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        activityTypes,
        activityLogs,
        deliverables,
        dailyFocus,
        dailyRecovery,
        profile,
        targets,
        achievementUnlocks,
      },
    }
  }

  async importData(bundle: ExportBundle) {
    if (!bundle || typeof bundle !== "object") return
    const data = (bundle as { data?: Record<string, unknown> }).data
    if (!data) return

    const activityTypes = (data.activityTypes as ActivityType[]) || []
    const activityLogs = (data.activityLogs as ActivityLog[]) || []
    const deliverables = (data.deliverables as Deliverable[]) || []
    const dailyFocus = (data.dailyFocus as DailyFocus[]) || []
    const dailyRecovery = (data.dailyRecovery as DailyRecovery[]) || []
    const profile = (data.profile as UserProfile[]) || []
    const targets = (data.targets as Targets[]) || []
    const achievementUnlocks = (data.achievementUnlocks as { id: string; unlockedAt: string }[]) || []

    await Promise.all([
      bulkPut(STORES.activityTypes, activityTypes),
      bulkPut(STORES.activityLogs, activityLogs),
      bulkPut(STORES.deliverables, deliverables),
      bulkPut(STORES.dailyFocus, dailyFocus),
      bulkPut(STORES.dailyRecovery, dailyRecovery),
      bulkPut(STORES.profile, profile),
      bulkPut(STORES.targets, targets),
      bulkPut(STORES.achievementUnlocks, achievementUnlocks),
    ])
  }
}

const provider = new IndexedDbProvider()

export const getDataProvider = () => provider
