import { AchievementDefinition, Domain, Tier } from "../types"

const tierScale4: Tier[] = ["bronze", "silver", "gold", "platinum"]
const tierScale5: Tier[] = ["bronze", "silver", "gold", "platinum", "diamond"]
const tierScale6: Tier[] = [
  "bronze",
  "silver",
  "silver",
  "gold",
  "platinum",
  "diamond",
]
const tierScale7: Tier[] = [
  "bronze",
  "silver",
  "silver",
  "gold",
  "gold",
  "platinum",
  "diamond",
]

const tierForIndex = (index: number, total: number): Tier => {
  if (total <= 4) return tierScale4[index] || "diamond"
  if (total === 5) return tierScale5[index] || "diamond"
  if (total === 6) return tierScale6[index] || "diamond"
  return tierScale7[index] || "diamond"
}

const domainLabel: Record<Domain, string> = {
  brain: "Brain",
  build: "Build",
  body: "Body",
  recovery: "Recovery",
}

const achievements: AchievementDefinition[] = []

const push = (def: AchievementDefinition) => {
  achievements.push(def)
}

const primeAvgWindows = [7, 14, 30, 60, 90]
const primeAvgThresholds = [60, 70, 80, 90]
primeAvgWindows.forEach((days) => {
  primeAvgThresholds.forEach((threshold, index) => {
    push({
      id: `prime-avg-${days}-${threshold}`,
      title: `Prime Steady ${threshold}`,
      description: `Average Prime Score of ${threshold}+ over ${days} days`,
      tier: tierForIndex(index, primeAvgThresholds.length),
      category: "consistency",
      kind: "prime_avg",
      days,
      threshold,
    })
  })
})

const primeStreakThresholds = [70, 80, 90]
const primeStreakLengths = [3, 7, 14, 30, 60]
primeStreakThresholds.forEach((threshold) => {
  primeStreakLengths.forEach((days, index) => {
    push({
      id: `prime-streak-${threshold}-${days}`,
      title: `Prime Streak ${threshold}`,
      description: `Prime Score ${threshold}+ for ${days} consecutive days`,
      tier: tierForIndex(index, primeStreakLengths.length),
      category: "consistency",
      kind: "prime_streak",
      days,
      threshold,
    })
  })
})

const allDomainsLengths = [3, 7, 14, 30, 60]
allDomainsLengths.forEach((days, index) => {
  push({
    id: `all-domains-${days}`,
    title: `Full Stack ${days}`,
    description: `All 4 domains at 80%+ for ${days} days`,
    tier: tierForIndex(index, allDomainsLengths.length),
    category: "consistency",
    kind: "all_domains_streak",
    days,
    threshold: 80,
  })
})

const daysTracked = [7, 14, 30, 60, 90, 180, 365, 500]
daysTracked.forEach((days, index) => {
  push({
    id: `days-tracked-${days}`,
    title: `On The Grid ${days}`,
    description: `Track ${days} total days`,
    tier: tierForIndex(index, daysTracked.length),
    category: "consistency",
    kind: "days_tracked",
    days,
  })
})

const domainStreakLengths = [3, 7, 14, 30, 60]
;(Object.keys(domainLabel) as Domain[]).forEach((domain) => {
  domainStreakLengths.forEach((days, index) => {
    push({
      id: `domain-streak-${domain}-${days}`,
      title: `${domainLabel[domain]} Rhythm ${days}`,
      description: `${domainLabel[domain]} at 80%+ for ${days} days`,
      tier: tierForIndex(index, domainStreakLengths.length),
      category: "consistency",
      kind: "domain_streak",
      domain,
      days,
      threshold: 80,
    })
  })
})

const domainMinutesThresholds = [300, 600, 1200, 2400, 4800]
;(Object.keys(domainLabel) as Domain[]).forEach((domain) => {
  domainMinutesThresholds.forEach((minutes, index) => {
    push({
      id: `domain-minutes-${domain}-${minutes}`,
      title: `${domainLabel[domain]} Volume ${Math.round(minutes / 60)}h`,
      description: `Accumulate ${Math.round(minutes / 60)} hours in ${domainLabel[domain]}`,
      tier: tierForIndex(index, domainMinutesThresholds.length),
      category: "volume",
      kind: "domain_total_minutes",
      domain,
      minutes,
    })
  })
})

