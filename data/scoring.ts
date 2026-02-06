import { BUILD_CRITICALITY, DEFAULT_TARGETS, PRIME_SCORE_CAP, PRIME_WEIGHTS } from "./constants"
import { DailyRecovery, Targets } from "./types"

export interface DomainMinutes {
  brain: number
  build: number
  body: number
  recovery: number
}

export interface DomainCompletionResult {
  completion: DomainMinutes
  completionDisplay: DomainMinutes
  recoveryMinutesEquivalent: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function computeDomainCompletion(
  minutes: DomainMinutes,
  recovery: DailyRecovery,
  targets: Targets = DEFAULT_TARGETS,
): DomainCompletionResult {
  const recoverySleepWeight = targets.recoverySleepWeightMinutes
  const sleepTarget = recovery.sleepTargetHours || targets.sleepTargetHours
  const sleepRatio = sleepTarget > 0 ? recovery.sleepHours / sleepTarget : 0
  const recoveryMinutesEquivalent = clamp(sleepRatio, 0, 2) * recoverySleepWeight

  const rawRecovery =
    ((minutes.recovery + recoveryMinutesEquivalent) / Math.max(1, targets.recovery)) *
    100

  const completion = {
    brain: (minutes.brain / Math.max(1, targets.brain)) * 100,
    build: (minutes.build / Math.max(1, targets.build)) * 100,
    body: (minutes.body / Math.max(1, targets.body)) * 100,
    recovery: rawRecovery,
  }

  const completionDisplay = {
    brain: Math.round(Math.min(100, completion.brain)),
    build: Math.round(Math.min(100, completion.build)),
    body: Math.round(Math.min(100, completion.body)),
    recovery: Math.round(Math.min(100, completion.recovery)),
  }

  return { completion, completionDisplay, recoveryMinutesEquivalent }
}

export function computeOutputScore(plannedPoints: number, donePoints: number): number {
  if (plannedPoints <= 0) return 0
  return clamp((donePoints / plannedPoints) * 100, 0, 200)
}

export function computePrimeScore(params: {
  outputScore: number
  focusScore: number
  recoveryScore: number
  buildCompletion: number
}): { primeScore: number; baseScore: number; buildModifier: number; drivers: string[] } {
  const output = clamp(params.outputScore, 0, 100)
  const focus = clamp(params.focusScore, 0, 100)
  const recovery = clamp(params.recoveryScore, 0, 100)

  const baseScore =
    output * PRIME_WEIGHTS.output +
    focus * PRIME_WEIGHTS.focus +
    recovery * PRIME_WEIGHTS.recovery

  let buildModifier = 1
  const drivers: string[] = []

  if (params.buildCompletion < BUILD_CRITICALITY.penaltyThreshold) {
    buildModifier = BUILD_CRITICALITY.penaltyMultiplier
    drivers.push("Build below 20%: -15% penalty")
  } else if (params.buildCompletion >= BUILD_CRITICALITY.bonusThreshold) {
    buildModifier = BUILD_CRITICALITY.bonusMultiplier
    drivers.push("Build above 100%: +5% bonus")
  }

  if (output < 50) drivers.push("Output score under 50")
  if (focus < 50) drivers.push("Focus score under 50")
  if (recovery < 50) drivers.push("Recovery score under 50")

  const primeScore = clamp(Math.round(baseScore * buildModifier), 0, PRIME_SCORE_CAP)

  return {
    primeScore,
    baseScore: Math.round(baseScore),
    buildModifier,
    drivers,
  }
}

export function computeCompletionAverage(completionDisplay: DomainMinutes): number {
  return Math.round(
    (completionDisplay.brain +
      completionDisplay.build +
      completionDisplay.body +
      completionDisplay.recovery) /
      4,
  )
}
