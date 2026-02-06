import crypto from "crypto"

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES ?? 10)
const OTP_COOLDOWN_SECONDS = Number(process.env.OTP_COOLDOWN_SECONDS ?? 60)

export function generateOtpCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  return code
}

export function getOtpExpiryDate() {
  const expires = new Date()
  expires.setMinutes(expires.getMinutes() + OTP_TTL_MINUTES)
  return expires
}

export function getOtpCooldownSeconds() {
  return OTP_COOLDOWN_SECONDS
}

export function hashOtp(email: string, code: string) {
  const secret = process.env.OTP_SECRET || process.env.NEXTAUTH_SECRET || ""
  if (!secret) {
    throw new Error("OTP_SECRET or NEXTAUTH_SECRET must be set")
  }
  return crypto
    .createHmac("sha256", secret)
    .update(`${email.toLowerCase()}|${code}`)
    .digest("hex")
}
