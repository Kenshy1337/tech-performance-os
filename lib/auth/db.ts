import { neon } from "@neondatabase/serverless"

type SqlClient = ReturnType<typeof neon>

let sqlClient: SqlClient | null = null

function getSqlClient() {
  if (sqlClient) return sqlClient

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  sqlClient = neon(databaseUrl)
  return sqlClient
}

export const sql: SqlClient = ((...args: Parameters<SqlClient>) => {
  const client = getSqlClient()
  return client(...args)
}) as SqlClient

export async function ensureAuthSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS auth_users (
      email TEXT PRIMARY KEY,
      name TEXT,
      image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS auth_email_codes (
      email TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      attempts INT NOT NULL DEFAULT 0
    )
  `
}
