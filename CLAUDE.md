# Regulars — Pilot 001 (Toronto)

This file transfers full context from the founder's strategy conversations. Read it before making any change.

## What this is

**Regulars** is a concierge pilot testing one hypothesis: young men (20–30) will show up weekly to a **fixed crew of six** doing a recurring activity (board games, bouldering, run + pint, coffee) — and by ~week 12 the crew becomes self-sustaining ("graduation"). The pilot is deliberately low-tech: this site's only jobs are (1) convert visitors into applications, (2) store applicants in Postgres, (3) let the founder view/export them to build crews by hand.

**The single success metric of the whole venture: do the same people still show up in week six?** Everything else is secondary.

## Strategy decisions already made (do not relitigate)

- **Stigma reframe is load-bearing.** The site NEVER says "make friends," "lonely," or "loneliness." It sells a *standing plan*; friendship is "a side effect." Keep this in ALL copy, meta tags, and any new pages.
- **No cash deposits / stakes.** The commitment mechanics are social only (fixed roster, RSVP lock, ghost-twice-lose-the-seat, crew streak). A refundable-deposit model was pressure-tested and rejected: GymPact/Pact precedent (adverse selection, FTC settlement, verification hell). Do not add payment-based commitment features.
- **Operator-scheduled, activity-anchored.** We pick the time/place and fill it. We do NOT build matching/browse/feeds. "Built to be deleted" is a brand promise — no engagement-farming features, no feed, ever.
- **Concierge on purpose.** Crew placement happens by hand (text messages), from the admin table/CSV. Don't automate placement yet.
- **Open signup, concentrated launch.** Anyone can apply from any location, any day of the week (free-text location field, all seven days selectable). Crews LAUNCH one neighbourhood at a time, where applications cluster — starting in Toronto. The application list is the demand map; locations and activities grow as users do. Don't reintroduce a fixed neighbourhood dropdown.
- **No venue partnerships (yet).** Every activity is anchored to walk-in/drop-in venues — board game cafés, coffee shops, day-pass climbing gyms, public running routes. Nothing that needs a booking, permit, or host relationship. (5-a-side was cut for exactly this reason: a weekly pitch needs a permit or a partner.) Don't write copy that promises held slots or partner venues.
- **Target segment:** men 20–30. B2B2C (employer-paid) is the eventual revenue path — not part of this pilot.

## Voice & copy guardrails

Dry, confident, rec-league masculine. Short sentences. Specifics over adjectives ("a pint on Ossington," not "great vibes"). Never earnest-therapeutic, never startup-breathless. The FAQ tone ("Is there even an app? A text thread and a captain, on purpose.") is the register to match.

## Stack

- Next.js 14 (App Router, plain JS/JSX — no TypeScript), React 18
- Postgres via `postgres` (postgres.js) — works with Neon, Supabase, or any `DATABASE_URL`
- Schema auto-creates on first DB touch (`lib/db.js`) — no migrations needed
- Design system lives in `app/globals.css` (bone/pine/hi-vis palette, Big Shoulders + Archivo + IBM Plex Mono). Do not swap fonts or palette without the founder asking.

## Files

- `app/page.jsx` — landing page (client component; form POSTs to `/api/apply`)
- `app/api/apply/route.js` — validates + inserts; honeypot field `website`; duplicate emails return `{ok:true, duplicate:true}`
- `app/admin/page.jsx` — applicant table + counts by activity/day/location (for crew-building)
- `app/api/export/route.js` — CSV download
- `middleware.js` — HTTP Basic auth on `/admin` and `/api/export`
- `lib/db.js` — client + schema bootstrap

## Environment variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (Neon/Supabase/local) |
| `ADMIN_USER` | Basic-auth username for /admin |
| `ADMIN_PASSWORD` | Basic-auth password for /admin (make it long) |

Copy `.env.example` → `.env.local` for local dev.

## Deploy runbook (recommended: Vercel + Neon, $0)

1. `git init && git add -A && git commit -m "Regulars pilot site"` — push to a new GitHub repo (or use `vercel` CLI directly).
2. In Vercel: **Add New Project** → import the repo. Framework auto-detects Next.js. Don't deploy yet.
3. **Storage/Marketplace → Neon (Postgres)** → create free database → connect to the project. This injects `DATABASE_URL` automatically. (Alt: create a Supabase project and paste its connection string as `DATABASE_URL` — use the "Transaction pooler" URI.)
4. Project → Settings → Environment Variables: add `ADMIN_USER` and `ADMIN_PASSWORD`.
5. Deploy. No migration step — the table creates itself on the first form submission or admin visit.
6. Point a domain if desired (Vercel → Domains). Update the footer email when a real inbox exists.

## Post-deploy verification checklist

- [ ] Submit a test application on the live URL → success card appears
- [ ] Submit the same email again → "Already on the list." (duplicate path)
- [ ] Visit `/admin` → browser auth prompt → table shows the test row + stats
- [ ] `/api/export` downloads a CSV containing the row
- [ ] Delete the test row when done: run in the DB console — `DELETE FROM applications WHERE email = '<your test email>';`
- [ ] Check the page on a phone (most traffic will be mobile via Reddit/Instagram)

## Backlog (in priority order — confirm with founder before building)

1. Email notification to founder on each new application (Resend free tier; simple fetch in `route.js` after insert)
2. Basic rate limiting on `/api/apply` (per-IP, in-memory or Upstash)
3. OG image for link previews (poster-style: pine bg, "SAME CREW. SAME NIGHT. EVERY WEEK.")
4. `/thanks` referral ask on the success state ("Know a guy? Send him the link.")
5. Waitlist state: when 48 accepted, flip hero CTA copy to waitlist mode (env flag)

## What NOT to build

Feeds, matching algorithms, chat, profiles, payments, mobile app. The pilot proves week-six retention with humans first. Software earns its way in only after that number exists.
