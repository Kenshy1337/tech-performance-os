import { ActivityType, Domain, UserProfile } from "./types"

const createType = (id: string, name: string, domain: Domain, isBuildCritical = false): ActivityType => ({
  id,
  name,
  domain,
  defaultUnit: "minutes",
  isBuildCritical,
  createdAt: new Date().toISOString(),
})

export const DEFAULT_ACTIVITY_TYPES: ActivityType[] = [
  createType("deep-work", "Deep Work", "brain"),
  createType("learning", "Learning", "brain"),
  createType("coding", "Coding", "brain"),
  createType("writing", "Writing", "brain"),
  createType("reading", "Reading", "brain"),
  createType("shipping", "Shipping", "build", true),
  createType("coding-build", "Coding", "build", true),
  createType("creating", "Creating", "build", true),
  createType("publishing", "Publishing", "build", true),
  createType("gym", "Gym", "body"),
  createType("walk", "Walk", "body"),
  createType("run", "Run", "body"),
  createType("stretch", "Stretch", "body"),
  createType("sports", "Sports", "body"),
  createType("meditation", "Meditation", "recovery"),
  createType("sauna", "Sauna", "recovery"),
  createType("cold-plunge", "Cold Plunge", "recovery"),
  createType("nutrition", "Nutrition", "recovery"),
  createType("nature", "Nature", "recovery"),
]

export const DEFAULT_PROFILE: UserProfile = {
  id: "local",
  nickname: "Operator",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  countriesVisited: 0,
  lifetimeEarningsUsd: 0,
  netWorthUsd: 0,
  charityDonatedUsd: 0,
  companiesFounded: 0,
  onboardingStatus: "new",
}
