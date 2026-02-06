import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { sql, ensureAuthSchema } from "@/lib/auth/db"
import { hashOtp } from "@/lib/auth/otp"

const handler = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Email code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const code = credentials?.code?.trim()
        if (!email || !code) return null

        await ensureAuthSchema()

        const hashed = hashOtp(email, code)
        const rows = await sql`
          SELECT email, code_hash, expires_at, attempts
          FROM auth_email_codes
          WHERE email = ${email}
        `

        const record = rows[0]
        if (!record) return null

        const now = new Date()
        const expiresAt = new Date(record.expires_at)
        if (expiresAt < now) {
          await sql`DELETE FROM auth_email_codes WHERE email = ${email}`
          return null
        }

        if (record.code_hash !== hashed) {
          await sql`
            UPDATE auth_email_codes
            SET attempts = attempts + 1
            WHERE email = ${email}
          `
          return null
        }

        await sql`DELETE FROM auth_email_codes WHERE email = ${email}`

        await sql`
          INSERT INTO auth_users (email, last_login_at)
          VALUES (${email}, NOW())
          ON CONFLICT (email)
          DO UPDATE SET last_login_at = NOW()
        `

        return { id: email, email }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false
      await ensureAuthSchema()
      await sql`
        INSERT INTO auth_users (email, name, image, last_login_at)
        VALUES (${user.email}, ${user.name ?? null}, ${user.image ?? null}, NOW())
        ON CONFLICT (email)
        DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image, last_login_at = NOW()
      `
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