const domainPeakThresholds = [100, 120, 150, 180]
;(Object.keys(domainLabel) as Domain[]).forEach((domain) => {
  domainPeakThresholds.forEach((threshold, index) => {
    push({
      id: `domain-peak-${domain}-${threshold}`,
      title: `${domainLabel[domain]} Peak ${threshold}%`,
      description: `${domainLabel[domain]} completion hits ${threshold}% in a day`,
      tier: tierForIndex(index, domainPeakThresholds.length),
      category: "quality",
      kind: "domain_peak",
      domain,
      threshold,
    })
  })
})

const outputTotalPoints = [20, 50, 100, 200, 400, 800, 1200]
outputTotalPoints.forEach((points, index) => {
  push({
    id: `output-total-${points}`,
    title: `Output Bank ${points}`,
    description: `Earn ${points} deliverable points total`,
    tier: tierForIndex(index, outputTotalPoints.length),
    category: "build",
    kind: "output_total_points",
    points,
  })
})

const outputStreakLengths = [3, 7, 14, 30]
outputStreakLengths.forEach((days, index) => {
  push({
    id: `output-streak-${days}`,
    title: `Ship Streak ${days}`,
    description: `Complete deliverables for ${days} days straight`,
    tier: tierForIndex(index, outputStreakLengths.length),
    category: "build",
    kind: "output_streak",
    days,
  })
})

const outputDayScores = [100, 150, 200]
outputDayScores.forEach((threshold, index) => {
  push({
    id: `output-day-${threshold}`,
    title: `Output Surge ${threshold}`,
    description: `Hit Output Score ${threshold}+ in a single day`,
    tier: tierForIndex(index, outputDayScores.length),
    category: "build",
    kind: "output_day_score",
    threshold,
  })
})

const buildBonusDays = [3, 7, 14, 30, 60, 90]
buildBonusDays.forEach((days, index) => {
  push({
    id: `build-bonus-${days}`,
    title: `Build Critical ${days}`,
    description: `Build at 100%+ for ${days} days`,
    tier: tierForIndex(index, buildBonusDays.length),
    category: "build",
    kind: "build_bonus_days",
    days,
  })
})

const focusStreakThresholds = [70, 80, 90]
const focusStreakLengths = [3, 7, 14, 30]
focusStreakThresholds.forEach((threshold) => {
  focusStreakLengths.forEach((days, index) => {
    push({
      id: `focus-streak-${threshold}-${days}`,
      title: `Focus ${threshold} x${days}`,
      description: `Focus Score ${threshold}+ for ${days} days`,
      tier: tierForIndex(index, focusStreakLengths.length),
      category: "quality",
      kind: "focus_streak",
      days,
      threshold,
    })
  })
})

const recoveryStreakThresholds = [70, 80, 90]
const recoveryStreakLengths = [3, 7, 14, 30]
recoveryStreakThresholds.forEach((threshold) => {
  recoveryStreakLengths.forEach((days, index) => {
    push({
      id: `recovery-streak-${threshold}-${days}`,
      title: `Recovery ${threshold} x${days}`,
      description: `Recovery Score ${threshold}+ for ${days} days`,
      tier: tierForIndex(index, recoveryStreakLengths.length),
      category: "quality",
      kind: "recovery_streak",
      days,
      threshold,
    })
  })
})

const focusAvgWindows = [7, 30, 90]
const focusAvgThresholds = [70, 80, 90]
focusAvgWindows.forEach((days) => {
  focusAvgThresholds.forEach((threshold, index) => {
    push({
      id: `focus-avg-${days}-${threshold}`,
      title: `Focus Mean ${threshold}`,
      description: `Average Focus ${threshold}+ over ${days} days`,
      tier: tierForIndex(index, focusAvgThresholds.length),
      category: "quality",
      kind: "focus_avg",
      days,
      threshold,
    })
  })
})

