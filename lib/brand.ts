export type DomainId = "brain" | "build" | "body" | "recovery"
export type LandingScene = "hero" | "domains" | "screens" | "prime" | "pricing" | "faq"

export type DomainConfig = {
  id: DomainId
  label: string
  description: string
  accent: string
}

export const brand = {
  productName: "Vector",
  headline: "One signal for your real momentum.",
  tagline: "Prime Score unifies Brain, Build, Body, and Recovery into one daily operating rhythm.",
  badge: "Designed for builders. Built for consistency.",
  routes: {
    login: "/login",
    app: "/app",
  },
  domains: [
    {
      id: "brain",
      label: "Brain",
      description: "Protect deep work and strategic cognition.",
      accent: "#8ba4ff",
    },
    {
      id: "build",
      label: "Build",
      description: "Ship measurable output that compounds.",
      accent: "#ffbe6d",
    },
    {
      id: "body",
      label: "Body",
      description: "Train physical capacity for sustained execution.",
      accent: "#98a8b8",
    },
    {
      id: "recovery",
      label: "Recovery",
      description: "Stabilize sleep, energy, and stress resilience.",
      accent: "#49d7b8",
    },
  ] satisfies DomainConfig[],
  scenes: {
    hero: {
      top: "#040611",
      bottom: "#080f22",
      accentA: "#28d6ee",
      accentB: "#6f87ff",
    },
    domains: {
      top: "#05101f",
      bottom: "#0b111d",
      accentA: "#2de2b2",
      accentB: "#77a5ff",
    },
    screens: {
      top: "#0b1121",
      bottom: "#0e1022",
      accentA: "#25cfed",
      accentB: "#9ea9ff",
    },
    prime: {
      top: "#111229",
      bottom: "#140c1f",
      accentA: "#3be0dc",
      accentB: "#ff9e74",
    },
    pricing: {
      top: "#14142a",
      bottom: "#120f1e",
      accentA: "#6fc2ff",
      accentB: "#ca91ff",
    },
    faq: {
      top: "#0b0d1a",
      bottom: "#070913",
      accentA: "#2ed9ea",
      accentB: "#6fe6bd",
    },
  } as Record<LandingScene, { top: string; bottom: string; accentA: string; accentB: string }>,
}

export const screenStory = [
  {
    key: "today",
    title: "Today",
    subtitle: "Capture fast. Adjust fast.",
    body: "Log activities, score focus, and close deliverables in under a minute.",
    image: "/screens/app-today.png",
  },
  {
    key: "week",
    title: "Week",
    subtitle: "See the trend, not random noise.",
    body: "Track 7-day movement in Prime Score and each domain before slippage grows.",
    image: "/screens/app-week.png",
  },
  {
    key: "history",
    title: "History",
    subtitle: "Debug your performance timeline.",
    body: "Inspect specific dates or ranges to detect what actually moved your trajectory.",
    image: "/screens/app-history.png",
  },
  {
    key: "profile",
    title: "Profile",
    subtitle: "Identity and targets in one place.",
    body: "Keep identity, body metrics, and targets synced so your scoring model stays honest.",
    image: "/screens/app-profile.png",
  },
  {
    key: "achievements",
    title: "Achievements",
    subtitle: "Long-game consistency engine.",
    body: "Unlock milestones that reward repeatable systems instead of one lucky day.",
    image: "/screens/app-achievements.png",
  },
] as const
