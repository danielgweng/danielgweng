import { db } from "../../../lib/db";

const AGE_BANDS = ["20–23", "24–27", "28–30", "Outside 20–30 (waitlist for future crews)"];
const HOODS = [
  "The Junction / High Park",
  "Ossington / Trinity Bellwoods",
  "Leslieville / Riverside",
  "Liberty Village / King West",
  "The Annex / Koreatown",
  "Elsewhere in Toronto",
];
const NIGHTS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sun"];
const ACTS = ["Bouldering", "5-a-side", "Run + pint", "Cards"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field.
  if (body.website) {
    return Response.json({ ok: true });
  }

  const firstName = String(body.firstName || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  const phone = String(body.phone || "").trim().slice(0, 40) || null;
  const ageBand = String(body.ageBand || "");
  const neighbourhood = String(body.neighbourhood || "");
  const nights = Array.isArray(body.nights) ? body.nights.filter((n) => NIGHTS.includes(n)) : [];
  const activities = Array.isArray(body.activities)
    ? body.activities.filter((a) => ACTS.includes(a)).slice(0, 2)
    : [];

  if (
    !firstName ||
    !EMAIL_RE.test(email) ||
    !AGE_BANDS.includes(ageBand) ||
    !HOODS.includes(neighbourhood) ||
    nights.length < 1 ||
    activities.length < 1
  ) {
    return Response.json(
      { ok: false, error: "Fill in your name and a valid email, and pick at least one night and one activity." },
      { status: 400 }
    );
  }

  try {
    const sql = await db();
    await sql`
      INSERT INTO applications (first_name, email, phone, age_band, neighbourhood, nights, activities)
      VALUES (${firstName}, ${email}, ${phone}, ${ageBand}, ${neighbourhood}, ${nights}, ${activities})
    `;
    return Response.json({ ok: true });
  } catch (err) {
    if (err && err.code === "23505") {
      // Unique violation — this email already applied. Treat as success.
      return Response.json({ ok: true, duplicate: true });
    }
    console.error("apply error:", err);
    return Response.json(
      { ok: false, error: "Something broke on our end. Try again in a minute." },
      { status: 500 }
    );
  }
}