const recoveryAvgWindows = [7, 30, 90]
const recoveryAvgThresholds = [70, 80, 90]
recoveryAvgWindows.forEach((days) => {
  recoveryAvgThresholds.forEach((threshold, index) => {
    push({
      id: `recovery-avg-${days}-${threshold}`,
      title: `Recovery Mean ${threshold}`,
      description: `Average Recovery ${threshold}+ over ${days} days`,
      tier: tierForIndex(index, recoveryAvgThresholds.length),
      category: "quality",
      kind: "recovery_avg",
      days,
      threshold,
    })
  })
})

const recoverySleepAvgThresholds = [7, 7.5, 8]
const recoverySleepAvgWindows = [7, 30, 90]
recoverySleepAvgWindows.forEach((days) => {
  recoverySleepAvgThresholds.forEach((threshold, index) => {
    push({
      id: `sleep-avg-${days}-${threshold}`,
      title: `Sleep ${threshold}h Avg`,
      description: `Average ${threshold}h sleep over ${days} days`,
      tier: tierForIndex(index, recoverySleepAvgThresholds.length),
      category: "quality",
      kind: "recovery_sleep_avg",
      days,
      threshold,
    })
  })
})

const outputAvgWindows = [7, 30, 90]
const outputAvgThresholds = [50, 70, 90]
outputAvgWindows.forEach((days) => {
  outputAvgThresholds.forEach((threshold, index) => {
    push({
      id: `output-avg-${days}-${threshold}`,
      title: `Output Mean ${threshold}`,
      description: `Average Output ${threshold}+ over ${days} days`,
      tier: tierForIndex(index, outputAvgThresholds.length),
      category: "build",
      kind: "output_avg",
      days,
      threshold,
    })
  })
})

const outputWeekPoints = [10, 25, 50]
outputWeekPoints.forEach((points, index) => {
  push({
    id: `output-week-${points}`,
    title: `Weekly Ship ${points}`,
    description: `Earn ${points} deliverable points in 7 days`,
    tier: tierForIndex(index, outputWeekPoints.length),
    category: "build",
    kind: "output_week_points",
    points,
  })
})

const domainDaysLogged = [7, 30, 90, 180, 365]
;(Object.keys(domainLabel) as Domain[]).forEach((domain) => {
  domainDaysLogged.forEach((days, index) => {
    push({
      id: `domain-days-${domain}-${days}`,
      title: `${domainLabel[domain]} Days ${days}`,
      description: `Log ${domainLabel[domain]} activity on ${days} days`,
      tier: tierForIndex(index, domainDaysLogged.length),
      category: "volume",
      kind: "domain_days_logged",
      domain,
      days,
    })
  })
})

const activityLogCounts = [25, 50, 100, 200]
activityLogCounts.forEach((count, index) => {
  push({
    id: `activity-logs-${count}`,
    title: `Signal Logs ${count}`,
    description: `Capture ${count} activity logs`,
    tier: tierForIndex(index, activityLogCounts.length),
    category: "volume",
    kind: "activity_log_count",
    threshold: count,
  })
})

const deliverableCounts = [10, 25, 50, 100]
deliverableCounts.forEach((count, index) => {
  push({
    id: `deliverables-${count}`,
    title: `Deliverable ${count}`,
    description: `Create ${count} deliverables`,
    tier: tierForIndex(index, deliverableCounts.length),
    category: "build",
    kind: "deliverables_created_count",
    threshold: count,
  })
})

const primeBestThresholds = [80, 90, 100]
primeBestThresholds.forEach((threshold, index) => {
  push({
    id: `prime-best-${threshold}`,
    title: `Prime Peak ${threshold}`,
    description: `Hit Prime Score ${threshold}+ in a day`,
    tier: tierForIndex(index, primeBestThresholds.length),
    category: "quality",
    kind: "prime_best",
    threshold,
  })
})

