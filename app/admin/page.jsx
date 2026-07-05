import { db } from "../../lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Regulars — Admin", robots: { index: false } };

function tally(rows, pick) {
  const counts = {};
  for (const row of rows) {
    for (const v of pick(row)) counts[v] = (counts[v] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export default async function Admin() {
  const sql = await db();
  const rows = await sql`SELECT * FROM applications ORDER BY created_at DESC`;

  const byAct = tally(rows, (r) => r.activities);
  const byNight = tally(rows, (r) => r.nights);
  const byHood = tally(rows, (r) => [r.neighbourhood]);

  const box = {
    border: "2px solid #153B2E",
    background: "#FAF8F1",
    padding: "16px 18px",
  };
  const kicker = {
    fontFamily: "var(--mono)",
    fontSize: 11,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    color: "#1F5443",
    marginBottom: 10,
  };

  return (
    <main style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="sec-label">Pilot 001 · Admin</p>
      <h1
        style={{
          fontFamily: "var(--disp)",
          fontWeight: 900,
          textTransform: "uppercase",
          fontSize: "clamp(40px,6vw,64px)",
          lineHeight: 0.95,
        }}
      >
        {rows.length} application{rows.length === 1 ? "" : "s"}
      </h1>

      <p style={{ margin: "14px 0 28px" }}>
        <a
          href="/api/export"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#D94A0E",
          }}
        >
          ↓ Download CSV
        </a>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 36,
        }}
      >
        <div style={box}>
          <p style={kicker}>By activity</p>
          {byAct.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 13, padding: "4px 0" }}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
          {byAct.length === 0 && <p style={{ fontFamily: "var(--mono)", fontSize: 12 }}>—</p>}
        </div>
        <div style={box}>
          <p style={kicker}>By night</p>
          {byNight.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 13, padding: "4px 0" }}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
          {byNight.length === 0 && <p style={{ fontFamily: "var(--mono)", fontSize: 12 }}>—</p>}
        </div>
        <div style={box}>
          <p style={kicker}>By neighbourhood</p>
          {byHood.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 13, padding: "4px 0", gap: 12 }}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
          {byHood.length === 0 && <p style={{ fontFamily: "var(--mono)", fontSize: 12 }}>—</p>}
        </div>
      </div>

      <div style={{ overflowX: "auto", border: "2px solid #153B2E" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900, fontSize: 13.5, background: "#FAF8F1" }}>
          <thead>
            <tr>
              {["#", "Name", "Email", "Phone", "Age", "Neighbourhood", "Nights", "Activities", "Applied"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    background: "#153B2E",
                    color: "#F2EFE6",
                    padding: "10px 12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(21,59,46,.22)" }}>
                <td style={{ padding: "10px 12px", fontFamily: "var(--mono)" }}>{r.id}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.first_name}</td>
                <td style={{ padding: "10px 12px" }}>{r.email}</td>
                <td style={{ padding: "10px 12px" }}>{r.phone || "—"}</td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{r.age_band}</td>
                <td style={{ padding: "10px 12px" }}>{r.neighbourhood}</td>
                <td style={{ padding: "10px 12px", fontFamily: "var(--mono)", fontSize: 12 }}>{r.nights.join(" ")}</td>
                <td style={{ padding: "10px 12px", fontFamily: "var(--mono)", fontSize: 12 }}>{r.activities.join(", ")}</td>
                <td style={{ padding: "10px 12px", fontFamily: "var(--mono)", fontSize: 12, whiteSpace: "nowrap" }}>
                  {new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 24, fontFamily: "var(--mono)", fontSize: 13 }}>
                  No applications yet. Share the link.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
