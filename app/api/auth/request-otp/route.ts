import { NextResponse } from "next/server"
import { sql, ensureAuthSchema } from "@/lib/auth/db"
import { generateOtpCode, getOtpExpiryDate, getOtpCooldownSeconds, hashOtp } from "@/lib/auth/otp"
import { sendEmail } from "@/lib/auth/email"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = body?.email?.toLowerCase().trim()
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  await ensureAuthSchema()

  const existing = await sql`
    SELECT created_at
    FROM auth_email_codes
    WHERE email = ${email}
  `

  if (existing.length > 0) {
    const createdAt = new Date(existing[0].created_at)
    const secondsSince = (Date.now() - createdAt.getTime()) / 1000
    if (secondsSince < getOtpCooldownSeconds()) {
      return NextResponse.json({ error: "Please wait before requesting another code." }, { status: 429 })
    }
  }

  const code = generateOtpCode()
  const codeHash = hashOtp(email, code)
  const expiresAt = getOtpExpiryDate()

  await sql`
    INSERT INTO auth_email_codes (email, code_hash, expires_at, created_at, attempts)
    VALUES (${email}, ${codeHash}, ${expiresAt.toISOString()}, NOW(), 0)
    ON CONFLICT (email)
    DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, created_at = NOW(), attempts = 0
  `

  await sendEmail({
    to: email,
    subject: "Your Vector sign-in code",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; line-height:1.5;">
        <h2 style="margin:0 0 12px;">Your sign-in code</h2>
        <p>Use this code to sign in to Vector:</p>
        <div style="font-size:28px; letter-spacing:6px; font-weight:700; margin:16px 0;">${code}</div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