const mythic: AchievementDefinition[] = [
  {
    id: "mythic-prime-90-60",
    title: "Iron Will",
    description: "Prime Score 90+ for 60 consecutive days",
    tier: "mythic",
    category: "mythic",
    kind: "prime_streak",
    days: 60,
    threshold: 90,
  },
  {
    id: "mythic-prime-85-120",
    title: "Diamond Circuit",
    description: "Prime Score 85+ for 120 consecutive days",
    tier: "mythic",
    category: "mythic",
    kind: "prime_streak",
    days: 120,
    threshold: 85,
  },
  {
    id: "mythic-all-100-30",
    title: "Perfect Balance",
    description: "All 4 domains at 100% for 30 days",
    tier: "mythic",
    category: "mythic",
    kind: "all_domains_streak",
    days: 30,
    threshold: 100,
  },
  {
    id: "mythic-all-90-60",
    title: "Equilibrium",
    description: "All 4 domains at 90% for 60 days",
    tier: "mythic",
    category: "mythic",
    kind: "all_domains_streak",
    days: 60,
    threshold: 90,
  },
  {
    id: "mythic-build-100",
    title: "Ship Every Day",
    description: "Build at 80%+ for 100 consecutive days",
    tier: "mythic",
    category: "mythic",
    kind: "domain_streak",
    domain: "build",
    days: 100,
    threshold: 80,
  },
  {
    id: "mythic-brain-90",
    title: "Mindforge",
    description: "Brain at 80%+ for 90 consecutive days",
    tier: "mythic",
    category: "mythic",
    kind: "domain_streak",
    domain: "brain",
    days: 90,
    threshold: 80,
  },
  {
    id: "mythic-body-90",
    title: "Titan Frame",
    description: "Body at 80%+ for 90 consecutive days",
    tier: "mythic",
    category: "mythic",
    kind: "domain_streak",
    domain: "body",
    days: 90,
    threshold: 80,
  },
  {
    id: "mythic-recovery-90",
    title: "Deep Recharge",
    description: "Recovery at 80%+ for 90 consecutive days",
    tier: "mythic",
    category: "mythic",
    kind: "domain_streak",
    domain: "recovery",
    days: 90,
    threshold: 80,
  },
  {
    id: "mythic-build-volume",
    title: "Master Builder",
    description: "Accumulate 1000 hours of Build",
    tier: "mythic",
    category: "mythic",
    kind: "domain_total_minutes",
    domain: "build",
    minutes: 60000,
  },
  {
    id: "mythic-brain-volume",
    title: "Cortex Archive",
    description: "Accumulate 800 hours of Brain work",
    tier: "mythic",
    category: "mythic",
    kind: "domain_total_minutes",
    domain: "brain",
    minutes: 48000,
  },
  {
    id: "mythic-body-volume",
    title: "Iron Engine",
    description: "Accumulate 300 hours of Body work",
    tier: "mythic",
    category: "mythic",
    kind: "domain_total_minutes",
    domain: "body",
    minutes: 18000,
  },
  {
    id: "mythic-recovery-volume",
    title: "Restored",
    description: "Accumulate 300 hours of Recovery",
    tier: "mythic",
    category: "mythic",
    kind: "domain_total_minutes",
    domain: "recovery",
    minutes: 18000,
  },
  {
    id: "mythic-output-total",
    title: "Output Legend",
    description: "Earn 5000 deliverable points",
    tier: "mythic",
    category: "mythic",
    kind: "output_total_points",
    points: 5000,
  },
  {
    id: "mythic-output-streak",
    title: "Never Miss",
    description: "Complete deliverables 90 days straight",
    tier: "mythic",
    category: "mythic",
    kind: "output_streak",
    days: 90,
  },
  {
    id: "mythic-days-730",
    title: "Two Year Operator",
    description: "Track 730 total days",
    tier: "mythic",
    category: "mythic",
    kind: "days_tracked",
    days: 730,
  },
  {
    id: "mythic-prime-avg-90",
    title: "Prime 90",
    description: "Average Prime 90+ for 90 days",
    tier: "mythic",
    category: "mythic",
    kind: "prime_avg",
    days: 90,
    threshold: 90,
  },
  {
    id: "mythic-prime-avg-180",
    title: "Prime Season",
    description: "Average Prime 85+ for 180 days",
    tier: "mythic",
    category: "mythic",
    kind: "prime_avg",
    days: 180,
    threshold: 85,
  },
  {
    id: "mythic-focus-60",
    title: "Flow State",
    description: "Focus Score 90+ for 60 days",
    tier: "mythic",
    category: "mythic",
    kind: "focus_streak",
    days: 60,
    threshold: 90,
  },
  {
    id: "mythic-recovery-60",
    title: "Sleep Sovereign",
    description: "Recovery Score 90+ for 60 days",
    tier: "mythic",
    category: "mythic",
    kind: "recovery_streak",
    days: 60,
    threshold: 90,
  },
  {
    id: "mythic-output-200",
    title: "Perfect Output",
    description: "Hit Output Score 200 in a day",
    tier: "mythic",
    category: "mythic",
    kind: "output_day_score",
    threshold: 200,
  },
]

