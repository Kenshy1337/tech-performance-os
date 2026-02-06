type SendEmailPayload = {
  to: string
  subject: string
  html: string
}

const RESEND_API_URL = "https://api.resend.com/emails"

export async function sendEmail({ to, subject, html }: SendEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey) throw new Error("RESEND_API_KEY is not set")
  if (!from) throw new Error("EMAIL_FROM is not set")

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend error: ${errorText}`)
  }
}
