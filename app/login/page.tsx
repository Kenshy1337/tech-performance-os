"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Mail, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [step, setStep] = useState<"email" | "code">("email")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/")
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
      setMessage("Code sent. Check your email.")
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
      redirect: false,
    })

    if (result?.error) {
      setMessage("Invalid code. Try again.")
      setIsVerifying(false)
      return
    }

    router.replace("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="card-premium overflow-hidden">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold">Welcome to Vector</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to track Prime Score, unlock achievements, and sync your progress.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border border-border/60 bg-white/80 text-foreground shadow-sm hover:bg-muted/60 dark:bg-[#0f1115] dark:text-foreground dark:hover:bg-[#161b24]"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#0b0f14] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <GoogleMark className="size-4" />
              </span>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or email code</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {step === "code" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Code</label>
                  <Input
                    type="text"
                    placeholder="6-digit code"
                    value={code}
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
                  {isVerifying ? "Verifying..." : "Verify & Sign in"}
                </Button>
              </div>

              {message && (
                <div
                  className={cn(
                    "rounded-md border px-3 py-2 text-xs",
                    message.toLowerCase().includes("fail") || message.toLowerCase().includes("invalid")
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

        <Card className="card-premium">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg font-semibold">Why sign in?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Save your Prime Score history, achievements, and daily logs.</p>
            <p>Access Vector from any device.</p>
            <p>Unlock personalized insights and long-term streaks.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.15 0 5.98 1.1 8.21 2.91l5.62-5.62C34.36 3.71 29.49 1.5 24 1.5 14.63 1.5 6.57 6.95 2.67 14.9l6.73 5.23C11.1 14.05 16.05 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.56-.14-3.05-.4-4.5H24v9h12.66c-.55 2.94-2.2 5.43-4.66 7.12l7.1 5.52c4.15-3.83 6.4-9.48 6.4-17.14z"
      />
      <path
        fill="#FBBC05"
        d="M9.4 28.02a14.78 14.78 0 0 1 0-8.04l-6.73-5.23A22.49 22.49 0 0 0 1.5 24c0 3.64.87 7.07 2.42 10.11l6.73-6.09z"
      />
      <path
        fill="#34A853"
        d="M24 46.5c5.49 0 10.1-1.82 13.47-4.94l-7.1-5.52c-1.97 1.32-4.49 2.1-6.37 2.1-7.95 0-12.9-4.55-14.6-10.62l-6.73 6.09C6.57 41.05 14.63 46.5 24 46.5z"
      />
      <path fill="none" d="M1.5 1.5h45v45h-45z" />
    </svg>
  )
}
