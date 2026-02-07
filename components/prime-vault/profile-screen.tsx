"use client"

import { useEffect, useMemo, useState } from "react"
import {
  User,
  Settings,
  Bell,
  Shield,
  Download,
  Upload,
  Plus,
  Minus,
  Target,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  useExportData,
  useImportData,
  useProfile,
  useStatsSummary,
  useTargets,
  useUpdateProfile,
  useUpdateTargets,
} from "@/data/hooks"
import { UserProfile } from "@/data/types"
import { useSession } from "next-auth/react"

type ProfileDraft = {
  nickname: string
  timezone: string
  heightCm: number | ""
  weightKg: number | ""
  avatarDataUrl?: string
  countriesVisited: number | ""
  lifetimeEarningsUsd: number | ""
  netWorthUsd: number | ""
  charityDonatedUsd: number | ""
  companiesFounded: number | ""
}

const toDraft = (profile?: UserProfile): ProfileDraft => ({
  nickname: profile?.nickname ?? "",
  timezone: profile?.timezone ?? "",
  heightCm: profile?.heightCm ?? "",
  weightKg: profile?.weightKg ?? "",
  avatarDataUrl: profile?.avatarDataUrl,
  countriesVisited: profile?.countriesVisited ?? "",
  lifetimeEarningsUsd: profile?.lifetimeEarningsUsd ?? "",
  netWorthUsd: profile?.netWorthUsd ?? "",
  charityDonatedUsd: profile?.charityDonatedUsd ?? "",
  companiesFounded: profile?.companiesFounded ?? "",
})

const normalizeNumber = (value: number | ""): number | undefined =>
  value === "" ? undefined : Number(value)