const impossiple: AchievementDefinition[] = [
  {
    id: "impossiple-countries-50",
    title: "Worldbound",
    description: "Visit 50 countries across the globe",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "countriesVisited",
    threshold: 50,
  },
  {
    id: "impossiple-countries-100",
    title: "Global Citizen",
    description: "Visit 100 countries",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "countriesVisited",
    threshold: 100,
  },
  {
    id: "impossiple-countries-150",
    title: "Atlas Keeper",
    description: "Visit 150 countries",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "countriesVisited",
    threshold: 150,
  },
  {
    id: "impossiple-earn-1m",
    title: "Million Earned",
    description: "Earn $1,000,000 lifetime",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "lifetimeEarningsUsd",
    threshold: 1000000,
  },
  {
    id: "impossiple-earn-10m",
    title: "Deca Million",
    description: "Earn $10,000,000 lifetime",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "lifetimeEarningsUsd",
    threshold: 10000000,
  },
  {
    id: "impossiple-earn-100m",
    title: "Centimillion",
    description: "Earn $100,000,000 lifetime",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "lifetimeEarningsUsd",
    threshold: 100000000,
  },
  {
    id: "impossiple-earn-1b",
    title: "Billionaire",
    description: "Earn $1,000,000,000 lifetime",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "lifetimeEarningsUsd",
    threshold: 1000000000,
  },
  {
    id: "impossiple-networth-10m",
    title: "Fortune 10M",
    description: "Reach $10,000,000 net worth",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "netWorthUsd",
    threshold: 10000000,
  },
  {
    id: "impossiple-networth-100m",
    title: "Fortune 100M",
    description: "Reach $100,000,000 net worth",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "netWorthUsd",
    threshold: 100000000,
  },
  {
    id: "impossiple-donate-1m",
    title: "Patron 1M",
    description: "Donate $1,000,000 to causes",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "charityDonatedUsd",
    threshold: 1000000,
  },
  {
    id: "impossiple-donate-10m",
    title: "Patron 10M",
    description: "Donate $10,000,000 to causes",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "charityDonatedUsd",
    threshold: 10000000,
  },
  {
    id: "impossiple-founder-5",
    title: "Legendary Founder",
    description: "Found 5 companies",
    tier: "impossiple",
    category: "impossiple",
    kind: "profile_metric",
    metric: "companiesFounded",
    threshold: 5,
  },
]

const totalNonMythic = achievements.length
if (totalNonMythic !== 218) {
  console.warn(`Expected 218 non-mythic achievements, got ${totalNonMythic}`)
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  ...achievements,
  ...mythic,
  ...impossiple,
]

if (ACHIEVEMENT_DEFINITIONS.length !== 250) {
  console.warn(
    `Achievement count mismatch: ${ACHIEVEMENT_DEFINITIONS.length} (expected 250)`,
  )
}
