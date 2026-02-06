import {
  AchievementDefinition,
  AchievementView,
  DailyRecovery,
  DaySummary,
  Domain,
  ProfileMetric,
  UserProfile,
} from "../types"
import { buildDateKeyRange, fromDateKey, toDateKey } from "../date"

export interface AchievementStats {
  todayKey: string
  summaryByKey: Record<string, DaySummary>
  recoveryByKey: Record<string, DailyRecovery>
  domainMinutesTotals: Record<Domain, number>
  domainDaysLogged: Record<Domain, number>
  deliverablePointsDone: number
  deliverablesCreated: number
  activityLogCount: number
  maxPrimeScore: number
  maxOutputScore: number
  maxDomainCompletion: Record<Domain, number>
  outputPointsLast7: number
  profile: UserProfile
}

const getWindowKeys = (todayKey: string, days: number): string[] => {
  const endKey = todayKey
  const baseDate = fromDateKey(todayKey)
  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - (days - 1))
  const startKey = toDateKey(startDate)
  return buildDateKeyRange(startKey, endKey)
}

const averageForKeys = (
  keys: string[],
  summaryByKey: Record<string, DaySummary>,
  accessor: (summary: DaySummary) => number,
): number => {
  if (keys.length === 0) return 0
  const total = keys.reduce((sum, key) => {
    const summary = summaryByKey[key]
    return sum + (summary ? accessor(summary) : 0)
  }, 0)
  return total / keys.length
}

const averageSleepForKeys = (
  keys: string[],
  recoveryByKey: Record<string, DailyRecovery>,
): number => {
  if (keys.length === 0) return 0
  const total = keys.reduce((sum, key) => {
    const recovery = recoveryByKey[key]
    return sum + (recovery ? recovery.sleepHours : 0)
  }, 0)
  return total / keys.length
}

const currentStreak = (
  dateKeys: string[],
  summaryByKey: Record<string, DaySummary>,
  predicate: (summary: DaySummary) => boolean,
): number => {
  let streak = 0
  for (let i = dateKeys.length - 1; i >= 0; i -= 1) {
    const summary = summaryByKey[dateKeys[i]]
    if (!summary || !predicate(summary)) break
    streak += 1
  }
  return streak
}