export function ProfileScreen() {
  const { data: session } = useSession()
  const { data: profile } = useProfile()
  const { data: targets } = useTargets()
  const { data: stats } = useStatsSummary()

  const updateProfile = useUpdateProfile()
  const updateTargets = useUpdateTargets()
  const exportData = useExportData()
  const importData = useImportData()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(profile))

  const sessionName = session?.user?.name?.trim()
  const sessionAvatar = session?.user?.image?.trim()

  const displayProfile = useMemo<UserProfile>(() => {
    const base: UserProfile = profile ?? { id: "local", nickname: sessionName ?? "Operator" }
    return {
      ...base,
      nickname: base.nickname || sessionName || "Operator",
      avatarDataUrl: base.avatarDataUrl || sessionAvatar || undefined,
    }
  }, [profile, sessionName, sessionAvatar])

  useEffect(() => {
    if (!profile) return
    const updates: Partial<UserProfile> = {}
    if (!profile.avatarDataUrl && sessionAvatar) {
      updates.avatarDataUrl = sessionAvatar
    }
    if ((!profile.nickname || profile.nickname === "Operator") && sessionName) {
      updates.nickname = sessionName
    }
    if (Object.keys(updates).length > 0) {
      updateProfile.mutate(updates)
    }
  }, [profile, sessionAvatar, sessionName, updateProfile])

  const openEditor = () => {
    setDraft(toDraft(profile))
    setDialogOpen(true)
  }

  const handleDraftAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === "string") {
        setDraft((prev) => ({ ...prev, avatarDataUrl: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = () => {
    updateProfile.mutate({
      nickname: draft.nickname.trim() || displayProfile.nickname || "Operator",
      timezone: draft.timezone.trim(),
      heightCm: normalizeNumber(draft.heightCm),
      weightKg: normalizeNumber(draft.weightKg),
      avatarDataUrl: draft.avatarDataUrl,
      countriesVisited: normalizeNumber(draft.countriesVisited),
      lifetimeEarningsUsd: normalizeNumber(draft.lifetimeEarningsUsd),
      netWorthUsd: normalizeNumber(draft.netWorthUsd),
      charityDonatedUsd: normalizeNumber(draft.charityDonatedUsd),
      companiesFounded: normalizeNumber(draft.companiesFounded),
    })
    setDialogOpen(false)
  }

  const handleExport = async () => {
    const payload = await exportData.mutateAsync()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `tech-performance-os-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importData.mutateAsync(data)
    } catch (error) {
      console.error("Failed to import data", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="card-premium" data-tour="profile-summary">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
          <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted">
            {displayProfile.avatarDataUrl ? (
              <img src={displayProfile.avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="size-7 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-lg font-semibold text-foreground">{displayProfile.nickname ?? "Operator"}</p>
            <p className="text-sm text-muted-foreground">{displayProfile.timezone || "Timezone not set"}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Height: {displayProfile.heightCm ? `${displayProfile.heightCm} cm` : "—"}</span>
              <span>Weight: {displayProfile.weightKg ? `${displayProfile.weightKg} kg` : "—"}</span>
            </div>
          </div>
          <Button variant="outline" onClick={openEditor}>
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Your Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Days Tracked</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">{stats?.daysTracked ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">{stats?.currentStreak ?? 0} days</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Avg Prime Score</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">{stats?.averagePrime ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Achievements</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {stats?.achievementsUnlocked ?? 0} / {stats?.totalAchievements ?? 250}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Targets</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TargetRow
            label="Sleep Target"
            description="Hours of sleep per night"
            value={targets?.sleepTargetHours ?? 8}
            unit="h"
            min={5}
            max={12}
            step={0.5}
            colorClass="emerald"
            emoji="🌙"
            onChange={(value) => updateTargets.mutate({ sleepTargetHours: value })}
          />
          <TargetRow
            label="Brain Target"
            description="Minutes of cognitive work"
            value={targets?.brain ?? 120}
            unit="m"
            min={60}
            max={480}
            step={30}
            colorClass="blue"
            emoji="🧠"
            onChange={(value) => updateTargets.mutate({ brain: value })}
          />
          <TargetRow
            label="Build Target"
            description="Minutes of shipping work"
            value={targets?.build ?? 120}
            unit="m"
            min={15}
            max={240}
            step={15}
            colorClass="amber"
            emoji="🚀"
            onChange={(value) => updateTargets.mutate({ build: value })}
          />
          <TargetRow
            label="Body Target"
            description="Minutes of exercise"
            value={targets?.body ?? 60}
            unit="m"
            min={15}
            max={180}
            step={15}
            colorClass="red"
            emoji="💪"
            onChange={(value) => updateTargets.mutate({ body: value })}
          />
          <TargetRow
            label="Recovery Target"
            description="Minutes of recovery work"
            value={targets?.recovery ?? 60}
            unit="m"
            min={15}
            max={180}
            step={15}
            colorClass="emerald"
            emoji="🧘"
            onChange={(value) => updateTargets.mutate({ recovery: value })}
          />
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Life Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricDisplay label="Countries Visited" value={displayProfile.countriesVisited} />
            <MetricDisplay label="Companies Founded" value={displayProfile.companiesFounded} />
            <MetricDisplay label="Lifetime Earnings (USD)" value={displayProfile.lifetimeEarningsUsd} />
            <MetricDisplay label="Net Worth (USD)" value={displayProfile.netWorthUsd} />
            <MetricDisplay label="Charity Donated (USD)" value={displayProfile.charityDonatedUsd} />
          </div>
        </CardContent>
      </Card>

      <Card className="card-premium">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Bell className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Daily reminders and achievements</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Shield className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Privacy Mode</p>
                <p className="text-xs text-muted-foreground">Hide sensitive data in screenshots</p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Download className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Export Data</p>
                <p className="text-xs text-muted-foreground">Download your activity history</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Upload className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Import Data</p>
                <p className="text-xs text-muted-foreground">Restore from a JSON backup</p>
              </div>
            </div>
            <label className="cursor-pointer">
              <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
              <Button variant="outline" size="sm" asChild>
                <span>Import</span>
              </Button>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Settings className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Advanced Settings</p>
                <p className="text-xs text-muted-foreground">Customize scoring and thresholds</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update profile details and life metrics.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted">
                {draft.avatarDataUrl ? (
                  <img src={draft.avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="size-7 text-muted-foreground" />
                )}
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity hover:opacity-100">
                  <Upload className="mr-1 size-3" />
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handleDraftAvatarUpload} />
                </label>
              </div>
              <div className="grid w-full gap-2">
                <Input
                  value={draft.nickname}
                  onChange={(event) => setDraft((prev) => ({ ...prev, nickname: event.target.value }))}
                  placeholder="Nickname"
                />
                <Input
                  value={draft.timezone}
                  onChange={(event) => setDraft((prev) => ({ ...prev, timezone: event.target.value }))}
                  placeholder="Timezone"
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                type="number"
                value={draft.heightCm}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    heightCm: event.target.value ? Number(event.target.value) : "",
                  }))
                }
                placeholder="Height (cm)"
              />
              <Input
                type="number"
                value={draft.weightKg}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    weightKg: event.target.value ? Number(event.target.value) : "",
                  }))
                }
                placeholder="Weight (kg)"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                type="number"
                value={draft.countriesVisited}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    countriesVisited: event.target.value ? Number(event.target.value) : "",
                  }))
                }
                placeholder="Countries visited"
              />
              <Input
                type="number"
                value={draft.companiesFounded}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    companiesFounded: event.target.value ? Number(event.target.value) : "",
                  }))
                }
                placeholder="Companies founded"
              />
              <Input
                type="number"
                value={draft.lifetimeEarningsUsd}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    lifetimeEarningsUsd: event.target.value ? Number(event.target.value) : "",
                  }))
                }
                placeholder="Lifetime earnings (USD)"
              />
              <Input
                type="number"
                value={draft.netWorthUsd}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    netWorthUsd: event.target.value ? Number(event.target.value) : "",
                  }))
                }
                placeholder="Net worth (USD)"
              />
              <Input
                type="number"
                value={draft.charityDonatedUsd}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    charityDonatedUsd: event.target.value ? Number(event.target.value) : "",
                  }))
                }
                placeholder="Charity donated (USD)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TargetRow({
  label,
  description,
  value,
  unit,
  min,
  max,
  step,
  colorClass,
  emoji,
  onChange,
}: {
  label: string
  description: string
  value: number
  unit: string
  min: number
  max: number
  step: number
  colorClass: "emerald" | "blue" | "amber" | "red"
  emoji: string
  onChange: (value: number) => void
}) {
  const colorMap = {
    emerald: {
      border: "border-emerald-600/20 dark:border-emerald-400/20",
      bg: "bg-emerald-600/5 dark:bg-emerald-400/5",
      icon: "bg-emerald-600/10 dark:bg-emerald-400/10",
      text: "text-emerald-600 dark:text-emerald-400",
      button: "border-emerald-600/30 hover:bg-emerald-600/10 dark:border-emerald-400/30 dark:hover:bg-emerald-400/10",
    },
    blue: {
      border: "border-blue-600/20 dark:border-blue-400/20",
      bg: "bg-blue-600/5 dark:bg-blue-400/5",
      icon: "bg-blue-600/10 dark:bg-blue-400/10",
      text: "text-blue-600 dark:text-blue-400",
      button: "border-blue-600/30 hover:bg-blue-600/10 dark:border-blue-400/30 dark:hover:bg-blue-400/10",
    },
    amber: {
      border: "border-amber-600/20 dark:border-amber-400/20",
      bg: "bg-amber-600/5 dark:bg-amber-400/5",
      icon: "bg-amber-600/10 dark:bg-amber-400/10",
      text: "text-amber-600 dark:text-amber-400",
      button: "border-amber-600/30 hover:bg-amber-600/10 dark:border-amber-400/30 dark:hover:bg-amber-400/10",
    },
    red: {
      border: "border-red-600/20 dark:border-red-400/20",
      bg: "bg-red-600/5 dark:bg-red-400/5",
      icon: "bg-red-600/10 dark:bg-red-400/10",
      text: "text-red-600 dark:text-red-400",
      button: "border-red-600/30 hover:bg-red-600/10 dark:border-red-400/30 dark:hover:bg-red-400/10",
    },
  } as const

  const styles = colorMap[colorClass]

  return (
    <div className={cn("flex items-center justify-between rounded-lg border p-4", styles.border, styles.bg)}>
      <div className="flex items-center gap-3">
        <div className={cn("flex size-10 items-center justify-center rounded-lg", styles.icon)}>
          <span className={cn("text-lg emoji", styles.text)}>
            {emoji}
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className={cn("size-8 bg-transparent", styles.button)}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          <Minus className="size-3" />
        </Button>
        <span className="w-16 text-center text-lg font-bold tabular-nums text-foreground">
          {value}{unit}
        </span>
        <Button
          variant="outline"
          size="icon"
          className={cn("size-8 bg-transparent", styles.button)}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  )
}

function MetricDisplay({
  label,
  value,
}: {
  label: string
  value: number | undefined
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value ?? "—"}</p>
    </div>
  )
}
