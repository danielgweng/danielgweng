import postgres from "postgres";

// Reuse one client across hot reloads / serverless invocations.
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!globalThis.__regulars_sql) {
    globalThis.__regulars_sql = postgres(process.env.DATABASE_URL, {
      max: 3,
      prepare: false, // safe with pooled providers (Neon/Supabase poolers)
      onnotice: () => {},
    });
  }
  return globalThis.__regulars_sql;
}

// Create schema on first touch — zero-migration setup for the pilot.
async function ensureSchema(sql) {
  if (globalThis.__regulars_schema_ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id            serial PRIMARY KEY,
      first_name    text NOT NULL,
      email         text NOT NULL,
      phone         text,
      age_band      text NOT NULL,
      location      text NOT NULL,
      nights        text[] NOT NULL,
      activities    text[] NOT NULL,
      created_at    timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS applications_email_key
    ON applications (lower(email))
  `;
  globalThis.__regulars_schema_ready = true;
}

export async function db() {
  const sql = getSql();
  await ensureSchema(sql);
  return sql;
}
