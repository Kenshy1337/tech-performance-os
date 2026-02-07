"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Mail, ShieldCheck, Sparkle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const appRedirect = process.env.NEXT_PUBLIC_APP_URL || "/app"

export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [step, setStep] = useState<"email" | "code">("email")
  const [message, setMessage] = useState<string | null>(null)

  const isError = useMemo(
    () => Boolean(message && /(fail|invalid|error|wait)/i.test(message)),
    [message],
  )

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(appRedirect)
    }
  }, [status, router])

  const handleSendCode = async () => {
    if (!email) return

    setIsSending(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to send code")
      }

      setStep("code")
      setMessage("Code sent. Check your inbox.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to send code")
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async () => {
    if (!email || !code) return

    setIsVerifying(true)
    setMessage(null)

    const result = await signIn("credentials", {
      email,
      code,
      callbackUrl: appRedirect,
      redirect: false,
    })

    if (result?.error) {
      setMessage("Invalid code. Try again.")
      setIsVerifying(false)
      return
    }

    router.replace(appRedirect)
  }

  return (
    <div className="login-root">
      <div className="login-bg" aria-hidden />

      <div className="login-grid">
        <Card className="login-card-main card-premium">
          <CardHeader className="space-y-3">
            <div className="login-kicker">
              <Sparkle className="size-3.5" />
              <span>Vector Access</span>
            </div>
            <CardTitle className="font-display text-3xl tracking-tight">Welcome to Vector Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground">
              Continue with Google or use a secure email code.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <Button
              variant="outline"
              className="login-google-btn"
              onClick={() => signIn("google", { callbackUrl: appRedirect })}
            >
              <span className="login-google-mark-shell" aria-hidden>
                <GoogleMark className="login-google-mark" />
              </span>
              <span>Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or email code</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {step === "code" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Code</label>
                  <Input
                    type="text"
                    value={code}
                    placeholder="6-digit code"
                    onChange={(event) => setCode(event.target.value)}
                  />
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={handleSendCode}
                  disabled={!email || isSending}
                >
                  <Mail className="size-4" />
                  {isSending ? "Sending..." : "Send code"}
                </Button>
                <Button
                  className="justify-start gap-2"
                  onClick={handleVerify}
                  disabled={step !== "code" || !code || isVerifying}
                >
                  <ShieldCheck className="size-4" />
                  {isVerifying ? "Verifying..." : "Verify & Start"}
                </Button>
              </div>

              {message && (
                <div
                  className={cn(
                    "rounded-md border px-3 py-2 text-xs",
                    isError
                      ? "border-destructive/40 text-destructive"
                      : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium login-card-side">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-tight">Why sign in?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Sync Prime Score, domain history, and achievements across sessions.</p>
            <p>Keep your onboarding, profile, and progression attached to one account.</p>
            <p>Sign out any time. Your data model remains exportable.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g-red" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff7a59" />
          <stop offset="1" stopColor="#ff3f5e" />
        </linearGradient>
        <linearGradient id="g-yellow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd84d" />
          <stop offset="1" stopColor="#f4cc00" />
        </linearGradient>
        <linearGradient id="g-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8bcf00" />
          <stop offset="1" stopColor="#1fc46b" />
        </linearGradient>
        <linearGradient id="g-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a8df5" />
          <stop offset="1" stopColor="#2cb3ff" />
        </linearGradient>
      </defs>
      <path d="M58 12c13 0 24 5 32 13L79 36c-6-5-13-8-21-8-17 0-31 11-36 27L8 45C15 25 34 12 58 12z" fill="url(#g-red)" />
      <path d="M22 55c-1 3-2 6-2 10s1 7 2 10L8 85C4 77 2 69 2 65c0-7 2-15 6-23l14 13z" fill="url(#g-yellow)" />
      <path d="M22 75c5 16 19 27 36 27 9 0 17-3 23-9l12 9c-9 10-22 16-35 16-24 0-43-13-50-33l14-10z" fill="url(#g-green)" />
      <path d="M118 65c0-4-1-8-2-12H58v22h34c-2 9-7 16-15 21l12 9c12-10 19-24 19-40z" fill="url(#g-blue)" />
    </svg>
  )
}