export function computeAchievementViews(
  definitions: AchievementDefinition[],
  stats: AchievementStats,
  unlockedAtMap: Record<string, string | undefined>,
): { views: AchievementView[]; newlyUnlocked: AchievementView[] } {
  const dateKeys = buildDateKeyRange(
    stats.summaryByKey && Object.keys(stats.summaryByKey).length > 0
      ? Object.keys(stats.summaryByKey).sort()[0]
      : stats.todayKey,
    stats.todayKey,
  )

  const views: AchievementView[] = []
  const newlyUnlocked: AchievementView[] = []

  definitions.forEach((definition) => {
    let progress = 0
    let target = 0

    switch (definition.kind) {
      case "prime_avg": {
        const window = getWindowKeys(stats.todayKey, definition.days ?? 7)
        progress = averageForKeys(window, stats.summaryByKey, (s) => s.primeScore)
        target = definition.threshold ?? 0
        break
      }
      case "prime_best": {
        progress = stats.maxPrimeScore
        target = definition.threshold ?? 0
        break
      }
      case "prime_streak": {
        target = definition.days ?? 0
        progress = currentStreak(dateKeys, stats.summaryByKey, (s) => s.primeScore >= (definition.threshold ?? 0))
        break
      }
      case "domain_streak": {
        target = definition.days ?? 0
        progress = currentStreak(dateKeys, stats.summaryByKey, (s) =>
          s.domains[definition.domain as Domain].completion >= (definition.threshold ?? 0),
        )
        break
      }
      case "domain_total_minutes": {
        target = definition.minutes ?? 0
        progress = stats.domainMinutesTotals[definition.domain as Domain]
        break
      }
      case "domain_days_logged": {
        target = definition.days ?? 0
        progress = stats.domainDaysLogged[definition.domain as Domain]
        break
      }
      case "output_total_points": {
        target = definition.points ?? 0
        progress = stats.deliverablePointsDone
        break
      }
      case "output_streak": {
        target = definition.days ?? 0
        progress = currentStreak(dateKeys, stats.summaryByKey, (s) => s.outputScore > 0)
        break
      }
      case "output_avg": {
        const window = getWindowKeys(stats.todayKey, definition.days ?? 7)
        progress = averageForKeys(window, stats.summaryByKey, (s) => s.outputScore)
        target = definition.threshold ?? 0
        break
      }
      case "output_week_points": {
        target = definition.points ?? 0
        progress = stats.outputPointsLast7
        break
      }
      case "focus_streak": {
        target = definition.days ?? 0
        progress = currentStreak(dateKeys, stats.summaryByKey, (s) => s.focusScore >= (definition.threshold ?? 0))
        break
      }
      case "focus_avg": {
        const window = getWindowKeys(stats.todayKey, definition.days ?? 7)
        progress = averageForKeys(window, stats.summaryByKey, (s) => s.focusScore)
        target = definition.threshold ?? 0
        break
      }
      case "recovery_streak": {
        target = definition.days ?? 0
        progress = currentStreak(dateKeys, stats.summaryByKey, (s) => s.recoveryScore >= (definition.threshold ?? 0))
        break
      }
      case "recovery_avg": {
        const window = getWindowKeys(stats.todayKey, definition.days ?? 7)
        progress = averageForKeys(window, stats.summaryByKey, (s) => s.recoveryScore)
        target = definition.threshold ?? 0
        break
      }
      case "recovery_sleep_avg": {
        const window = getWindowKeys(stats.todayKey, definition.days ?? 7)
        progress = averageSleepForKeys(window, stats.recoveryByKey)
        target = definition.threshold ?? 0
        break
      }
      case "all_domains_streak": {
        target = definition.days ?? 0
        progress = currentStreak(dateKeys, stats.summaryByKey, (s) =>
          (Object.keys(s.domains) as Domain[]).every(
            (domain) => s.domains[domain].completion >= (definition.threshold ?? 0),
          ),
        )
        break
      }
      case "days_tracked": {
        target = definition.days ?? 0
        progress = Object.keys(stats.summaryByKey).length
        break
      }
      case "domain_peak": {
        target = definition.threshold ?? 0
        progress = stats.maxDomainCompletion[definition.domain as Domain]
        break
      }
      case "output_day_score": {
        target = definition.threshold ?? 0
        progress = stats.maxOutputScore
        break
      }
      case "build_bonus_days": {
        target = definition.days ?? 0
        progress = currentStreak(dateKeys, stats.summaryByKey, (s) => s.domains.build.completion >= 100)
        break
      }
      case "activity_log_count": {
        target = definition.threshold ?? 0
        progress = stats.activityLogCount
        break
      }
      case "deliverables_created_count": {
        target = definition.threshold ?? 0
        progress = stats.deliverablesCreated
        break
      }
      case "profile_metric": {
        target = definition.threshold ?? 0
        const metric = definition.metric as ProfileMetric | undefined
        if (metric && stats.profile && metric in stats.profile) {
          const value = stats.profile[metric]
          progress = typeof value === "number" ? value : 0
        } else {
          progress = 0
        }
        break
      }
      default:
        progress = 0
        target = definition.threshold ?? definition.days ?? 0
    }

    const unlockedAt = unlockedAtMap[definition.id]
    const achieved = progress >= target && target > 0

    const view: AchievementView = {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      tier: definition.tier,
      category: definition.category,
      progress: Math.round(progress * 10) / 10,
      target,
      unlockedAt: unlockedAt || (achieved ? stats.todayKey : undefined),
    }

    if (!unlockedAt && achieved) {
      newlyUnlocked.push(view)
    }

    views.push(view)
  })

  return { views, newlyUnlocked }
}
