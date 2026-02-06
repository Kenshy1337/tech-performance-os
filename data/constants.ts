import { Domain, Targets } from "./types"

export const DOMAIN_ORDER: Domain[] = ["brain", "build", "body", "recovery"]

export const DEFAULT_TARGETS: Targets = {
  id: "default",
  brain: 120,
  build: 120,
  body: 60,
  recovery: 60,
  sleepTargetHours: 8,
  recoverySleepWeightMinutes: 40,
}

export const PRIME_WEIGHTS = {
  output: 0.4,
  focus: 0.3,
  recovery: 0.3,
}

export const BUILD_CRITICALITY = {
  penaltyThreshold: 20,
  bonusThreshold: 100,
  penaltyMultiplier: 0.85,
  bonusMultiplier: 1.05,
}

export const PRIME_SCORE_CAP = 120

export const DEFAULT_FOCUS = {
  focusScore: 75,
  deepMinutes: 0,
  longestBlockMinutes: 0,
  switchesPerHour: 0,
  drivers: [] as string[],
}

export const DEFAULT_RECOVERY = {
  sleepHours: 7,
  sleepTargetHours: 8,
  energyScore: 70,
  mood: undefined as number | undefined,
  recoveryDrivers: [] as string[],
}
