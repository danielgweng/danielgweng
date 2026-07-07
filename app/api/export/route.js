import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

function csvField(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const sql = await db();
  const rows = await sql`SELECT * FROM applications ORDER BY created_at ASC`;

  const header = ["id", "first_name", "email", "phone", "age_band", "location", "nights", "activities", "created_at"];
  const lines = [header.join(",")];

  for (const r of rows) {
    lines.push(
      [
        r.id,
        csvField(r.first_name),
        csvField(r.email),
        csvField(r.phone),
        csvField(r.age_band),
        csvField(r.location),
        csvField(r.nights.join("|")),
        csvField(r.activities.join("|")),
        r.created_at.toISOString(),
      ].join(",")
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="regulars-applications.csv"',
    },
  });
}
