"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { UserProfile } from "@/data/types"

export type OnboardingDraft = {
  nickname: string
  timezone: string
  heightCm: number | ""
  weightKg: number | ""
}

const toNumber = (value: number | "") => (value === "" ? undefined : Number(value))

interface OnboardingFlowProps {
  open: boolean
  profile?: UserProfile
  sessionName?: string
  sessionTimezone?: string
  onComplete: (payload: Partial<UserProfile>) => void
}

export function OnboardingFlow({
  open,
  profile,
  sessionName,
  sessionTimezone,
  onComplete,
}: OnboardingFlowProps) {
  const initialDraft = useMemo<OnboardingDraft>(
    () => ({
      nickname: profile?.nickname && profile.nickname !== "Operator" ? profile.nickname : sessionName ?? "",
      timezone: profile?.timezone ?? sessionTimezone ?? "",
      heightCm: profile?.heightCm ?? "",
      weightKg: profile?.weightKg ?? "",
    }),
    [profile, sessionName, sessionTimezone],
  )

  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft)

  if (!open) return null

  const totalSteps = 3
  const canContinue = step === 0 ? draft.nickname.trim().length > 0 : true

  const handleComplete = () => {
    onComplete({
      nickname: draft.nickname.trim() || sessionName || "Operator",
      timezone: draft.timezone.trim() || sessionTimezone,
      heightCm: toNumber(draft.heightCm),
      weightKg: toNumber(draft.weightKg),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-md">
      <Card className="card-premium w-full max-w-xl border-border/60 bg-card/95 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Onboarding {step + 1}/{totalSteps}</span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1.5 w-6 rounded-full",
                    index <= step ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">Welcome to Vector</CardTitle>
          <p className="text-sm text-muted-foreground">
            Let’s personalize your workspace so the dashboards feel instantly yours.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <Input
                  value={draft.nickname}
                  onChange={(event) => setDraft((prev) => ({ ...prev, nickname: event.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                <Input
                  value={draft.timezone}
                  onChange={(event) => setDraft((prev) => ({ ...prev, timezone: event.target.value }))}
                  placeholder="Your timezone"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Height (cm)</label>
                  <Input
                    type="number"
                    value={draft.heightCm}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        heightCm: event.target.value ? Number(event.target.value) : "",
                      }))
                    }
                    placeholder="180"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Weight (kg)</label>
                  <Input
                    type="number"
                    value={draft.weightKg}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        weightKg: event.target.value ? Number(event.target.value) : "",
                      }))
                    }
                    placeholder="75"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                These help calibrate recovery and energy insights. You can edit them later.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="text-foreground">You’re ready to go.</p>
                <p>Next we’ll walk you through the key areas of Vector so you can move fast.</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < totalSteps - 1 ? (
              <Button onClick={() => setStep((prev) => prev + 1)} disabled={!canContinue}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleComplete}>Start Tour</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
