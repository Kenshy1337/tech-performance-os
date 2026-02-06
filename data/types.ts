export type Domain = "brain" | "build" | "body" | "recovery"

export type Unit = "minutes" | "count"

export interface ActivityType {
  id: string
  name: string
  domain: Domain
  defaultUnit: Unit
  defaultTarget?: number
  isBuildCritical?: boolean
  createdAt: string
}

export interface ActivityLog {
  id: string
  dateKey: string
  typeId: string
  domain: Domain
  minutes: number
  note?: string
  createdAt: string
}

export interface Deliverable {
  id: string
  dateKey: string
  title: string
  domain: Domain
  pointsPlanned: number
  isDone: boolean
  createdAt: string
}

export interface DailyFocus {
  dateKey: string
  focusScore: number
  deepMinutes: number
  longestBlockMinutes: number
  switchesPerHour: number
  drivers: string[]
  updatedAt: string
}

export interface DailyRecovery {
  dateKey: string
  sleepHours: number
  sleepTargetHours: number
  energyScore: number
  mood?: number
  recoveryDrivers: string[]
  updatedAt: string
}

export interface Targets {
  id: string
  brain: number
  build: number
  body: number
  recovery: number
  sleepTargetHours: number
  recoverySleepWeightMinutes: number
}

export interface UserProfile {
  id: string
  nickname: string
  avatarDataUrl?: string
  heightCm?: number
  weightKg?: number
  timezone?: string
  countriesVisited?: number
  lifetimeEarningsUsd?: number
  netWorthUsd?: number
  charityDonatedUsd?: number
  companiesFounded?: number
  onboardingStatus?: "new" | "skipped" | "completed"
  onboardingCompletedAt?: string
}

export type Tier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "mythic"
  | "impossiple"
export type Category =
  | "consistency"
  | "volume"
  | "quality"
  | "build"
  | "mythic"
  | "impossiple"

export type ProfileMetric =
  | "countriesVisited"
  | "lifetimeEarningsUsd"
  | "netWorthUsd"
  | "charityDonatedUsd"
  | "companiesFounded"

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  tier: Tier
  category: Category
  kind:
    | "prime_avg"
    | "prime_streak"
    | "prime_best"
    | "domain_streak"
    | "domain_total_minutes"
    | "domain_days_logged"
    | "output_total_points"
    | "output_streak"
    | "output_avg"
    | "output_week_points"
    | "focus_streak"
    | "focus_avg"
    | "recovery_streak"
    | "recovery_avg"
    | "recovery_sleep_avg"
    | "all_domains_streak"
    | "days_tracked"
    | "domain_peak"
    | "output_day_score"
    | "build_bonus_days"
    | "activity_log_count"
    | "deliverables_created_count"
    | "profile_metric"
  domain?: Domain
  threshold?: number
  days?: number
  minutes?: number
  points?: number
  metric?: ProfileMetric
}

export interface AchievementProgress {
  id: string
  progress: number
  target: number
  unlockedAt?: string
}

export interface AchievementView extends AchievementProgress {
  title: string
  description: string
  tier: Tier
  category: Category
}

export interface AchievementsSummary {
  total: number
  unlockedCount: number
  unlocked: AchievementView[]
  nextUp: AchievementView[]
  mythic: AchievementView[]
  impossiple: AchievementView[]
  all: AchievementView[]
}

export interface AchievementUnlock {
  id: string
  unlockedAt: string
}

export interface ActivitySummaryItem {
  typeId: string
  name: string
  minutes: number
}

export interface DomainSummary {
  domain: Domain
  minutes: number
  target: number
  completion: number
  completionDisplay: number
  topActivities: ActivitySummaryItem[]
}

export interface DaySummary {
  dateKey: string
  primeScore: number
  primeBaseScore: number
  buildModifier: number
  drivers: string[]
  completionAverage: number
  outputScore: number
  focusScore: number
  recoveryScore: number
  domains: Record<Domain, DomainSummary>
  deliverables: Deliverable[]
  focus: DailyFocus
  recovery: DailyRecovery
}

export interface WeekSummary {
  weekStartKey: string
  days: DaySummary[]
  averagePrime: number
  averageCompletion: number
  averageDomains: Record<Domain, number>
  bestDay?: DaySummary
  currentStreak: number
  trend: DayTrendPoint[]
}

export interface DayTrendPoint {
  dateKey: string
  label: string
  primeScore: number
  completionAverage: number
  brain: number
  build: number
  body: number
  recovery: number
}

export interface HistoryMonthData {
  year: number
  month: number
  days: Record<
    string,
    {
      primeScore: number
      completionAverage: number
      brain: number
      build: number
      body: number
      recovery: number
    }
  >
}

export interface RangeSummary {
  startKey: string
  endKey: string
  totalDays: number
  averagePrime: number
  averageCompletion: number
  averageDomains: Record<Domain, number>
  averageOutput: number
  averageFocus: number
  averageRecovery: number
  totalDeliverablePoints: number
  doneDeliverablePoints: number
  bestDay?: DaySummary
  worstDay?: DaySummary
  currentStreak: number
  days: DaySummary[]
}

export interface StatsSummary {
  daysTracked: number
  currentStreak: number
  averagePrime: number
  achievementsUnlocked: number
  totalAchievements: number
}

export interface ExportBundle {
  version: number
  exportedAt: string
  data: {
    activityTypes: ActivityType[]
    activityLogs: ActivityLog[]
    deliverables: Deliverable[]
    dailyFocus: DailyFocus[]
    dailyRecovery: DailyRecovery[]
    profile: UserProfile[]
    targets: Targets[]
    achievementUnlocks: AchievementUnlock[]
  }
}
